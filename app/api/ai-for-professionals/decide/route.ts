// app/api/ai-for-professionals/decide/route.ts
// Records an employer's Approve / Reject decision from the approval page
// (app/initiatives/ai-for-professionals/approve) and emails the employee the
// outcome. Each approval link only works once: after a decision the
// registration is no longer "pending", so the same link can't change it again.

import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/writeClient';
import { emailButton, escapeHtml, sendMail } from '@/lib/mailer';
import { SITE_URL } from '@/lib/seo';
import { PROGRAMME_NAME, PROGRAMME_PATH } from '@/lib/aiForProfessionals';

export const runtime = 'nodejs';

type Registration = { _id: string; _rev: string; status: string; fullName: string; email: string };

export async function POST(request: Request) {
  let body: { token?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const token = String(body.token || '');
  const action = body.action;
  if (!token || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const hash = createHash('sha256').update(token).digest('hex');
  const reg = await writeClient.fetch<Registration | null>(
    '*[_type == "aiProRegistration" && approvalTokenHash == $hash][0]{ _id, _rev, status, fullName, email }',
    { hash }
  );
  if (!reg) return NextResponse.json({ error: 'This approval link is not valid.' }, { status: 404 });
  if (reg.status !== 'pending') {
    return NextResponse.json({ error: `This registration has already been ${reg.status}.` }, { status: 409 });
  }

  const approved = action === 'approve';
  try {
    // ifRevisionId: if two clicks race, only the first one wins.
    await writeClient
      .patch(reg._id)
      .ifRevisionId(reg._rev)
      .set({ status: approved ? 'approved' : 'rejected', decidedAt: new Date().toISOString() })
      .commit();
  } catch (err) {
    console.error('AI for Professionals: failed to save decision:', err);
    return NextResponse.json({ error: 'Something went wrong. Please reload the page and try again.' }, { status: 500 });
  }

  try {
    await sendMail({
      to: reg.email,
      subject: approved ? `You're approved – ${PROGRAMME_NAME}` : `Update on your registration – ${PROGRAMME_NAME}`,
      html: approved
        ? `<p>Dear ${escapeHtml(reg.fullName)},</p>
           <p>Good news! Your employer has <strong>approved</strong> your registration for the ${PROGRAMME_NAME} programme.</p>
           <p>We'll be in touch shortly with the next steps. In the meantime you can read more about the programme here:</p>
           ${emailButton(`${SITE_URL}${PROGRAMME_PATH}`, 'About the programme →')}`
        : `<p>Dear ${escapeHtml(reg.fullName)},</p>
           <p>Unfortunately your employer did not approve your registration for the ${PROGRAMME_NAME} programme at this time.
           If you think this is a mistake, please speak with your employer.</p>`,
    });
  } catch (err) {
    console.error('AI for Professionals: decision email to employee failed:', err);
  }

  return NextResponse.json({ ok: true, name: reg.fullName, status: approved ? 'approved' : 'rejected' });
}
