// app/projects/page.tsx
// Projects page — spotlight cards for CAIRLab's active research labs.
//
// CONTENT NOW LIVES IN SANITY: projects are fetched from the CMS at
// /studio (Sanity Studio, embedded in this app — see sanity.config.ts and
// sanity/schemaTypes/project.ts). To add, edit, or reorder a project,
// log into /studio and use the "Project" document type — no code change or
// redeploy needed. The page revalidates every 60 seconds, so a change made
// in the Studio shows up here shortly after.
//
// FALLBACK_PROJECTS below is only a safety net — it's what renders if the
// Sanity fetch fails or returns nothing (e.g. missing/misconfigured
// credentials in .env.local), so the page never goes empty. It is NOT the
// place to add new projects going forward; use the Studio instead.
//
// A dashed "more labs coming soon" card always renders after the fetched
// projects, so there's always a visible slot suggesting more is on the way.

import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/layout/PageHero';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { buildOpenGraph, buildTwitter } from '@/lib/seo';

const TITLE = 'Research Projects — CAIRLab';
const DESCRIPTION =
  'SecureAI, AI for Food Sustainability, and SignTalk — the active research labs building secure, reliable, and ethical AI systems for real-world applications.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph(TITLE, DESCRIPTION, { path: '/projects' }),
  twitter: buildTwitter(TITLE, DESCRIPTION),
};

export const revalidate = 60;

type Project = {
  id: string;
  slug: string;
  tag: string;
  icon: string;
  image: string;
  title: string;
  description: string;
  stats: { num: string; label: string }[];
  focus: string[];
  link: string;
};

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'fallback-secureai',
    slug: 'building-trustworthy-and-resilient-ai-systems',
    tag: 'SecureAI',
    icon: 'fa-shield-halved',
    image: '/images/secureai-card.jpg',
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
  },
  {
    id: 'fallback-food-sustainability',
    slug: 'revolutionizing-agriculture-through-intelligent-technology',
    tag: 'AI For Food Sustainability',
    icon: 'fa-seedling',
    image: '/images/food-sustainability-card.jpg',
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
  },
  {
    id: 'fallback-signtalk',
    slug: 'ai-powered-sign-language-translation',
    tag: 'SignTalk',
    icon: 'fa-hands-asl-interpreting',
    image: '/images/signtalk-card.jpg',
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
  },
];

const CAPABILITIES = [
  {
    icon: 'fa-brain',
    title: 'Federated Learning',
    description:
      'Developing privacy-preserving AI models that can learn from decentralized data sources without compromising sensitive information.',
  },
  {
    icon: 'fa-chart-line',
    title: 'Explainable AI',
    description:
      'Creating transparent AI systems that provide clear explanations for their decisions, enhancing trust and accountability.',
  },
  {
    icon: 'fa-shield-halved',
    title: 'AI Ethics & Governance',
    description:
      'Establishing frameworks for ethical AI development and deployment, ensuring responsible innovation across all our research areas.',
  },
];

async function getProjects(): Promise<Project[]> {
  try {
    const docs = await client.fetch(
      `*[_type == "project" && defined(slug.current)] | order(order asc){ _id, "slug": slug.current, tag, icon, image, title, description, stats, focus, link }`
    );
    if (Array.isArray(docs) && docs.length > 0) {
      return docs.map((d) => ({
        id: d._id,
        slug: d.slug,
        tag: d.tag,
        icon: `fa-${d.icon}`,
        image: d.image ? urlFor(d.image).width(640).height(360).fit('crop').url() : '',
        title: d.title,
        description: d.description,
        stats: d.stats ?? [],
        focus: d.focus ?? [],
        link: d.link || '/contact',
      }));
    }
  } catch (err) {
    console.error('Failed to fetch projects from Sanity, using fallback content:', err);
  }
  return FALLBACK_PROJECTS;
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHero
        kicker="Innovation in Action"
        title="Advancing the Frontiers of AI and Cybersecurity"
        description="Each project represents our commitment to building secure, reliable, and ethical artificial intelligence systems for real-world applications."
        image="/images/projects-hero.jpg"
      />

      <section className="cl-section">
        <div className="cl-wrap">
          <div className="cl-spotlight-grid">
            {projects.map((project) => (
              <div className="cl-spotlight" key={project.id}>
                <div
                  className="cl-spotlight-media"
                  role="img"
                  aria-label={project.title}
                  style={{ '--card-image': `url(${project.image})` } as React.CSSProperties}
                />
                <div className="cl-spotlight-body">
                  <div className="cl-spotlight-top">
                    <div className="cl-spotlight-icon"><i className={`fa-solid ${project.icon}`} aria-hidden="true"></i></div>
                    <span className="cl-spotlight-tag">{project.tag}</span>
                  </div>
                  <h3><Link href={`/projects/${project.slug}`} className="cl-spotlight-title-link">{project.title}</Link></h3>
                  <p className="cl-spotlight-desc">{project.description}</p>
                  <div className="cl-spotlight-stats">
                    {project.stats.map((stat) =>
                      stat.label === 'Team' ? (
                        <Link href="/team" key={stat.label} className="cl-spotlight-stat-link" title="See who's on the team">
                          <span className="cl-spotlight-stat-num">{stat.num}</span>
                          <span className="cl-spotlight-stat-label">{stat.label}</span>
                        </Link>
                      ) : (
                        <div key={stat.label}>
                          <span className="cl-spotlight-stat-num">{stat.num}</span>
                          <span className="cl-spotlight-stat-label">{stat.label}</span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="cl-spotlight-chips">
                    {project.focus.map((item) => (
                      <span className="cl-spotlight-chip" key={item}>{item}</span>
                    ))}
                  </div>
                  <div className="cl-spotlight-links">
                    <Link href={`/projects/${project.slug}`} className="cl-spotlight-link">Read More →</Link>
                    <a href={project.link} className="cl-spotlight-link">Join the Team →</a>
                  </div>
                </div>
              </div>
            ))}

            {/* Placeholder slot — always shown after the fetched projects above. */}
            <div className="cl-spotlight cl-spotlight-placeholder">
              <div className="cl-spotlight-icon"><i className="fa-solid fa-plus" aria-hidden="true"></i></div>
              <h3>More Labs Coming Soon</h3>
              <p>New research projects are added here as they launch.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cl-section">
        <div className="cl-wrap">
          <div className="cl-section-head">
            <span className="cl-page-hero-kicker" style={{ background: 'var(--blue-subtle)', color: 'var(--blue-primary)' }}>
              Lab Capabilities
            </span>
            <h2>Cross-Lab Research Initiatives</h2>
            <p>Our labs collaborate on interdisciplinary projects that push the boundaries of AI research</p>
          </div>
          <div className="cl-info-grid">
            {CAPABILITIES.map((cap) => (
              <div className="cl-info-card" key={cap.title}>
                <div className="cl-info-icon"><i className={`fa-solid ${cap.icon}`} aria-hidden="true"></i></div>
                <h3>{cap.title}</h3>
                <p>{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cl-section cl-section-mist">
        <div className="cl-wrap">
          <div className="cl-section-head">
            <h2>Interested in Our Research?</h2>
            <p>
              Whether you&apos;re a student, researcher, or industry partner, there are numerous
              opportunities to collaborate with our labs and contribute to groundbreaking AI
              research.
            </p>
            <div className="cl-section-cta">
              <a href="/contact" className="cl-btn-blue">Get Involved Today →</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
