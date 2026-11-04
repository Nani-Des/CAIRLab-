// lib/aiProManagerToken.ts
// Signed, expiring links that let a partner organisation's manager view and
// change their nominations (app/initiatives/ai-for-professionals/manage).
// The link is emailed to an address on the partner's record, so opening it
// proves the person controls that inbox — typing an email alone wouldn't.
// Stateless: an HMAC over { partner id, email, expiry } with a server-only
// secret, so nothing needs storing and links can't be forged or extended.

import { createHmac, timingSafeEqual } from 'node:crypto';

const LINK_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours

type Payload = { p: string; e: string; x: number };

function key() {
  const secret = process.env.AIPRO_LINK_SECRET || process.env.SANITY_API_TOKEN;
  if (!secret) throw new Error('No secret available for signing manager links');
  return createHmac('sha256', 'aipro-manager-link').update(secret).digest();
}

const sign = (data: string) => createHmac('sha256', key()).update(data).digest('base64url');

export function createManagerToken(partnerId: string, email: string) {
  const payload: Payload = { p: partnerId, e: email.toLowerCase(), x: Date.now() + LINK_LIFETIME_MS };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${data}.${sign(data)}`;
}

export function readManagerToken(token: string | null | undefined): { partnerId: string; email: string } | null {
  if (!token || !token.includes('.')) return null;
  const [data, mac] = token.split('.');
  const expected = sign(data);
  if (mac.length !== expected.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as Payload;
    if (!payload.p || !payload.e || Date.now() > payload.x) return null;
    return { partnerId: payload.p, email: payload.e };
  } catch {
    return null;
  }
}
