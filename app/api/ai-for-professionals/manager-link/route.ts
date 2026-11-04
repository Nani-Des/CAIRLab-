// app/api/ai-for-professionals/manager-link/route.ts
// A partner organisation's manager picks their company and types their email.
// If that email is the partner's contact (or another listed manager email),
// we email them a secure 24-hour link to view and add nominees
// (app/initiatives/ai-for-professionals/manage). The link — not the typed
// email — is what proves they control that inbox.

import { NextResponse } from 'next/server';
import { checkManager } from '@/lib/aiProPartners';
import { createManagerToken } from '@/lib/aiProManagerToken';
import { emailButton, escapeHtml, mailerConfigured, sendMail } from '@/lib/mailer';
import { EMAIL_PATTERN, PROGRAMME_CONTACT, PROGRAMME_NAME, PROGRAMME_PATH } from '@/lib/aiForProfessionals';
import { getAiProSettings } from '@/lib/aiProSettings';
import { SITE_URL } from '@/lib/seo';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!process.env.SANITY_API_TOKEN || !mailerConfigured()) {
    return NextResponse.json({ error: 'This service is not available yet. Please try again later.' }, { status: 500 });
  }
  const settings = await getAiProSettings();
  if (!settings.registrationOpen) {
    return NextResponse.json({ error: settings.closedMessage }, { status: 403 });
  }

  let body: { company?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const company = String(body.company || '').trim().slice(0, 200);
  const email = String(body.email || '').trim().slice(0, 200);
  if (!company) return NextResponse.json({ error: 'Please type or select your company.' }, { status: 400 });
  if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });

  const contactHelp = `please contact ${PROGRAMME_CONTACT.name} at ${PROGRAMME_CONTACT.email} or ${PROGRAMME_CONTACT.phone}`;
  try {
    const check = await checkManager(company, email);
    if (check.status === 'unknownCompany') {
      return NextResponse.json({ error: `We couldn't find "${company}" among our partner organisations. Please pick your company from the list.` }, { status: 404 });
    }
    if (check.status === 'noContactEmail') {
      return NextResponse.json({ error: `We don't have a manager email on file for ${check.partner} yet — ${contactHelp} so we can add it.` }, { status: 403 });
    }
    if (check.status === 'notManager') {
      return NextResponse.json({ error: `This email isn't registered as a manager contact for ${check.partner}. Use the email your organisation gave the programme, or ${contactHelp}.` }, { status: 403 });
    }

    const link = `${SITE_URL}${PROGRAMME_PATH}/manage?token=${encodeURIComponent(createManagerToken(check.partnerId, email))}`;
    await sendMail({
      to: email,
      subject: `Manage your nominations – ${PROGRAMME_NAME}`,
      html: `<p>Hello,</p>
        <p>Use the secure link below to view <strong>${escapeHtml(check.partner)}</strong>'s nominated staff for the
        ${PROGRAMME_NAME} programme and nominate more people. The link works for 24 hours.</p>
        ${emailButton(link, 'View & nominate staff →')}
        <p style="color:#64748B;font-size:13px">If you didn't ask for this, you can ignore this email — nobody can change your nominations without this link.</p>`,
    });
    return NextResponse.json({ ok: true, partner: check.partner });
  } catch (err) {
    console.error('AI for Professionals: manager link failed:', err);
    return NextResponse.json({ error: 'Something went wrong sending your link. Please try again later.' }, { status: 500 });
  }
}
