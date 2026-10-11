// sanity/lib/client.ts
// The read client used by the Next.js site (not the Studio) to fetch
// published content, e.g. in app/projects/page.tsx.

import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // fast, cached reads — fine for public content like this
});
