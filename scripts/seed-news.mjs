// scripts/seed-news.mjs
// One-time migration: loads the 3 hardcoded homepage news items into Sanity
// as real documents. Run once with: node scripts/seed-news.mjs
// Safe to re-run — it replaces the same 3 known document IDs each time.

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

const NEWS = [
  {
    _id: 'news-annual-symposium',
    title: 'CAIRLAB hosts annual symposium to forge collaborative AI and robotics frontiers',
    date: '2026-08-20',
    category: 'Events',
    author: 'CAIRLab Communications',
    tags: ['Partnership', 'Researchers', 'Event'],
    excerpt:
      'Researchers, partners, and delegates gathered for a day of talks and workshops on the future of collaborative AI and robotics research.',
  },
  {
    _id: 'news-delegation-visit',
    title: 'Technology delegation visits CAIRLAB to examine advancements in intelligent automation',
    date: '2026-08-05',
    category: 'Partnership',
    author: 'CAIRLab Communications',
    tags: ['Delegation', 'Innovation', 'Training'],
    excerpt:
      'A visiting technology delegation toured CAIRLAB\'s facilities to see recent advances in intelligent automation research firsthand.',
  },
  {
    _id: 'news-farleaf-training',
    title: 'Research fellows convene for specialized technical training and collaborative framework sessions',
    date: '2026-07-22',
    category: 'Training',
    author: 'CAIRLab Communications',
    tags: ['FAR-LeaF', 'Leadership', 'Initiative'],
    excerpt:
      'FAR-LeaF fellows joined CAIRLAB for a series of technical training sessions and collaborative framework workshops.',
  },
];

async function run() {
  for (const post of NEWS) {
    console.log(`Creating document: ${post.title}`);
    await client.createOrReplace({ _type: 'newsPost', ...post });
  }
  console.log('Done — 3 news posts seeded into Sanity.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
