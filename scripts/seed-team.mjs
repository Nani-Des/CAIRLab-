// scripts/seed-team.mjs
// One-time migration: loads the 9 team members from lib/team.ts into
// Sanity as real documents, uploading each person's existing photo as a
// proper Sanity image asset — same pattern as seed-projects.mjs.
//
// Run once with: node scripts/seed-team.mjs
// Safe to re-run — it replaces the same 9 known documents each time
// (deterministic IDs from each person's slug) rather than duplicating them.

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

const imagesDir = path.join(__dirname, '..', 'public', 'images');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const TEAM = [
  {
    name: 'Dr. Emmanuel Ahene', badge: 'Director', role: 'PI', imageFile: 'team-emmanuel-ahene.jpg',
    specialization: 'Cybersecurity & Machine Learning',
    stats: [{ num: '1', label: 'Publications' }, { num: '1', label: 'Years' }],
    bio: "Leading CAIRLab's strategic vision with expertise in adversarial machine learning and secure AI systems.",
    tags: ['AI Security', 'ML Research', 'Leadership'], order: 1,
  },
  {
    name: 'Dr. Justice Owusu Agyemang', badge: 'Co-PI', role: 'Co-PI', imageFile: 'team-justice-agyemang.png',
    specialization: 'IoT, Network and Application Security, Blockchain Technology, Applied AI, Applied Cryptography, Reverse Engineering, Quantum Computing and Information Sciences',
    stats: [],
    bio: 'Specializing in AI-powered threat detection and cybersecurity frameworks for critical infrastructure.',
    tags: ['Cybersecurity', 'Threat Intel', 'Network Security'], order: 2,
  },
  {
    name: 'Nani Desmond', badge: 'PhD', role: 'Researcher', imageFile: 'team-nani-desmond.jpg',
    specialization: 'Machine Learning & Cybersecurity, PhD candidate',
    stats: [],
    bio: 'Building robust and secure AI systems with focus on deployment and real-world applications.',
    tags: ['ML Engineering', 'Python', 'Secure Dev'], order: 3,
  },
  {
    name: 'Somuah Kwasi Obed', badge: 'MPhil', role: 'Security Researcher', imageFile: 'team-somuah-kwasi-obed.jpg',
    specialization: 'Cybersecurity in Federated Learning, Blockchain, MPhil Candidate',
    stats: [],
    bio: 'Focusing on explainable AI and privacy-preserving machine learning techniques.',
    tags: ['XAI', 'Privacy', 'Federated Learning'], order: 4,
  },
  {
    name: 'Dominic Kingsford Opoku Agyili', badge: 'PhD', role: 'Researcher', imageFile: 'team-dominic-agyili.jpg',
    specialization: 'Cybersecurity & Machine Learning, PhD candidate',
    stats: [],
    bio: 'Researching robust defenses against adversarial attacks on deep learning models.',
    tags: ['Adversarial ML', 'Deep Learning', 'Research'], order: 5,
  },
  {
    name: 'Eric Sowah Badger', badge: 'Private Consultant', role: 'Private Consultant', imageFile: 'team-eric-sowah-badger.jpg',
    specialization: 'Cybersecurity & Machine Learning',
    stats: [],
    bio: 'Specializing in data analysis, visualization, and building data pipelines for AI research.',
    tags: ['Data Science', 'Visualization', 'Python'], order: 6,
  },
  {
    name: 'Hoke Ishmael', badge: 'MPhil', role: 'Researcher', imageFile: 'team-hoke-ishmael.jpg',
    specialization: 'Application Security & Machine Learning, MPhil',
    stats: [],
    bio: 'Working on NLP applications for cybersecurity threat detection and analysis.',
    tags: ['NLP', 'Cybersecurity', 'Research'], order: 7,
  },
  {
    name: 'Emmanuel De-Graft Amaning', badge: 'MPhil', role: 'Researcher', imageFile: 'team-emmanuel-amaning.jpg',
    specialization: 'AI Security, AI Engineering & Machine Learning, MPhil Candidate',
    stats: [],
    bio: 'Developing secure systems and conducting penetration testing for AI infrastructure.',
    tags: ['Security', 'Pentesting', 'Infrastructure'], order: 8,
  },
  {
    name: 'Richard Doh', badge: 'PhD', role: 'Researcher', imageFile: 'team-richard-doh.jpg',
    specialization: 'AI in Cybersecurity, Computer Vision, AI in Healthcare',
    stats: [],
    bio: 'Researching applications of AI in cybersecurity, computer vision, and healthcare domains.',
    tags: ['AI Security', 'Computer Vision', 'Healthcare AI'], order: 9,
  },
];

async function run() {
  for (const member of TEAM) {
    const slug = slugify(member.name);
    const docId = `team-${slug}`;
    console.log(`Uploading photo for ${member.name}...`);
    let imageAsset;
    const imagePath = path.join(imagesDir, member.imageFile);
    if (existsSync(imagePath)) {
      imageAsset = await client.assets.upload('image', readFileSync(imagePath), { filename: member.imageFile });
    } else {
      console.warn(`  (no photo found at ${imagePath} — skipping image for this one)`);
    }

    console.log(`Creating document for ${member.name}...`);
    await client.createOrReplace({
      _id: docId,
      _type: 'teamMember',
      name: member.name,
      slug: { _type: 'slug', current: slug },
      badge: member.badge,
      role: member.role,
      specialization: member.specialization,
      stats: member.stats,
      bio: member.bio,
      tags: member.tags,
      order: member.order,
      ...(imageAsset ? { image: { _type: 'image', asset: { _type: 'reference', _ref: imageAsset._id } } } : {}),
    });
  }
  console.log(`Done — ${TEAM.length} team members seeded into Sanity.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
