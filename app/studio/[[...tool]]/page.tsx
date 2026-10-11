// app/studio/[[...tool]]/page.tsx
// Embeds the Sanity Studio (content editor) at /studio on this same site —
// no separate app or deployment needed. Requires NEXT_PUBLIC_SANITY_PROJECT_ID
// and NEXT_PUBLIC_SANITY_DATASET (see .env.local.example); without them the
// Studio shows a setup prompt instead of your content.

'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../sanity.config';

export const dynamic = 'force-static';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
