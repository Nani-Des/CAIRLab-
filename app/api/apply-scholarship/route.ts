// app/api/apply-scholarship/route.ts
// Handles submissions from the scholarship application form (including
// uploaded documents) and emails them via Resend to the same inbox as the
// contact form (CONTACT_TO_EMAIL in .env.local).

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

// Resend's request size limit is ~40MB total; keep margin for the email
// body/headers by capping combined attachments below that.
const MAX_TOTAL_ATTACHMENT_BYTES = 35 * 1024 * 1024;

// The form's `accept=".pdf,.doc,.docx"` is only a UI hint — anyone can
// bypass it by choosing "all files", so the real check has to happen here.
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
function hasAllowedExtension(filename: string) {
  const lower = filename.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

const REQUIRED_FIELDS = [
  'firstName', 'lastName', 'email', 'phone', 'nationality',
  'program', 'undergrad', 'gpa', 'researchArea', 'statement',
];
const REQUIRED_FILES = ['personalStatement', 'transcripts', 'certificates', 'recommendations', 'cv'];
const OPTIONAL_FILES = ['publicationsUpload'];

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !toEmail) {
    console.error('Scholarship form: missing RESEND_API_KEY or CONTACT_TO_EMAIL in .env.local');
    return NextResponse.json(
      { error: 'The application form is not configured yet. Please email us directly instead.' },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    const value = form.get(field);
    if (!value || String(value).trim() === '') {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
    }
  }
  const emailValue = String(form.get('email') || '');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(emailValue)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (!form.get('certifyAccurate') || !form.get('agreeDataProcessing')) {
    return NextResponse.json({ error: 'Please confirm both checkboxes before submitting.' }, { status: 400 });
  }
  for (const field of REQUIRED_FILES) {
    const file = form.get(field);
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Please attach all required documents.' }, { status: 400 });
    }
  }
  for (const field of [...REQUIRED_FILES, ...OPTIONAL_FILES]) {
    const file = form.get(field);
    if (file instanceof File && file.size > 0 && !hasAllowedExtension(file.name)) {
      return NextResponse.json(
        { error: `"${file.name}" isn't a supported file type. Please upload a PDF or Word document.` },
        { status: 400 }
      );
    }
  }

  const attachments: { filename: string; content: Buffer }[] = [];
  let totalBytes = 0;
  for (const field of [...REQUIRED_FILES, ...OPTIONAL_FILES]) {
    const file = form.get(field);
    if (file instanceof File && file.size > 0) {
      totalBytes += file.size;
      if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
        return NextResponse.json(
          { error: 'Your attached documents are too large in total. Please reduce file sizes and try again.' },
          { status: 413 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({ filename: file.name || `${field}.pdf`, content: buffer });
    }
  }

  const get = (name: string) => String(form.get(name) || '').trim();

  const summaryLines = [
    `Name: ${get('firstName')} ${get('lastName')}`,
    `Email: ${get('email')}`,
    `Phone: ${get('phone')}`,
    `Nationality: ${get('nationality')}`,
    `Program: ${get('program')}`,
    `Undergraduate Degree: ${get('undergrad')}`,
    get('postgrad') ? `Postgraduate Degree: ${get('postgrad')}` : null,
    `GPA/CGPA: ${get('gpa')}`,
    `Preferred Research Area: ${get('researchArea')}`,
    '',
    'Research Statement:',
    get('statement'),
    get('publications') ? `\nPublications:\n${get('publications')}` : null,
  ].filter((line): line is string => line !== null);

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: 'CAIRLab Scholarships <onboarding@resend.dev>',
      to: toEmail,
      replyTo: get('email'),
      subject: `[Scholarship Application] ${get('firstName')} ${get('lastName')} — ${get('program').toUpperCase()}`,
      text: summaryLines.join('\n'),
      attachments,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to submit application. Please try again later.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Scholarship application send failed:', err);
    return NextResponse.json({ error: 'Failed to submit application. Please try again later.' }, { status: 500 });
  }
}
