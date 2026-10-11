// app/projects/[slug]/page.tsx
// Individual project page. Shows the full write-up from the "Full
// Write-Up" body field (set in /studio) — until a project has one filled
// in, this just shows its description instead, same graceful-fallback
// pattern used for news articles.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PortableText, type PortableTextBlock } from '@portabletext/react';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { buildOpenGraph, buildTwitter, DEFAULT_OG_IMAGE } from '@/lib/seo';

export const revalidate = 60;

type ProjectDetail = {
  title: string;
  tag: string;
  icon: string;
  image: string;
  description: string;
  stats: { num: string; label: string }[];
  focus: string[];
  link: string;
  body: PortableTextBlock[] | null;
};

// Matches the /projects listing fallback content — only used if Sanity is
// unreachable or unconfigured.
const FALLBACK_PROJECTS: Record<string, ProjectDetail> = {
  'building-trustworthy-and-resilient-ai-systems': {
    title: 'Building Trustworthy and Resilient AI Systems',
    tag: 'SecureAI',
    icon: 'fa-shield-halved',
    image: '/images/secureai-card.jpg',
    description:
      'As AI systems become more sophisticated, they also become attractive targets for malicious actors. SecureAI researches defense mechanisms — against model poisoning, adversarial attacks, data inference, and model extraction — that protect AI throughout its entire lifecycle.',
    stats: [
      { num: '15+', label: 'Papers' },
      { num: '8', label: 'Team' },
      { num: '3', label: 'Projects' },
    ],
    focus: ['Adversarial ML Defense', 'Robust Model Development', 'Vulnerability Analysis', 'Secure Deployment'],
    link: '/contact',
    body: null,
  },
  'revolutionizing-agriculture-through-intelligent-technology': {
    title: 'Revolutionizing Agriculture Through Intelligent Technology',
    tag: 'AI For Food Sustainability',
    icon: 'fa-seedling',
    image: '/images/food-sustainability-card.jpg',
    description:
      "Addressing one of humanity's most pressing challenges — food security for a growing global population — by harnessing AI, machine learning, and data analytics to build smarter, more sustainable food systems from farm to fork.",
    stats: [
      { num: '12+', label: 'Studies' },
      { num: '6', label: 'Team' },
      { num: '4', label: 'Projects' },
    ],
    focus: ['Precision Agriculture', 'Automated Farming', 'Supply Chain Optimization', 'Waste Reduction'],
    link: '/contact',
    body: null,
  },
  'ai-powered-sign-language-translation': {
    title: 'AI-Powered Sign Language Translation',
    tag: 'SignTalk',
    icon: 'fa-hands-asl-interpreting',
    image: '/images/signtalk-card.jpg',
    description:
      'Communication barriers between deaf and hearing communities remain a challenge in education, healthcare, and daily life. SignTalk builds real-time, accurate translation between sign language and spoken or written language.',
    stats: [
      { num: '8+', label: 'Prototypes' },
      { num: '7', label: 'Team' },
      { num: '2', label: 'Projects' },
    ],
    focus: ['Sign Language Recognition', 'Multi-language Translation', 'Gesture Analysis', 'Avatar Synthesis'],
    link: '/contact',
    body: null,
  },
};

async function getProject(slug: string): Promise<ProjectDetail | null> {
  try {
    const doc = await client.fetch(
      `*[_type == "project" && slug.current == $slug][0]{ title, tag, icon, image, description, stats, focus, link, body }`,
      { slug }
    );
    if (doc) {
      return {
        title: doc.title,
        tag: doc.tag,
        icon: `fa-${doc.icon}`,
        image: doc.image ? urlFor(doc.image).width(1600).height(900).fit('crop').url() : '',
        description: doc.description,
        stats: doc.stats ?? [],
        focus: doc.focus ?? [],
        link: doc.link || '/contact',
        body: doc.body ?? null,
      };
    }
  } catch (err) {
    console.error('Failed to fetch project from Sanity:', err);
  }
  return FALLBACK_PROJECTS[slug] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Project Not Found — CAIRLab' };
  const title = `${project.title} — CAIRLab`;
  const image = project.image || DEFAULT_OG_IMAGE;
  return {
    title,
    description: project.description,
    openGraph: buildOpenGraph(title, project.description, { path: `/projects/${slug}`, image }),
    twitter: buildTwitter(title, project.description, image),
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <section className="cl-section">
      <div className="cl-wrap cl-article-wrap">
        <Link href="/projects" className="cl-profile-back">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Back to Projects
        </Link>

        <span
          className="cl-page-hero-kicker"
          style={{ background: 'var(--blue-subtle)', color: 'var(--blue-primary)', marginTop: '20px' }}
        >
          <i className={`fa-solid ${project.icon}`} aria-hidden="true"></i> {project.tag}
        </span>
        <h1 style={{ marginTop: '16px' }}>{project.title}</h1>

        {project.image && (
          <div className="cl-article-hero-image" style={{ backgroundImage: `url(${project.image})` }} />
        )}

        {project.stats.length > 0 && (
          <div className="cl-spotlight-stats" style={{ marginBottom: '28px' }}>
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
        )}

        <div className="cl-article-body">
          {project.body && project.body.length > 0 ? (
            <PortableText value={project.body} />
          ) : (
            <p>{project.description}</p>
          )}
        </div>

        {project.focus.length > 0 && (
          <div className="cl-spotlight-chips" style={{ marginTop: '28px' }}>
            {project.focus.map((item) => (
              <span className="cl-spotlight-chip" key={item}>{item}</span>
            ))}
          </div>
        )}

        <div className="cl-section-cta" style={{ marginTop: '40px' }}>
          <a href={project.link} className="cl-btn-blue">Join the Team →</a>
        </div>
      </div>
    </section>
  );
}
