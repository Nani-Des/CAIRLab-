// scripts/seed-home-stats.mjs
// Loads the homepage's 4 "impact" stat cards into Sanity as the singleton
// homeStats document. Safe to re-run — it replaces the same document ID
// each time. Run with: node scripts/seed-home-stats.mjs

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env.local');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: '2025-01-01', token, useCdn: false });

const STATS = [
  { _type: 'stat', _key: 'years-of-research', value: '9+', label: 'Years of Research', icon: 'calendar-days' },
  { _type: 'stat', _key: 'active-research-labs', value: '3', label: 'Active Research Labs', icon: 'flask' },
  { _type: 'stat', _key: 'expert-researchers', value: '17', label: 'Expert Researchers', icon: 'users' },
  { _type: 'stat', _key: 'international-partners', value: '2', label: 'International Partners', icon: 'globe' },
];

async function run() {
  console.log('Creating Homepage Stats document...');
  await client.createOrReplace({ _id: 'homeStats', _type: 'homeStats', stats: STATS });
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
