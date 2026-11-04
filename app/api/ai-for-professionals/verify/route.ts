// app/api/ai-for-professionals/verify/route.ts
// Step 1 for partner staff: checks that the email they typed is on the
// nomination list of the partner organisation they picked (see
// lib/aiProPartners.ts). Only a matching company + email pair gets the
// nominee's details back, so the lists themselves are never exposed.

import { NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/writeClient';
import { emailButton, escapeHtml, mailerConfigured, sendMail } from '@/lib/mailer';
import { SITE_URL } from '@/lib/seo';
import { checkNomination } from '@/lib/aiProPartners';
import { EMAIL_PATTERN, EMPLOYEES_SURVEY_URL, PROGRAMME_NAME, PROGRAMME_PATH } from '@/lib/aiForProfessionals';

// Send the "next steps" email at most once an hour per nominee, so checking
// repeatedly can't be used to flood someone's inbox.
const NEXT_STEPS_EMAIL_COOLDOWN_MS = 60 * 60 * 1000;
import { getAiProSettings } from '@/lib/aiProSettings';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!process.env.SANITY_API_TOKEN) {
    return NextResponse.json({ error: 'Registration is not open yet. Please try again later.' }, { status: 500 });
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

  try {
    const result = await checkNomination(company, email);
    switch (result.status) {
      case 'unknownCompany':
        return NextResponse.json(
          { error: `We couldn't find "${company}" among our partner organisations. Please pick your company from the list — or, if it isn't a partner yet, choose "Not a partner yet" above.`, code: 'unknownCompany' },
          { status: 404 }
        );
      case 'notNominated':
        return NextResponse.json(
          {
            error: `This email isn't on ${result.partner}'s nomination list. Use the exact email your employer nominated you with, or ask your manager to nominate you on this page ("Partner organisation manager").`,
            code: 'notNominated',
          },
          { status: 403 }
        );
      case 'alreadyRegistered':
        return NextResponse.json({ error: 'You have already registered for the programme with this email. We will be in touch.', code: 'alreadyRegistered' }, { status: 409 });
      default: {
        let emailed = false;
        const last = result.nextStepsEmailAt ? Date.parse(result.nextStepsEmailAt) : 0;
        if (mailerConfigured() && Date.now() - last > NEXT_STEPS_EMAIL_COOLDOWN_MS) {
          try {
            await sendMail({
              to: result.nominee.email,
              subject: `Nomination confirmed — finish your registration – ${PROGRAMME_NAME}`,
              html: `<p>Dear ${escapeHtml(result.nominee.fullName || 'participant')},</p>
                <p>Your nomination by <strong>${escapeHtml(result.partner)}</strong> for the ${PROGRAMME_NAME} programme
                is confirmed${result.nominee.track ? ` (${escapeHtml(result.nominee.track)})` : ''}.</p>
                <p><strong>You're not registered yet.</strong> To complete your registration:</p>
                <ol>
                  <li><strong>Check your nomination again</strong> — open the registration page (button below), choose
                  "Partner organisation staff", select ${escapeHtml(result.partner)} and enter this email address
                  (${escapeHtml(result.nominee.email)}).</li>
                  <li><strong>Take the <a href="${EMPLOYEES_SURVEY_URL}">Employees Survey</a></strong>.</li>
                  <li><strong>Fill in your registration details</strong> and submit to finish your registration.</li>
                </ol>
                ${emailButton(`${SITE_URL}${PROGRAMME_PATH}?role=partner`, 'Finish my registration →')}
                <p style="color:#64748B;font-size:13px">You'll get a "You're registered" email once you've finished.</p>`,
            });
            await writeClient
              .patch(result.partnerId)
              .set({ [`nominees[_key=="${result.nomineeKey}"].nextStepsEmailAt`]: new Date().toISOString() })
              .commit();
            emailed = true;
          } catch (err) {
            console.error('AI for Professionals: next-steps email failed:', err);
          }
        }
        return NextResponse.json({ ok: true, partner: result.partner, nominee: result.nominee, emailed });
      }
    }
  } catch (err) {
    console.error('AI for Professionals: nomination check failed:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
