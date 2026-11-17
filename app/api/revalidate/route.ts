// app/api/revalidate/route.ts
// Called by a Sanity webhook whenever content is published, updated or
// deleted, so the site's cached pages are rebuilt straight away instead of
// waiting out each page's hourly `revalidate` window. Set up in
// sanity.io/manage > API > Webhooks (URL: https://<site>/api/revalidate,
// POST, with a secret matching SANITY_REVALIDATE_SECRET — see
// .env.local.example). Visitors see the change on their next page load.

import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error('Revalidate webhook: missing SANITY_REVALIDATE_SECRET in .env.local');
    return NextResponse.json({ error: 'Not configured.' }, { status: 500 });
  }

  // parseBody also waits for Sanity's eventual consistency, so the pages
  // rebuilt after this see the new content rather than the old.
  const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret, true);
  if (!isValidSignature) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  // Content shows up across many pages (homepage teasers, listings, detail
  // pages, the sitemap), so rebuild everything rather than guess which.
  revalidatePath('/', 'layout');
  // Also drop cached Sanity reads (site popup, registration settings,
  // partner list) so they're fetched fresh on the next visit.
  revalidateTag('sanity', { expire: 0 });
  return NextResponse.json({ revalidated: true, type: body?._type ?? null });
}
