// scripts/seed-events.mjs
// One-time migration: loads the 2 hardcoded homepage events into Sanity as
// real documents. Run once with: node scripts/seed-events.mjs
// Safe to re-run — replaces the same 2 known document IDs each time.

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

const EVENTS = [
  {
    _id: 'event-edge-ai-masterclass',
    title: 'Advanced Edge AI Deployment and TinyML Architecture Masterclass',
    date: '2026-03-18',
    location: 'CAIRLAB Auditorium, Kumasi',
    eventType: 'Workshop',
    format: 'Hybrid',
    registrationStatus: 'open',
    registrationLink: '/contact',
  },
  {
    _id: 'event-robotics-seminar',
    title: 'Robotics Process Automation and Autonomous Drone Swarm Frameworks',
    date: '2026-04-05',
    location: 'Virtual Stream',
    eventType: 'Seminar',
    format: 'Online',
    registrationStatus: 'closed',
  },
];

async function run() {
  for (const event of EVENTS) {
    console.log(`Creating document: ${event.title}`);
    await client.createOrReplace({ _type: 'event', ...event });
  }
  console.log('Done — 2 events seeded into Sanity.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
