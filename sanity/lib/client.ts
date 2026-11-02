// sanity/lib/client.ts
// The read client used by the Next.js site (not the Studio) to fetch
// published content, e.g. in app/projects/page.tsx.

import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Not the CDN: Next.js already caches every page, so Sanity is only asked
  // when a page is rebuilt — and right after a publish (see
  // app/api/revalidate/route.ts) the CDN can still be serving the old copy.
  useCdn: false,
});
