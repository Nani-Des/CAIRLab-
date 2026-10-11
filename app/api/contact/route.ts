// app/api/contact/route.ts
// Handles submissions from the Contact page form and emails them via
// Resend (https://resend.com). Requires RESEND_API_KEY in .env.local —
// see .env.local.example. CONTACT_TO_EMAIL controls where messages land
// (currently the test inbox while the cairlab.org domain isn't verified
// with Resend yet — switch it to hello@cairlab.org once that's done).

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !toEmail) {
    console.error('Contact form: missing RESEND_API_KEY or CONTACT_TO_EMAIL in .env.local');
    return NextResponse.json(
      { error: 'The contact form is not configured yet. Please email us directly instead.' },
      { status: 500 }
    );
  }

  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Please fill in all fields.' }, { status: 400 });
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      // Resend requires sending FROM a verified domain, or from this
      // shared onboarding@resend.dev test address until cairlab.org is
      // verified in the Resend dashboard.
      from: 'CAIRLab Website <onboarding@resend.dev>',
      to: toEmail,
      replyTo: email,
      subject: `[CAIRLab Contact] ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
        <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send message. Please try again later.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact form send failed:', err);
    return NextResponse.json({ error: 'Failed to send message. Please try again later.' }, { status: 500 });
  }
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
