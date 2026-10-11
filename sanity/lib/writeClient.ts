// sanity/lib/writeClient.ts
// Server-only write client — uses SANITY_API_TOKEN (write access), unlike
// the public read client in client.ts. Never import this from a Client
// Component; it's only safe inside API routes / Server Components, where
// process.env.SANITY_API_TOKEN is actually available (it's not
// NEXT_PUBLIC_-prefixed, so it never reaches the browser).

import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
