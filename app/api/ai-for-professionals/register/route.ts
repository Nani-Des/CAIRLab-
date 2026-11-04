// app/api/ai-for-professionals/register/route.ts
// Saves an AI for Professionals registration to Sanity and sends the emails:
//  - Partner staff (role "employee"): only accepted if their company + email
//    match a nomination on a partner organisation (lib/aiProPartners.ts) —
//    the nomination is their employer's approval. Saved as "nominated".
//  - Graduate (multipart form with transcript + CV): saved as "applied"; the
//    documents are emailed to the programme inbox (not stored in Sanity,
//    whose files would be publicly reachable) and the applicant gets a
//    confirmation.
// Organisations that aren't partners yet are pointed to the partnership
// proposal on the page itself and never reach this route.

import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/writeClient';
import { emailButton, escapeHtml, mailerConfigured, sendMail } from '@/lib/mailer';
import { getAiProSettings } from '@/lib/aiProSettings';
import { checkNomination } from '@/lib/aiProPartners';
import {
  DOCUMENT_EXTENSIONS,
  EMAIL_PATTERN,
  GENDERS,
  MAX_DOCUMENT_BYTES,
  MOTIVATION_MAX_WORDS,
  countWords,
  PROGRAMME_NAME,
  QUALIFICATIONS,
  REGISTRATION_ID_PREFIX,
  STUDY_STATUSES,
  TRACKS,
} from '@/lib/aiForProfessionals';
import { SITE_URL } from '@/lib/seo';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Our emails come from a Gmail address, so they sometimes land in spam.
const spamTip = (text: string) =>
  `<p style="margin-top:20px;padding:12px 14px;border-radius:8px;background:#FEF3C7;color:#92400E;font-size:14px">📬 ${text}</p>`;

const isTrack = (value: string) => (TRACKS as readonly string[]).includes(value);
const pick = (value: string, allowed: readonly string[]) => (allowed.includes(value) ? value : '');

export async function POST(request: Request) {
  if (!process.env.SANITY_API_TOKEN || !mailerConfigured()) {
    console.error('AI for Professionals: missing SANITY_API_TOKEN, GMAIL_USER or GMAIL_APP_PASSWORD');
    return NextResponse.json({ error: 'Registration is not open yet. Please try again later.' }, { status: 500 });
  }

  const settings = await getAiProSettings();
  if (!settings.registrationOpen) {
    return NextResponse.json({ error: settings.closedMessage }, { status: 403 });
  }

  // Graduates send a multipart form (with files); partner staff send JSON.
  let fields: Record<string, unknown>;
  let form: FormData | null = null;
  try {
    if ((request.headers.get('content-type') || '').includes('multipart/form-data')) {
      form = await request.formData();
      fields = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string'));
    } else {
      fields = await request.json();
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const str = (key: string, max = 200) => String(fields[key] ?? '').trim().slice(0, max);

  // Honeypot — a field hidden from people that only bots fill in.
  if (str('website')) return NextResponse.json({ ok: true });

  if (fields.consent !== 'on' && fields.consent !== true) {
    return NextResponse.json({ error: 'Please agree to the data processing terms.' }, { status: 400 });
  }

  const role = str('role');
  const fullName = str('fullName');
  const email = str('email');
  if (!fullName || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'Please fill in all required fields with a valid email address.' }, { status: 400 });
  }

  const base = {
    _id: `${REGISTRATION_ID_PREFIX}${randomUUID()}`,
    _type: 'aiProRegistration',
    fullName,
    email,
    phone: str('phone', 40),
    consentGiven: true,
    submittedAt: new Date().toISOString(),
  };

  // ---------------- graduates ----------------
  if (role === 'graduate') {
    const organisation = str('organisation');
    const qualification = pick(str('qualification'), QUALIFICATIONS);
    const studyStatus = pick(str('studyStatus'), STUDY_STATUSES);
    const track = str('track');
    const programmeOfStudy = str('programmeOfStudy');
    const completionYear = str('completionYear', 4);
    const motivation = str('motivation', 6000);
    if (!organisation || !qualification || !studyStatus || !isTrack(track) || !programmeOfStudy || !/^\d{4}$/.test(completionYear) || !motivation || !base.phone) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
    }
    if (countWords(motivation) > MOTIVATION_MAX_WORDS) {
      return NextResponse.json({ error: `Please keep "Why do you want to join" to ${MOTIVATION_MAX_WORDS} words or fewer.` }, { status: 400 });
    }
    // Graduates only — not current students.
    if (Number(completionYear) > new Date().getFullYear()) {
      return NextResponse.json({ error: 'This application is for graduates only. Please enter the year you graduated.' }, { status: 400 });
    }

    // Transcript + CV
    const attachments: { filename: string; content: Buffer }[] = [];
    const fileNames: Record<string, string> = {};
    for (const [key, label] of [['transcript', 'transcript'], ['cv', 'CV']] as const) {
      const file = form?.get(key);
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ error: `Please upload your ${label}.` }, { status: 400 });
      }
      const lower = file.name.toLowerCase();
      if (!DOCUMENT_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
        return NextResponse.json({ error: `Your ${label} must be a PDF or Word document.` }, { status: 400 });
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        return NextResponse.json({ error: `Your ${label} is too large — please keep each file under 4 MB.` }, { status: 413 });
      }
      const safeName = `${key === 'cv' ? 'CV' : 'Transcript'} - ${fullName}${lower.slice(lower.lastIndexOf('.'))}`.replace(/[\\/:*?"<>|]/g, '');
      attachments.push({ filename: safeName, content: Buffer.from(await file.arrayBuffer()) });
      fileNames[key] = file.name.slice(0, 200);
    }

    const inbox = process.env.AIPRO_DOCUMENTS_TO || process.env.GMAIL_USER!;
    const doc = {
      ...base,
      role: 'graduate',
      status: 'applied',
      organisation,
      gender: pick(str('gender'), GENDERS),
      programmeOfStudy,
      qualification,
      studyStatus,
      completionYear,
      location: str('location'),
      track,
      motivation,
      transcriptFileName: fileNames.transcript,
      cvFileName: fileNames.cv,
      documentsSentTo: inbox,
    };

    // Email the documents first: an application without them is incomplete.
    try {
      await sendMail({
        to: inbox,
        replyTo: email,
        subject: `Graduate application: ${fullName} (${track}) – ${PROGRAMME_NAME}`,
        html: `<p><strong>New graduate application</strong></p>
          <p><strong>${escapeHtml(fullName)}</strong> &lt;${escapeHtml(email)}&gt; · ${escapeHtml(base.phone)}<br/>
          ${escapeHtml(qualification)}, ${escapeHtml(programmeOfStudy)} — ${escapeHtml(organisation)} (${escapeHtml(completionYear)})<br/>
          Status: ${escapeHtml(studyStatus)} · Track: ${escapeHtml(track)}</p>
          <p><strong>Why they want to join:</strong><br/>${escapeHtml(motivation).replace(/\n/g, '<br/>')}</p>
          <p>Transcript and CV are attached. The full record is in Studio (AI for Professionals → Graduate applications).</p>`,
        attachments,
      });
    } catch (err) {
      console.error('AI for Professionals: graduate documents email failed:', err);
      return NextResponse.json({ error: "We couldn't send your documents. Please try again in a few minutes." }, { status: 502 });
    }

    try {
      await writeClient.create(doc);
    } catch (err) {
      console.error('AI for Professionals: failed to save graduate application:', err);
      return NextResponse.json({ error: 'Failed to submit. Please try again later.' }, { status: 500 });
    }

    try {
      await sendMail({
        to: email,
        subject: `Application received – ${PROGRAMME_NAME}`,
        html: `<p>Dear ${escapeHtml(fullName)},</p>
          <p>Thank you for applying to the ${PROGRAMME_NAME} programme (${escapeHtml(track)}). We have received your
          application, transcript and CV, and will contact you about the next steps in the selection process.</p>
          ${spamTip('Please keep an eye on your spam or junk folder for our updates, and mark our emails as "Not spam".')}`,
      });
    } catch (err) {
      console.error('AI for Professionals: graduate confirmation email failed:', err);
    }
    return NextResponse.json({ ok: true });
  }

  // ---------------- nominated partner staff ----------------
  if (role !== 'employee') {
    return NextResponse.json({ error: 'Please choose how you are registering.' }, { status: 400 });
  }
  if (fields.surveyCompleted !== true) {
    return NextResponse.json({ error: 'Please complete the Employees Survey first.' }, { status: 400 });
  }
  const track = str('track');
  if (!isTrack(track)) {
    return NextResponse.json({ error: 'Please choose a track.' }, { status: 400 });
  }

  // Never trust the browser: re-check the nomination before saving.
  const check = await checkNomination(str('company'), email).catch(() => null);
  if (!check) return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  if (check.status === 'unknownCompany') return NextResponse.json({ error: 'Please select your company from the partner list.' }, { status: 400 });
  if (check.status === 'notNominated') return NextResponse.json({ error: `This email isn't on ${check.partner}'s nomination list.` }, { status: 403 });
  if (check.status === 'alreadyRegistered') return NextResponse.json({ error: 'You have already registered with this email.' }, { status: 409 });

  try {
    await writeClient.create({
      ...base,
      role: 'employee',
      status: 'nominated',
      organisation: check.partner,
      jobTitle: str('jobTitle'),
      track,
      hub: check.nominee.hub,
      surveyCompleted: true,
    });
  } catch (err) {
    console.error('AI for Professionals: failed to save staff registration:', err);
    return NextResponse.json({ error: 'Failed to submit. Please try again later.' }, { status: 500 });
  }

  try {
    await sendMail({
      to: email,
      subject: `You're registered – ${PROGRAMME_NAME}`,
      html: `<p>Dear ${escapeHtml(fullName)},</p>
        <p>You're now registered for the ${PROGRAMME_NAME} programme (${escapeHtml(track)}), as nominated by
        <strong>${escapeHtml(check.partner)}</strong>.</p>
        <p>We'll be in touch with your training schedule and next steps. In the meantime you can read more about the programme here:</p>
        ${emailButton(`${SITE_URL}/initiatives#ai-for-professionals`, 'About the programme →')}
        ${spamTip('Please keep an eye on your spam or junk folder for our updates, and mark our emails as "Not spam".')}`,
    });
  } catch (err) {
    console.error('AI for Professionals: staff confirmation email failed:', err);
  }

  return NextResponse.json({ ok: true, partner: check.partner });
}
