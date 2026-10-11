// app/api/newsletter/route.ts
// Handles newsletter signups from the footer form. Saves the email as a
// Sanity document (so you have a real, exportable subscriber list — see
// sanity/schemaTypes/newsletterSubscriber.ts) and, if Resend is configured
// (it already is, for the contact form), sends a quick notification email
// so you know in real time when someone subscribes.

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { writeClient } from '@/sanity/lib/writeClient';

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = (body.email || '').trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  if (!process.env.SANITY_API_TOKEN) {
    console.error('Newsletter signup: missing SANITY_API_TOKEN in .env.local');
    return NextResponse.json({ error: 'Signups are not configured yet. Please try again later.' }, { status: 500 });
  }

  try {
    // One document per email, keyed deterministically — signing up twice
    // with the same address just updates subscribedAt rather than
    // creating a duplicate document.
    const docId = `newsletter-${Buffer.from(email.toLowerCase()).toString('base64url')}`;
    await writeClient.createOrReplace({
      _id: docId,
      _type: 'newsletterSubscriber',
      email,
      subscribedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Newsletter signup: failed to save to Sanity:', err);
    return NextResponse.json({ error: 'Failed to subscribe. Please try again later.' }, { status: 500 });
  }

  // Best-effort notification email — a signup should still succeed even if
  // this fails (e.g. Resend not configured), so errors here are logged only.
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (apiKey && toEmail) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: 'CAIRLab Website <onboarding@resend.dev>',
        to: toEmail,
        subject: '[CAIRLab] New newsletter subscriber',
        text: `New newsletter signup: ${email}`,
      });
    } catch (err) {
      console.error('Newsletter signup: notification email failed:', err);
    }
  }

  return NextResponse.json({ ok: true });
}
