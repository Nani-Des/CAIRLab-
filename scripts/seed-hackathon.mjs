// scripts/seed-hackathon.mjs
// One-time migration: loads the current hardcoded SecureAI Hackathon 2026
// content into Sanity as a real document. Run once with:
//   node scripts/seed-hackathon.mjs
// Safe to re-run — replaces the same document ID each time.

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

const HACKATHON = {
  _id: 'hackathon-secureai-2026',
  _type: 'hackathon',
  title: 'SecureAI Hackathon 2026',
  date: '2026-09-28',
  status: 'Registration Open',
  poweredBy: 'Powered by CAIRLab, KNUST',
  description:
    'Build practical, user-friendly solutions that help people identify and mitigate privacy and security risks when interacting with AI tools.',
  registerLink: '/contact',
  infoCards: [
    { icon: 'calendar-days', label: 'Event Dates', value: '28th – 30th September 2026' },
    { icon: 'location-dot', label: 'Location', value: 'Hybrid — Online & On-Campus' },
    { icon: 'hourglass-half', label: 'Registration Deadline', value: '20th September 2026' },
    { icon: 'trophy', label: 'Prize', value: 'Cash prize up to $1,500.00 for the top-performing team' },
  ],
  challengeParagraphs: [
    'AI is transforming the way we work, learn, create, and solve problems. With that power comes a growing challenge: how do we use AI safely and responsibly?',
    'SecureAI Hackathon 2026 brings together students, developers, cybersecurity enthusiasts, innovators, researchers, and problem-solvers to build practical solutions that make AI safer for everyone.',
  ],
  tagline: 'Think creatively. Build practically. Solve a real-world problem. Make AI safer for everyone.',
  whoShouldJoin: [
    'Students and researchers',
    'Developers and UX designers',
    'Cybersecurity and privacy enthusiasts',
    'Innovators passionate about responsible AI',
  ],
  joinTagline: 'Bring your skills. Bring your ideas. Build for a safer AI future.',
  partnersText: 'This SecureAI Hackathon is powered by CAIRLab, KNUST and funded by ONR Global with partnership support from IBM CAS.',
  partners: ['CAIRLab, KNUST', 'ONR Global', 'IBM CAS'],
};

async function run() {
  console.log(`Creating document: ${HACKATHON.title}`);
  await client.createOrReplace(HACKATHON);
  console.log('Done — hackathon seeded into Sanity.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
