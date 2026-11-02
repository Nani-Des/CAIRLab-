// app/api/ai-for-professionals/broadcast/route.ts
// Sends a Broadcast Message (sanity/schemaTypes/aiProBroadcast.ts) to the
// chosen groups of AI for Professionals registrants, via the CAIRLab Gmail.
//
// Called by the Studio's "Send to recipients" button, which first marks the
// published message as "queued" — something only a logged-in Studio user can
// do. This route only acts on queued messages and claims them atomically
// (ifRevisionId), so a message can't be sent twice or sent by an outsider.
//
// Recipients go in BCC batches so nobody sees anyone else's address and a
// large audience doesn't take minutes to send.

import { NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/writeClient';
import { emailButton, escapeHtml, mailerConfigured, sendMail } from '@/lib/mailer';
import { audienceEmailsQuery, uniqueEmails } from '@/lib/aiProAudience';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BATCH_SIZE = 40;

type Broadcast = {
  _id: string;
  _rev: string;
  status?: string;
  subject?: string;
  message?: string;
  audience?: string[];
  buttonText?: string;
  buttonUrl?: string;
};

function messageHtml(b: Broadcast) {
  const paragraphs = (b.message || '')
    .trim()
    .split(/\n\s*\n/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
    .join('');
  const button = b.buttonText && b.buttonUrl ? emailButton(escapeHtml(b.buttonUrl), escapeHtml(b.buttonText)) : '';
  return `<p>Dear participant,</p>${paragraphs}${button}`;
}

export async function POST(request: Request) {
  if (!process.env.SANITY_API_TOKEN || !mailerConfigured()) {
    return NextResponse.json({ error: 'Email sending is not configured on the server.' }, { status: 500 });
  }

  let id = '';
  try {
    id = String((await request.json()).id || '');
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!id || id.startsWith('drafts.')) {
    return NextResponse.json({ error: 'Publish the message before sending it.' }, { status: 400 });
  }

  const b = await writeClient.fetch<Broadcast | null>(
    '*[_type == "aiProBroadcast" && _id == $id][0]{ _id, _rev, status, subject, message, audience, buttonText, buttonUrl }',
    { id }
  );
  if (!b) return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
  if (b.status !== 'queued') {
    return NextResponse.json({ error: b.status === 'sent' ? 'This message has already been sent.' : 'This message is not queued for sending.' }, { status: 409 });
  }
  if (!b.subject || !b.message || !b.audience?.length) {
    return NextResponse.json({ error: 'The message needs a subject, a message and at least one group.' }, { status: 400 });
  }

  // Claim it: only one request can move it from queued -> sending.
  try {
    await writeClient.patch(b._id).ifRevisionId(b._rev).set({ status: 'sending' }).unset(['error']).commit();
  } catch {
    return NextResponse.json({ error: 'This message is already being sent.' }, { status: 409 });
  }

  try {
    const query = audienceEmailsQuery(b.audience);
    const emails = uniqueEmails(query ? await writeClient.fetch<(string | null)[]>(query) : []);
    if (emails.length === 0) {
      await writeClient.patch(b._id).set({ status: 'failed', error: 'Nobody has registered in the selected groups yet.' }).commit();
      return NextResponse.json({ error: 'Nobody has registered in the selected groups yet.' }, { status: 400 });
    }

    const html = messageHtml(b);
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      await sendMail({ to: process.env.GMAIL_USER!, bcc: emails.slice(i, i + BATCH_SIZE), subject: b.subject, html });
    }

    await writeClient
      .patch(b._id)
      .set({ status: 'sent', sentAt: new Date().toISOString(), recipientCount: emails.length })
      .commit();
    return NextResponse.json({ ok: true, recipients: emails.length });
  } catch (err) {
    console.error('Broadcast send failed:', err);
    const message = err instanceof Error ? err.message : String(err);
    await writeClient.patch(b._id).set({ status: 'failed', error: message.slice(0, 500) }).commit().catch(() => {});
    return NextResponse.json({ error: 'Sending failed. Some recipients may not have received it — see the error in Studio.' }, { status: 500 });
  }
}
