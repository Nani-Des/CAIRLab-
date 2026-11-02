// app/api/ai-for-professionals/register/route.ts
// Saves an AI for Professionals registration to Sanity and sends the emails:
//  - Employer: saved as "employer" + thank-you email.
//  - Graduate / tertiary student: saved as "applied" + confirmation email.
//  - Employee: saved as "pending", their employer/manager gets an email with
//    a single-use approval link (and, if their organisation hasn't registered
//    yet, an invitation to register it too), and the employee is told their
//    application is pending.
// The approval link's code is only stored as a SHA-256 hash.

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/writeClient';
import { emailButton, escapeHtml, mailerConfigured, sendMail } from '@/lib/mailer';
import { SITE_URL } from '@/lib/seo';
import { getAiProSettings } from '@/lib/aiProSettings';
import {
  COMPANY_SIZES,
  EMAIL_PATTERN,
  GENDERS,
  NOMINATION_FORM_URL,
  QUALIFICATIONS,
  STUDY_STATUSES,
  PROGRAMME_NAME,
  PROGRAMME_PATH,
  REGISTRATION_ID_PREFIX,
  TRACKS,
} from '@/lib/aiForProfessionals';

export const runtime = 'nodejs';

type Body = Record<string, unknown>;

// Our emails come from a Gmail address, so they sometimes land in spam.
const spamTip = (text: string) =>
  `<p style="margin-top:20px;padding:12px 14px;border-radius:8px;background:#FEF3C7;color:#92400E;font-size:14px">📬 ${text}</p>`;

const str = (body: Body, key: string, max = 200) => String(body[key] ?? '').trim().slice(0, max);
const isTrack = (value: string) => (TRACKS as readonly string[]).includes(value);

export async function POST(request: Request) {
  if (!process.env.SANITY_API_TOKEN || !mailerConfigured()) {
    console.error('AI for Professionals: missing SANITY_API_TOKEN, GMAIL_USER or GMAIL_APP_PASSWORD');
    return NextResponse.json({ error: 'Registration is not open yet. Please try again later.' }, { status: 500 });
  }

  const settings = await getAiProSettings();
  if (!settings.registrationOpen) {
    return NextResponse.json({ error: settings.closedMessage }, { status: 403 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot — a field hidden from people that only bots fill in.
  if (str(body, 'website')) return NextResponse.json({ ok: true });

  const role = str(body, 'role');
  const fullName = str(body, 'fullName');
  const email = str(body, 'email');
  const organisation = str(body, 'organisation');

  if (body.consent !== 'on' && body.consent !== true) {
    return NextResponse.json({ error: 'Please agree to the data processing terms.' }, { status: 400 });
  }
  if (!fullName || !organisation || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'Please fill in all required fields with a valid email address.' }, { status: 400 });
  }

  const base = {
    _id: `${REGISTRATION_ID_PREFIX}${randomUUID()}`,
    _type: 'aiProRegistration',
    fullName,
    email,
    phone: str(body, 'phone', 40),
    organisation,
    consentGiven: true,
    submittedAt: new Date().toISOString(),
  };

  if (role === 'employer') {
    const skills = Array.isArray(body.skillsNeeded) ? body.skillsNeeded.map(String).filter(isTrack) : [];
    const companySize = str(body, 'companySize');
    try {
      await writeClient.create({
        ...base,
        role: 'employer',
        status: 'employer',
        jobTitle: str(body, 'jobTitle'),
        sector: str(body, 'sector'),
        companySize: (COMPANY_SIZES as readonly string[]).includes(companySize) ? companySize : '',
        skillsNeeded: skills,
        staffToNominate: str(body, 'staffToNominate', 20),
        skillsGaps: str(body, 'skillsGaps', 3000),
      });
    } catch (err) {
      console.error('AI for Professionals: failed to save employer registration:', err);
      return NextResponse.json({ error: 'Failed to submit. Please try again later.' }, { status: 500 });
    }

    try {
      await sendMail({
        to: email,
        subject: `Thank you for registering – ${PROGRAMME_NAME}`,
        html: `<p>Dear ${escapeHtml(fullName)},</p>
          <p>Thank you for registering <strong>${escapeHtml(organisation)}</strong> for the ${PROGRAMME_NAME} programme.</p>
          <p><strong>To complete your registration, please use the Nomination Form to nominate the employees you'd like
          to put forward for the training:</strong></p>
          ${emailButton(NOMINATION_FORM_URL, 'Nominate your employees →')}
          <p>When your staff register on our website, they will list your email address and you'll receive a link to
          approve their participation. We will be in touch with next steps.</p>
          ${spamTip('Approval requests from your staff will come from this same address. If one doesn\'t arrive, check your spam or junk folder and mark our emails as "Not spam".')}`,
      });
    } catch (err) {
      // The registration is saved; a missing thank-you email isn't worth failing over.
      console.error('AI for Professionals: employer thank-you email failed:', err);
    }
    return NextResponse.json({ ok: true });
  }

  if (role === 'graduate') {
    const pick = (value: string, allowed: readonly string[]) => (allowed.includes(value) ? value : '');
    const qualification = pick(str(body, 'qualification'), QUALIFICATIONS);
    const studyStatus = pick(str(body, 'studyStatus'), STUDY_STATUSES);
    const track = str(body, 'track');
    const programmeOfStudy = str(body, 'programmeOfStudy');
    const completionYear = str(body, 'completionYear', 4);
    const motivation = str(body, 'motivation', 3000);
    const phone = str(body, 'phone', 40);
    if (!qualification || !studyStatus || !isTrack(track) || !programmeOfStudy || !/^\d{4}$/.test(completionYear) || !motivation || !phone) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
    }
    try {
      await writeClient.create({
        ...base,
        role: 'graduate',
        status: 'applied',
        gender: pick(str(body, 'gender'), GENDERS),
        programmeOfStudy,
        qualification,
        studyStatus,
        completionYear,
        location: str(body, 'location'),
        track,
        motivation,
      });
    } catch (err) {
      console.error('AI for Professionals: failed to save graduate application:', err);
      return NextResponse.json({ error: 'Failed to submit. Please try again later.' }, { status: 500 });
    }

    try {
      await sendMail({
        to: email,
        subject: `Application received – ${PROGRAMME_NAME}`,
        html: `<p>Dear ${escapeHtml(fullName)},</p>
          <p>Thank you for applying to the ${PROGRAMME_NAME} programme (${escapeHtml(track)}).</p>
          <p>We have received your application and will contact you about the next steps in the selection process.</p>
          ${spamTip('Please keep an eye on your spam or junk folder for our updates, and mark our emails as "Not spam".')}`,
      });
    } catch (err) {
      console.error('AI for Professionals: graduate confirmation email failed:', err);
    }
    return NextResponse.json({ ok: true });
  }

  if (role !== 'employee') {
    return NextResponse.json({ error: 'Please choose whether you are an employer or an employee.' }, { status: 400 });
  }

  const employerEmail = str(body, 'employerEmail');
  const track = str(body, 'track');
  if (body.surveyCompleted !== true) {
    return NextResponse.json({ error: 'Please complete the Employees Survey first.' }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(employerEmail)) {
    return NextResponse.json({ error: 'Please enter a valid email address for your employer or line manager.' }, { status: 400 });
  }
  if (employerEmail.toLowerCase() === email.toLowerCase()) {
    return NextResponse.json({ error: "Your employer's email must be different from your own." }, { status: 400 });
  }
  if (!isTrack(track)) {
    return NextResponse.json({ error: 'Please choose a track.' }, { status: 400 });
  }

  const token = randomBytes(32).toString('base64url');
  const doc = {
    ...base,
    role: 'employee',
    status: 'pending',
    jobTitle: str(body, 'jobTitle'),
    track,
    employerEmail,
    surveyCompleted: true,
    approvalTokenHash: createHash('sha256').update(token).digest('hex'),
  };

  try {
    await writeClient.create(doc);
  } catch (err) {
    console.error('AI for Professionals: failed to save employee registration:', err);
    return NextResponse.json({ error: 'Failed to submit. Please try again later.' }, { status: 500 });
  }

  let employerRegistered = false;
  try {
    employerRegistered =
      (await writeClient.fetch<number>(
        'count(*[_type == "aiProRegistration" && role == "employer" && lower(email) == lower($email)])',
        { email: employerEmail }
      )) > 0;
  } catch (err) {
    console.error('AI for Professionals: employer lookup failed:', err);
  }

  const approveUrl = `${SITE_URL}${PROGRAMME_PATH}/approve?token=${token}`;
  const inviteBlock = employerRegistered
    ? ''
    : `<p style="margin-top:24px">Your organisation hasn't registered for the programme yet. You can also tell us about
       your organisation's AI skills needs — it takes about 3 minutes:</p>
       ${emailButton(`${SITE_URL}${PROGRAMME_PATH}?role=employer`, 'Register your organisation →')}`;

  try {
    await sendMail({
      to: employerEmail,
      replyTo: email,
      subject: `Please approve ${fullName}'s registration – ${PROGRAMME_NAME}`,
      html: `<p>Hello,</p>
        <p><strong>${escapeHtml(fullName)}</strong> (${escapeHtml(email)}) of <strong>${escapeHtml(organisation)}</strong>
        has registered for the ${PROGRAMME_NAME} programme (${escapeHtml(track)}) and listed you as their
        employer or line manager.</p>
        <p>Please confirm whether you approve their participation:</p>
        ${emailButton(approveUrl, 'Review &amp; approve →')}
        <p style="color:#64748B;font-size:13px">If you don't know this person, you can reject the request on the same page.</p>
        ${inviteBlock}`,
    });
  } catch (err) {
    // Without this email the registration can never be approved, so undo it
    // and let the employee try again (e.g. after fixing a typo'd address).
    console.error('AI for Professionals: approval email failed:', err);
    await writeClient.delete(doc._id).catch(() => {});
    return NextResponse.json(
      { error: "We couldn't send the approval email to your employer. Please check their email address and try again." },
      { status: 502 }
    );
  }

  try {
    await sendMail({
      to: email,
      subject: `Registration received – ${PROGRAMME_NAME}`,
      html: `<p>Dear ${escapeHtml(fullName)},</p>
        <p>Thank you for registering for the ${PROGRAMME_NAME} programme (${escapeHtml(track)}).</p>
        <p>We've emailed your employer (${escapeHtml(employerEmail)}) to approve your participation.
        <strong>Your application will remain pending until your employer approves it.</strong>
        You'll receive another email as soon as they respond.</p>
        ${spamTip('Not approved yet? Ask your employer to check their spam or junk folder for our approval request, and keep an eye on your own spam folder for our reply.')}`,
    });
  } catch (err) {
    console.error('AI for Professionals: employee confirmation email failed:', err);
  }

  return NextResponse.json({ ok: true });
}
