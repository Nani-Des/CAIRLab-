// app/themes/page.tsx
// Themes page — five thematic research areas, each with its own project cards.
//
// TO ADD A NEW PROJECT TO A THEME:
//   Find the theme in THEMES below and add an object to its `projects` array
//   (copy an existing one as a starting point). `status` is 'active' or
//   'upcoming' (controls the green/gray pill). `image` is a path under
//   public/images/ (give it a unique filename) — until a file exists there,
//   the card just shows a plain gray block, same graceful-fallback behavior
//   as the Projects page card thumbnails. `links` is an array of
//   { label, href } — usually 2 entries ("View Details" + "Publications" or
//   "Demo"). Nothing is wired to real detail/publication pages yet, so these
//   all point at /contact for now — swap in real URLs once those pages exist.
//
// TO ADD A NEW THEMATIC AREA:
//   Copy one of the objects in THEMES (id / navLabel / title / description /
//   projects) and add it to the array. It gets a nav pill and its own section
//   automatically — no other changes needed.
//
// Each theme's card grid always ends with a dashed "More research coming
// soon" placeholder card — delete a theme's `<div className="cl-theme-card
// cl-theme-placeholder">` block below once you no longer want to advertise it.

import type { Metadata } from 'next';
import PageHero from '@/components/layout/PageHero';
import { buildOpenGraph, buildTwitter } from '@/lib/seo';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import type { Image } from 'sanity';

export const revalidate = 60;

const TITLE = 'Thematic Research Areas — CAIRLab';
const DESCRIPTION =
  'Explore CAIRLab\'s research across five thematic areas — trustworthy AI, cyber defense, critical infrastructure, emerging frontiers, and human-centered AI.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph(TITLE, DESCRIPTION, { path: '/themes' }),
  twitter: buildTwitter(TITLE, DESCRIPTION),
};

const DETAILS_LINK = { label: 'View Details', href: '/contact' };

type ThemeLink = { label: string; href: string };
type ThemeProject = {
  image: string;
  badge: string;
  status: string;
  related: string;
  title: string;
  description: string;
  tags: string[];
  lead: string;
  years: string;
  links: ThemeLink[];
};
type Theme = {
  id: string;
  navLabel: string;
  title: string;
  description: string;
  projects: ThemeProject[];
};

// CONTENT NOW LIVES IN SANITY: fetched from the CMS at /studio (see
// sanity/schemaTypes/theme.ts). To flip a project between Active/Upcoming,
// add a new thematic area, or edit any of this — log into /studio and use
// the "Thematic Area" document type. No code change or redeploy needed.
// FALLBACK below is only a safety net for if the Sanity fetch fails/returns
// nothing, so the page never goes empty.
const FALLBACK: Theme[] = [
  {
    id: 'trustworthy-secure-ai',
    navLabel: 'Trustworthy & Secure AI',
    title: 'Trustworthy & Secure AI',
    description:
      'Developing robust, secure, and trustworthy AI systems that can withstand sophisticated attacks while maintaining performance and reliability.',
    projects: [
      {
        image: '/images/secureai-card.jpg',
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
        image: '/images/theme-adversarial-defense.jpg',
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
        image: '/images/theme-federated-learning.jpg',
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
    projects: [
      {
        image: '/images/theme-threat-detection.jpg',
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
        image: '/images/theme-malware-analysis.jpg',
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
        image: '/images/theme-network-anomaly.jpg',
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
    projects: [
      {
        image: '/images/theme-iot-security.jpg',
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
        image: '/images/theme-5g-security.jpg',
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
        image: '/images/theme-healthcare-privacy.jpg',
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
        image: '/images/theme-smart-grid.jpg',
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
        image: '/images/theme-medical-device.jpg',
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
    projects: [
      {
        image: '/images/theme-quantum-crypto.jpg',
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
        image: '/images/theme-generative-ai-security.jpg',
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
        image: '/images/theme-ai-ethics.jpg',
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
        image: '/images/theme-blockchain-security.jpg',
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
    projects: [
      {
        image: '/images/signtalk-card.jpg',
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
        image: '/images/food-sustainability-card.jpg',
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
        image: '/images/theme-human-ai-collaboration.jpg',
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

async function getThemes(): Promise<Theme[]> {
  try {
    const docs = await client.fetch(
      `*[_type == "theme"] | order(order asc){
        "id": slug.current, navLabel, title, description,
        projects[]{ image, badge, status, related, title, description, tags, lead, years, links }
      }`
    );
    if (docs?.length > 0) {
      return docs.map((doc: {
        id: string; navLabel: string; title: string; description: string;
        projects: (Omit<ThemeProject, 'image'> & { image?: Image })[];
      }) => ({
        id: doc.id,
        navLabel: doc.navLabel,
        title: doc.title,
        description: doc.description,
        projects: (doc.projects ?? []).map((p) => ({
          ...p,
          image: p.image ? urlFor(p.image).width(800).height(600).fit('crop').url() : '',
        })),
      }));
    }
  } catch (err) {
    console.error('Failed to fetch themes from Sanity, using fallback content:', err);
  }
  return FALLBACK;
}

export default async function ThemesPage() {
  const THEMES = await getThemes();

  return (
    <>
      <PageHero
        kicker="Discover"
        title="Thematic Research Areas"
        description="Explore our innovative research across five thematic areas, pushing the boundaries of AI and cybersecurity."
        image="/images/themes-hero.jpg"
      />

      {/* Thematic Area Navigation */}
      <nav className="cl-theme-nav" aria-label="Jump to thematic area">
        {THEMES.map((theme) => (
          <a key={theme.id} href={`#${theme.id}`}>{theme.navLabel}</a>
        ))}
      </nav>

      {THEMES.map((theme, i) => (
        <section className={`cl-section${i % 2 === 1 ? ' cl-section-mist' : ''}`} id={theme.id} key={theme.id}>
          <div className="cl-wrap">
            <div className="cl-theme-head">
              <span className="cl-page-hero-kicker" style={{ background: 'var(--blue-subtle)', color: 'var(--blue-primary)' }}>
                Thematic Area {i + 1}
              </span>
              <h2>{theme.title}</h2>
              <p>{theme.description}</p>
            </div>
            <div className="cl-theme-grid">
              {theme.projects.map((project) => (
                <div className="cl-theme-card" key={project.title}>
                  <div
                    className="cl-spotlight-media"
                    role="img"
                    aria-label={project.title}
                    style={{ '--card-image': `url(${project.image})` } as React.CSSProperties}
                  />
                  <div className="cl-theme-card-body">
                    <div className="cl-theme-badges">
                      <span className="cl-theme-badge">{project.badge}</span>
                      <span className={`cl-theme-status ${project.status}`}>
                        {project.status === 'active' ? 'Active' : 'Upcoming'}
                      </span>
                    </div>
                    <p className="cl-theme-related">{project.related}</p>
                    <h4>{project.title}</h4>
                    <p className="cl-theme-desc">{project.description}</p>
                    <div className="cl-theme-tags">
                      {project.tags.map((tag) => (
                        <span className="cl-theme-tag" key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="cl-theme-meta">
                      <span><i className="fa-solid fa-user" aria-hidden="true"></i> {project.lead}</span>
                      <span><i className="fa-solid fa-calendar" aria-hidden="true"></i> {project.years}</span>
                    </div>
                    <div className="cl-theme-links">
                      {project.links.map((link, li) => (
                        <a key={link.label} href={link.href} className={li > 0 ? 'secondary' : ''}>
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* "More research coming soon" slot — always shown last in each
                  theme's grid. Delete this block once a theme is fully staffed. */}
              <div className="cl-theme-card cl-theme-placeholder">
                <div className="cl-spotlight-icon"><i className="fa-solid fa-plus" aria-hidden="true"></i></div>
                <h4>More Research Coming Soon</h4>
                <p>New projects in this area are added here as they launch.</p>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="cl-section cl-section-black">
        <div className="cl-wrap">
          <div className="cl-section-head">
            <h2>Interested in Our Research?</h2>
            <p>
              Join us in pushing the boundaries of AI and cybersecurity research. Explore
              collaboration opportunities or apply to work with our team.
            </p>
            <div className="cl-section-cta">
              <a href="/contact" className="cl-btn-blue">Get Involved →</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
