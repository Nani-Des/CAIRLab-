// lib/team.ts
// FALLBACK team roster — only used if the Sanity fetch in app/team/page.tsx
// / app/team/[slug]/page.tsx fails or returns nothing (e.g. missing
// credentials), so those pages never go empty. It is NOT where you add a
// new team member anymore — do that in Studio (Team Member document type,
// see sanity/schemaTypes/teamMember.ts) so it goes through the normal
// draft → publish flow. This file also still holds slugify()/
// getMemberBySlug(), used by the fallback path.

export type TeamMember = {
  name: string;
  badge: string;
  role: string;
  image: string;
  specialization: string;
  stats: { num: string; label: string }[];
  bio: string;
  tags: string[];
  // Sourced from CAIRLab's own official site (cairlab.knust.edu.gh).
  linkedin?: string;
};

export const TEAM: TeamMember[] = [
  {
    name: 'Dr. Emmanuel Ahene',
    badge: 'Director',
    role: 'PI',
    image: '/images/team-emmanuel-ahene.jpg',
    specialization: 'Cybersecurity & Machine Learning',
    stats: [
      { num: '1', label: 'Publications' },
      { num: '1', label: 'Years' },
    ],
    bio: "Leading CAIRLab's strategic vision with expertise in adversarial machine learning and secure AI systems.",
    tags: ['AI Security', 'ML Research', 'Leadership'],
    linkedin: 'https://www.linkedin.com/in/eahenecybersecurity/',
  },
  {
    name: 'Dr. Justice Owusu Agyemang',
    badge: 'Co-PI',
    role: 'Co-PI',
    image: '/images/team-justice-agyemang.jpg',
    specialization:
      'IoT, Network and Application Security, Blockchain Technology, Applied AI, Applied Cryptography, Reverse Engineering, Quantum Computing and Information Sciences',
    stats: [],
    bio: 'Specializing in AI-powered threat detection and cybersecurity frameworks for critical infrastructure.',
    tags: ['Cybersecurity', 'Threat Intel', 'Network Security'],
    linkedin: 'https://www.linkedin.com/in/jayluxferro',
  },
  {
    name: 'Nani Desmond',
    badge: 'PhD',
    role: 'Researcher',
    image: '/images/team-nani-desmond.jpg',
    specialization: 'Machine Learning & Cybersecurity, PhD candidate',
    stats: [],
    bio: 'Building robust and secure AI systems with focus on deployment and real-world applications.',
    tags: ['ML Engineering', 'Python', 'Secure Dev'],
    linkedin: 'https://www.linkedin.com/in/nani-desmond',
  },
  {
    name: 'Somuah Kwasi Obed',
    badge: 'MPhil',
    role: 'Security Researcher',
    image: '/images/team-somuah-kwasi-obed.jpg',
    specialization: 'Cybersecurity in Federated Learning, Blockchain, MPhil Candidate',
    stats: [],
    bio: 'Focusing on explainable AI and privacy-preserving machine learning techniques.',
    tags: ['XAI', 'Privacy', 'Federated Learning'],
    linkedin: 'https://www.linkedin.com/in/obed-somuah-zero',
  },
  {
    name: 'Dominic Kingsford Opoku Agyili',
    badge: 'PhD',
    role: 'Researcher',
    image: '/images/team-dominic-agyili.jpg',
    specialization: 'Cybersecurity & Machine Learning, PhD candidate',
    stats: [],
    bio: 'Researching robust defenses against adversarial attacks on deep learning models.',
    tags: ['Adversarial ML', 'Deep Learning', 'Research'],
    linkedin: 'https://www.linkedin.com/in/dominic-agyili-9b8aa0145',
  },
  {
    name: 'Eric Sowah Badger',
    badge: 'Private Consultant',
    role: 'Private Consultant',
    image: '/images/team-eric-sowah-badger.jpg',
    specialization: 'Cybersecurity & Machine Learning',
    stats: [],
    bio: 'Specializing in data analysis, visualization, and building data pipelines for AI research.',
    tags: ['Data Science', 'Visualization', 'Python'],
    linkedin: 'https://www.linkedin.com/in/ericsowahbadger/',
  },
  {
    name: 'Hoke Ishmael',
    badge: 'MPhil',
    role: 'Researcher',
    image: '/images/team-hoke-ishmael.jpg',
    specialization: 'Application Security & Machine Learning, MPhil',
    stats: [],
    bio: 'Working on NLP applications for cybersecurity threat detection and analysis.',
    tags: ['NLP', 'Cybersecurity', 'Research'],
    linkedin: 'https://www.linkedin.com/in/hoke-ishmael-114125281',
  },
  {
    name: 'Emmanuel De-Graft Amaning',
    badge: 'MPhil',
    role: 'Researcher',
    image: '/images/team-emmanuel-amaning.jpg',
    specialization: 'AI Security, AI Engineering & Machine Learning, MPhil Candidate',
    stats: [],
    bio: 'Developing secure systems and conducting penetration testing for AI infrastructure.',
    tags: ['Security', 'Pentesting', 'Infrastructure'],
    linkedin: 'https://www.linkedin.com/in/emmanuel-de-graft/',
  },
  {
    name: 'Richard Doh',
    badge: 'PhD',
    role: 'Researcher',
    image: '/images/team-richard-doh.jpg',
    specialization: 'AI in Cybersecurity, Computer Vision, AI in Healthcare',
    stats: [],
    bio: 'Researching applications of AI in cybersecurity, computer vision, and healthcare domains.',
    tags: ['AI Security', 'Computer Vision', 'Healthcare AI'],
    linkedin: 'https://www.linkedin.com/in/doh-richard-438b75218',
  },
];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getMemberBySlug(slug: string): TeamMember | undefined {
  return TEAM.find((m) => slugify(m.name) === slug);
}
