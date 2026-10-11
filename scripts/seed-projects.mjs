// scripts/seed-projects.mjs
// One-time migration: loads the 3 hardcoded projects from
// app/projects/page.tsx into Sanity as real documents, uploading each
// card's existing photo as a proper Sanity image asset.
//
// Run once with: node scripts/seed-projects.mjs
// Safe to re-run — it deletes and recreates the 3 known project documents
// (secureai, ai-food-sustainability, signtalk) each time rather than
// duplicating them.

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Minimal .env.local loader (no dependency needed) — Next.js reads this
// file automatically at runtime, but a plain Node script like this doesn't.
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

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-01-01',
  token,
  useCdn: false,
});

const imagesDir = path.join(__dirname, '..', 'public', 'images');

const PROJECTS = [
  {
    _id: 'project-secureai',
    imageFile: 'secureai-card.jpg',
    tag: 'SecureAI',
    icon: 'shield-halved',
    title: 'Building Trustworthy and Resilient AI Systems',
    description:
      'As AI systems become more sophisticated, they also become attractive targets for malicious actors. SecureAI researches defense mechanisms — against model poisoning, adversarial attacks, data inference, and model extraction — that protect AI throughout its entire lifecycle.',
    stats: [
      { num: '15+', label: 'Papers' },
      { num: '8', label: 'Team' },
      { num: '3', label: 'Projects' },
    ],
    focus: ['Adversarial ML Defense', 'Robust Model Development', 'Vulnerability Analysis', 'Secure Deployment'],
    link: '/contact',
    order: 1,
  },
  {
    _id: 'project-ai-food-sustainability',
    imageFile: 'food-sustainability-card.jpg',
    tag: 'AI For Food Sustainability',
    icon: 'seedling',
    title: 'Revolutionizing Agriculture Through Intelligent Technology',
    description:
      "Addressing one of humanity's most pressing challenges — food security for a growing global population — by harnessing AI, machine learning, and data analytics to build smarter, more sustainable food systems from farm to fork.",
    stats: [
      { num: '12+', label: 'Studies' },
      { num: '6', label: 'Team' },
      { num: '4', label: 'Projects' },
    ],
    focus: ['Precision Agriculture', 'Automated Farming', 'Supply Chain Optimization', 'Waste Reduction'],
    link: '/contact',
    order: 2,
  },
  {
    _id: 'project-signtalk',
    imageFile: 'signtalk-card.jpg',
    tag: 'SignTalk',
    icon: 'hands-asl-interpreting',
    title: 'AI-Powered Sign Language Translation',
    description:
      'Communication barriers between deaf and hearing communities remain a challenge in education, healthcare, and daily life. SignTalk builds real-time, accurate translation between sign language and spoken or written language.',
    stats: [
      { num: '8+', label: 'Prototypes' },
      { num: '7', label: 'Team' },
      { num: '2', label: 'Projects' },
    ],
    focus: ['Sign Language Recognition', 'Multi-language Translation', 'Gesture Analysis', 'Avatar Synthesis'],
    link: '/contact',
    order: 3,
  },
];

async function run() {
  for (const p of PROJECTS) {
    console.log(`Uploading image for ${p.tag}...`);
    const imagePath = path.join(imagesDir, p.imageFile);
    const asset = await client.assets.upload('image', readFileSync(imagePath), { filename: p.imageFile });

    console.log(`Creating document for ${p.tag}...`);
    await client.createOrReplace({
      _id: p._id,
      _type: 'project',
      tag: p.tag,
      icon: p.icon,
      title: p.title,
      description: p.description,
      stats: p.stats,
      focus: p.focus,
      link: p.link,
      order: p.order,
      image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
    });
  }
  console.log('Done — 3 projects seeded into Sanity.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
