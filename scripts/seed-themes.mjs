// scripts/seed-themes.mjs
// Loads the 5 thematic areas (and their research project cards) into Sanity
// as real "theme" documents, uploading each project's local image as a
// proper Sanity image asset — same pattern as seed-team.mjs/seed-projects.mjs.
// Safe to re-run — it replaces the same known document IDs each time. Run
// with: node scripts/seed-themes.mjs

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '..', 'public', 'images');

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

const DETAILS_LINK = { label: 'View Details', href: '/contact' };

const THEMES = [
  {
    id: 'trustworthy-secure-ai',
    navLabel: 'Trustworthy & Secure AI',
    title: 'Trustworthy & Secure AI',
    description:
      'Developing robust, secure, and trustworthy AI systems that can withstand sophisticated attacks while maintaining performance and reliability.',
    order: 1,
    projects: [
      {
        imageFile: 'secureai-card.jpg',
        badge: 'SecureAI',
        status: 'active',
        related: 'SecureAI (Project)',
        title: 'SecureAI Framework',
        description:
          'Comprehensive framework for building and deploying secure AI systems with built-in protection against adversarial attacks and data poisoning.',
        tags: ['Adversarial ML', 'Model Verification', 'Secure Training'],
        lead: 'Dr. Emmanuel Ahene',
        years: '2023-2025',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
      {
        imageFile: 'theme-adversarial-defense.jpg',
        badge: 'Adversarial Defense',
        status: 'upcoming',
        related: 'Advanced Defense (Project)',
        title: 'Adversarial ML Defense System',
        description:
          'Developing state-of-the-art defense mechanisms against adversarial attacks on deep learning models in critical applications.',
        tags: ['Deep Learning', 'Security', 'Robust AI'],
        lead: 'Dr. Emmanuel Ahene',
        years: '2023-2024',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
      {
        imageFile: 'theme-federated-learning.jpg',
        badge: 'Federated Learning',
        status: 'upcoming',
        related: 'Privacy & Security (Project)',
        title: 'Secure Federated Learning',
        description:
          'Privacy-preserving distributed learning framework with formal security guarantees and protection against inference attacks.',
        tags: ['Federated Learning', 'Differential Privacy', 'Secure Aggregation'],
        lead: 'Dr. Emmanuel Ahene',
        years: '2024-2026',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
    ],
  },
  {
    id: 'ai-driven-cyber-defense',
    navLabel: 'AI-Driven Cyber Defense',
    title: 'AI-Driven Cyber Defense & Threat Intelligence',
    description:
      'Leveraging artificial intelligence for advanced threat detection, analysis, and automated cyber defense systems.',
    order: 2,
    projects: [
      {
        imageFile: 'theme-threat-detection.jpg',
        badge: 'Threat Detection',
        status: 'upcoming',
        related: 'Threat Intelligence (Project)',
        title: 'Real-time Threat Detection AI',
        description:
          'AI-powered system for real-time detection and analysis of cyber threats using advanced machine learning and behavioral analysis.',
        tags: ['Machine Learning', 'Behavior Analysis', 'Real-time Processing'],
        lead: 'Dr. Emmanuel Ahene',
        years: '2023-2024',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
      {
        imageFile: 'theme-malware-analysis.jpg',
        badge: 'Malware Analysis',
        status: 'upcoming',
        related: 'Malware Research (Project)',
        title: 'AI-Powered Malware Analysis',
        description:
          'Automated malware classification and analysis system using deep learning for rapid identification and characterization of threats.',
        tags: ['Deep Learning', 'Malware Analysis', 'Automation'],
        lead: 'Dr. Emmanuel Ahene',
        years: '2023-2025',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
      {
        imageFile: 'theme-network-anomaly.jpg',
        badge: 'Network Security',
        status: 'upcoming',
        related: 'Network Security (Project)',
        title: 'Network Anomaly Detection',
        description:
          'Advanced anomaly detection system for network traffic using unsupervised learning and real-time monitoring capabilities.',
        tags: ['Unsupervised Learning', 'Network Analysis', 'Real-time Monitoring'],
        lead: 'Dr. Emmanuel Ahene',
        years: '2022-2023',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
    ],
  },
  {
    id: 'critical-infrastructure-security',
    navLabel: 'Critical Infrastructure Security',
    title: 'Privacy & Security in Critical Infrastructures',
    description:
      'Securing critical infrastructure systems including IoT, 5G networks, healthcare systems, and energy grids against emerging threats.',
    order: 3,
    projects: [
      {
        imageFile: 'theme-iot-security.jpg',
        badge: 'IoT Security',
        status: 'upcoming',
        related: 'IoT Security',
        title: 'IoT Security Framework',
        description:
          'Comprehensive security framework for IoT ecosystems with device authentication, secure communication, and threat detection.',
        tags: ['IoT Security', 'Device Authentication', 'Secure Communication'],
        lead: 'IoT Security Team',
        years: '2023-2025',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
      {
        imageFile: 'theme-5g-security.jpg',
        badge: '5G Security',
        status: 'upcoming',
        related: '5G Networks',
        title: '5G Network Protection',
        description:
          'Security solutions for 5G network infrastructure focusing on network slicing security, edge computing protection, and threat mitigation.',
        tags: ['5G Security', 'Network Slicing', 'Edge Computing'],
        lead: 'Network Security Team',
        years: '2023-2024',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
      {
        imageFile: 'theme-healthcare-privacy.jpg',
        badge: 'Healthcare Security',
        status: 'upcoming',
        related: 'Healthcare',
        title: 'Healthcare Data Privacy',
        description:
          'Privacy-preserving techniques for healthcare data including differential privacy, homomorphic encryption, and secure data sharing.',
        tags: ['Differential Privacy', 'Homomorphic Encryption', 'Healthcare Security'],
        lead: 'Dr. Emmanuel Ahene',
        years: '2023-2025',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
      {
        imageFile: 'theme-smart-grid.jpg',
        badge: 'Energy Security',
        status: 'upcoming',
        related: 'Energy Infrastructure',
        title: 'Smart Grid Security',
        description:
          'Cybersecurity framework for smart grid and energy infrastructure with real-time monitoring and automated threat response.',
        tags: ['Smart Grid', 'SCADA Security', 'Critical Infrastructure'],
        lead: 'Critical Infrastructure Team',
        years: '2024-2026',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
      {
        imageFile: 'theme-medical-device.jpg',
        badge: 'Medical Device Security',
        status: 'upcoming',
        related: 'Medical Technology',
        title: 'Medical Device Security',
        description:
          'Security assessment and protection framework for connected medical devices including implants, monitors, and diagnostic equipment.',
        tags: ['Medical Devices', 'IoT Security', 'Healthcare'],
        lead: 'Healthcare Security Team',
        years: '2023-2024',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
    ],
  },
  {
    id: 'emerging-frontiers',
    navLabel: 'Emerging Frontiers',
    title: 'Emerging Frontiers: Quantum-safe, Generative AI Security, and Policy/Ethics',
    description:
      'Exploring next-generation security challenges including quantum computing threats, generative AI security, and developing ethical AI policy frameworks.',
    order: 4,
    projects: [
      {
        imageFile: 'theme-quantum-crypto.jpg',
        badge: 'Quantum Cryptography',
        status: 'upcoming',
        related: 'Quantum Security',
        title: 'Quantum Cryptography',
        description:
          'Developing post-quantum cryptographic algorithms and protocols resistant to quantum computing attacks on current encryption systems.',
        tags: ['Quantum Computing', 'Cryptography', 'Post-Quantum'],
        lead: 'Cryptography Research Group',
        years: '2023-2026',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
      {
        imageFile: 'theme-generative-ai-security.jpg',
        badge: 'Generative AI Security',
        status: 'upcoming',
        related: 'Generative AI',
        title: 'Generative AI Security',
        description:
          'Addressing security challenges in generative AI systems including prompt injection, model extraction, and content verification.',
        tags: ['Generative AI', 'LLM Security', 'Content Verification'],
        lead: 'AI Security Team',
        years: '2023-2025',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
      {
        imageFile: 'theme-ai-ethics.jpg',
        badge: 'AI Ethics',
        status: 'upcoming',
        related: 'Ethics & Policy',
        title: 'AI Ethics Framework',
        description:
          'Developing comprehensive ethical guidelines and frameworks for responsible AI development, deployment, and governance.',
        tags: ['AI Ethics', 'Governance', 'Policy Development'],
        lead: 'Ethics Committee',
        years: '2023-2024',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
      {
        imageFile: 'theme-blockchain-security.jpg',
        badge: 'Blockchain Security',
        status: 'upcoming',
        related: 'Blockchain',
        title: 'Blockchain Security Analysis',
        description:
          'Comprehensive security analysis of blockchain and distributed ledger technologies with focus on smart contract vulnerabilities.',
        tags: ['Blockchain', 'Smart Contracts', 'Cryptocurrency'],
        lead: 'Blockchain Research Team',
        years: '2022-2023',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
    ],
  },
  {
    id: 'responsible-human-centered-ai',
    navLabel: 'Responsible AI',
    title: 'Responsible and Human-Centered Artificial Intelligence',
    description:
      'Developing AI systems that are transparent, fair, accountable, and designed with human values and societal impact in mind.',
    order: 5,
    projects: [
      {
        imageFile: 'signtalk-card.jpg',
        badge: 'SignTalk',
        status: 'active',
        related: 'Accessibility',
        title: 'SignTalk AI Translator',
        description:
          'Real-time AI system for sign language translation, breaking communication barriers and promoting inclusivity for deaf communities.',
        tags: ['Computer Vision', 'NLP', 'Accessibility'],
        lead: 'Accessibility Research Team',
        years: '2023-2025',
        links: [DETAILS_LINK, { label: 'Demo', href: '/contact' }],
      },
      {
        imageFile: 'food-sustainability-card.jpg',
        badge: 'Explainable AI',
        status: 'upcoming',
        related: 'Transparency',
        title: 'AI for Food Sustainability',
        description:
          'Leveraging AI to enhance food sustainability through intelligent resource management, waste reduction, and optimized agricultural practices for a healthier planet.',
        tags: ['Sustainability', 'Resource Optimization', 'AgriTech'],
        lead: 'Food Sustainability Team',
        years: '2024-2026',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
      {
        imageFile: 'theme-human-ai-collaboration.jpg',
        badge: 'Human-AI Collaboration',
        status: 'active',
        related: 'Human-Centered AI',
        title: 'Human-AI Collaboration',
        description:
          'Research on effective human-AI teaming, collaboration patterns, and interface design for enhanced human-AI partnership.',
        tags: ['HCI', 'Collaboration', 'Interface Design'],
        lead: 'HCI Research Group',
        years: '2023-2026',
        links: [DETAILS_LINK, { label: 'Publications', href: '/contact' }],
      },
    ],
  },
];

const assetCache = new Map();

async function uploadImage(imageFile) {
  if (assetCache.has(imageFile)) return assetCache.get(imageFile);
  const imagePath = path.join(imagesDir, imageFile);
  if (!existsSync(imagePath)) {
    console.warn(`  (no image found at ${imagePath} — skipping)`);
    return null;
  }
  const asset = await client.assets.upload('image', readFileSync(imagePath), { filename: imageFile });
  assetCache.set(imageFile, asset);
  return asset;
}

async function run() {
  for (const theme of THEMES) {
    console.log(`Theme: ${theme.title}`);
    const projects = [];
    for (const project of theme.projects) {
      console.log(`  Uploading image for "${project.title}"...`);
      const asset = await uploadImage(project.imageFile);
      const { imageFile, ...rest } = project;
      projects.push({
        _type: 'themeProject',
        _key: imageFile.replace(/\.[a-z]+$/, ''),
        ...rest,
        ...(asset ? { image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } } : {}),
      });
    }

    await client.createOrReplace({
      _id: `theme-${theme.id}`,
      _type: 'theme',
      navLabel: theme.navLabel,
      title: theme.title,
      slug: { _type: 'slug', current: theme.id },
      description: theme.description,
      order: theme.order,
      projects,
    });
    console.log(`  Saved "${theme.title}" with ${projects.length} projects.`);
  }
  console.log(`Done — ${THEMES.length} thematic areas seeded into Sanity.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
