// app/api/send-newsletter/route.ts
// Sends a message to every saved newsletter subscriber. Password-gated
// (see NEWSLETTER_ADMIN_PASSWORD in .env.local) since there's no
// user-account system on this site to otherwise protect it.
//
// IMPORTANT LIMITATION: Resend's free tier only lets you send FROM the
// shared onboarding@resend.dev address, and — until cairlab.org (or
// whatever domain you use) is verified in Resend — it only lets you send
// TO the email address your Resend account itself was signed up with.
// Until that's done, sends to any other subscriber address will fail; this
// route reports exactly which addresses succeeded and which didn't rather
// than pretending it worked.

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { writeClient } from '@/sanity/lib/writeClient';

export const runtime = 'nodejs';

// Basic brute-force throttling on the password check. This is in-memory,
// so it only protects a single running server process — on serverless
// hosting (e.g. Vercel, where each request can hit a different instance)
// it offers much weaker protection, since attempts spread across
// instances don't share this counter. A real fix needs a shared store
// (Redis / Vercel KV) — see DEPLOYMENT.md §5. Until then, a strong random
// NEWSLETTER_ADMIN_PASSWORD (already set) is the actual line of defense;
// this is a second layer, not a substitute for that.
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes
let failedAttempts = 0;
let lockedUntil = 0;

export async function POST(request: Request) {
  let body: { password?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (Date.now() < lockedUntil) {
    const minutesLeft = Math.ceil((lockedUntil - Date.now()) / 60000);
    return NextResponse.json(
      { error: `Too many incorrect attempts. Try again in ${minutesLeft} minute(s).` },
      { status: 429 }
    );
  }

  const adminPassword = process.env.NEWSLETTER_ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('send-newsletter: missing NEWSLETTER_ADMIN_PASSWORD in .env.local');
    return NextResponse.json({ error: 'This feature is not configured yet.' }, { status: 500 });
  }
  if (body.password !== adminPassword) {
    failedAttempts += 1;
    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      lockedUntil = Date.now() + LOCKOUT_MS;
      failedAttempts = 0;
    }
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }
  failedAttempts = 0;

  const subject = (body.subject || '').trim();
  const message = (body.message || '').trim();
  if (!subject || !message) {
    return NextResponse.json({ error: 'Please fill in both the subject and the message.' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('send-newsletter: missing RESEND_API_KEY in .env.local');
    return NextResponse.json({ error: 'Email sending is not configured yet.' }, { status: 500 });
  }

  let subscribers: { email: string }[] = [];
  try {
    subscribers = await writeClient.fetch(`*[_type == "newsletterSubscriber"]{ email }`);
  } catch (err) {
    console.error('send-newsletter: failed to fetch subscribers:', err);
    return NextResponse.json({ error: 'Could not load the subscriber list.' }, { status: 500 });
  }

  if (subscribers.length === 0) {
    return NextResponse.json({ error: 'There are no subscribers yet.' }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  const htmlMessage = message.split('\n').map((line) => `<p>${line}</p>`).join('');

  const results: { email: string; ok: boolean; error?: string }[] = [];
  for (const { email } of subscribers) {
    try {
      const { error } = await resend.emails.send({
        from: 'CAIRLab <onboarding@resend.dev>',
        to: email,
        subject,
        html: `${htmlMessage}<hr /><p style="color:#888;font-size:12px">You're receiving this because you subscribed at the CAIRLab website.</p>`,
        text: message,
      });
      results.push({ email, ok: !error, error: error?.message });
    } catch (err) {
      results.push({ email, ok: false, error: err instanceof Error ? err.message : 'Unknown error' });
    }
    // Small delay between sends to stay comfortably under Resend's rate limit.
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  return NextResponse.json({
    ok: true,
    total: subscribers.length,
    sent,
    failed: failed.length,
    failedDetails: failed,
  });
}
