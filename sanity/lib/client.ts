// sanity/lib/client.ts
// The read client used by the Next.js site (not the Studio) to fetch
// published content, e.g. in app/projects/page.tsx.

import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Sanity's CDN: reads count against the (much larger) API CDN allowance
  // instead of the API Requests quota, which the site was close to using up.
  // The CDN is purged when content is published, and the revalidate webhook
  // (app/api/revalidate/route.ts) waits for that before rebuilding pages.
  useCdn: true,
});
