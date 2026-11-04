// app/api/ai-for-professionals/nominees/route.ts
// Lets a partner organisation's manager add nominees from the manage page
// (app/initiatives/ai-for-professionals/manage); removing one is done by the
// programme team in Studio. Every request carries the signed link token
// (lib/aiProManagerToken.ts), which says which partner it's for — so a
// manager can only ever change their own list.
// Changes go straight into the partner's document in Sanity.

import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/writeClient';
import { readManagerToken } from '@/lib/aiProManagerToken';
import { getManagedPartner } from '@/lib/aiProPartners';
import { emailButton, escapeHtml, mailerConfigured, sendMail } from '@/lib/mailer';
import { EMAIL_PATTERN, HUBS, PROGRAMME_NAME, PROGRAMME_PATH, TRACKS, nominationTrackLabel } from '@/lib/aiForProfessionals';
import { SITE_URL } from '@/lib/seo';

export const runtime = 'nodejs';

type Body = Record<string, unknown>;

export async function POST(request: Request) {
  if (!process.env.SANITY_API_TOKEN) {
    return NextResponse.json({ error: 'This service is not available yet.' }, { status: 500 });
  }
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const auth = readManagerToken(String(body.token || ''));
  if (!auth) {
    return NextResponse.json({ error: 'This link has expired. Please request a new one from the registration page.' }, { status: 401 });
  }
  const str = (key: string, max = 200) => String(body[key] ?? '').trim().slice(0, max);

  const partner = await getManagedPartner(auth.partnerId);
  if (!partner) return NextResponse.json({ error: 'Organisation not found.' }, { status: 404 });

  try {
    if (body.action === 'add') {
      const fullName = str('fullName');
      const email = str('email').toLowerCase();
      const track = str('track');
      const hub = str('hub');
      if (!fullName || !EMAIL_PATTERN.test(email)) {
        return NextResponse.json({ error: "Please enter the nominee's full name and a valid email address." }, { status: 400 });
      }
      if (!(TRACKS as readonly string[]).includes(track)) return NextResponse.json({ error: 'Please choose a track.' }, { status: 400 });
      if (hub && !(HUBS as readonly string[]).includes(hub)) return NextResponse.json({ error: 'Please choose a hub.' }, { status: 400 });

      const elsewhere = await writeClient.fetch<string | null>(
        '*[_type == "aiProPartner" && !(_id in path("drafts.**")) && count(nominees[lower(email) == $email]) > 0][0].name',
        { email }
      );
      if (elsewhere) {
        return NextResponse.json(
          { error: elsewhere === partner.name ? 'This person is already on your nomination list.' : 'This email is already nominated by another organisation.' },
          { status: 409 }
        );
      }

      await writeClient
        .patch(auth.partnerId)
        .setIfMissing({ nominees: [] })
        .append('nominees', [
          {
            _key: randomUUID().slice(0, 12),
            _type: 'nominee',
            fullName,
            email,
            phone: str('phone', 40),
            jobTitle: str('jobTitle'),
            track: nominationTrackLabel(track),
            hub,
            addedBy: auth.email,
            addedAt: new Date().toISOString(),
          },
        ])
        .commit();

      // Let the nominee know they can now register (best effort; awaited so
      // it isn't cut off when the request finishes on serverless hosts).
      if (mailerConfigured()) {
        await sendMail({
          to: email,
          replyTo: auth.email,
          subject: `You've been nominated – ${PROGRAMME_NAME}`,
          html: `<p>Dear ${escapeHtml(fullName)},</p>
            <p><strong>${escapeHtml(partner.name)}</strong> has nominated you for the ${PROGRAMME_NAME} programme
            (${escapeHtml(track)}) — 160 hours of free, practical AI training.</p>
            <p>Please complete your registration: choose <strong>"Partner organisation staff"</strong>, select
            ${escapeHtml(partner.name)} and use this email address (${escapeHtml(email)}).</p>
            ${emailButton(`${SITE_URL}${PROGRAMME_PATH}?role=partner`, 'Register now →')}`,
        }).catch((err) => console.error('AI for Professionals: nominee invitation email failed:', err));
      }
    } else {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }
  } catch (err) {
    console.error('AI for Professionals: nominee change failed:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  const updated = await getManagedPartner(auth.partnerId);
  return NextResponse.json({ ok: true, nominees: updated?.nominees || [] });
}
