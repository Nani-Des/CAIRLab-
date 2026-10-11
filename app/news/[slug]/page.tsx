// app/news/[slug]/page.tsx
// Individual news article page. Shows the full story from the "Full
// Article" body field (set in /studio) — until a post has one filled in,
// this just shows its excerpt instead, same graceful-fallback pattern
// used for images elsewhere on the site.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PortableText, type PortableTextBlock } from '@portabletext/react';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { buildOpenGraph, buildTwitter, DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/seo';
import { newsArticleSchema, StructuredData } from '@/lib/structuredData';

export const revalidate = 60;

type Article = {
  title: string;
  date: string;
  dateISO: string;
  category: string;
  author: string;
  tags: string[];
  excerpt: string;
  image: string;
  body: PortableTextBlock[] | null;
};

function block(text: string): PortableTextBlock {
  return { _type: 'block', style: 'normal', children: [{ _type: 'span', text }] };
}

function bulletBlock(text: string): PortableTextBlock {
  return { _type: 'block', style: 'normal', listItem: 'bullet', level: 1, children: [{ _type: 'span', text }] };
}

// Matches the homepage/news-listing fallback content — only used if Sanity
// is unreachable or unconfigured, same safety net used across the site.
const FALLBACK_ARTICLES: Record<string, Article> = {
  'cairlab-launches-ai-for-professionals-project': {
    title: 'CAIRLab Launches AI for Professionals Project',
    date: 'September 26, 2026',
    dateISO: '2026-09-26',
    category: 'Project Launch',
    author: 'CAIRLab Communications',
    tags: ['AI for Professionals', 'Training', 'GIZ', 'BMZ', 'Employment'],
    excerpt:
      'CAIRLab KNUST launches the AI for Professionals Project, training at least 120 young Ghanaians in employer-validated AI skills across four pathways, commissioned by BMZ and implemented by GIZ in partnership with MoTAI.',
    image: '',
    body: [
      block('CAIRLab KNUST is proud to announce the launch of the AI for Professionals Project.'),
      block('This project is designed to equip at least 120 young Ghanaians with practical, employer-validated AI skills.'),
      block('Participants will be trained across four pathways:'),
      bulletBlock('AI for Creatives'),
      bulletBlock('AI for Data Analysis & Business Intelligence'),
      bulletBlock('AI-Augmented Software Development'),
      bulletBlock('AI for Digital Marketing & E-Commerce'),
      block(
        'The project is led by Dr. Emmanuel Ahene (Ph.D), Principal Investigator of CAIRLab KNUST, and is aimed at connecting participants to employment and freelance opportunities.'
      ),
      block('We are excited to contribute to building a future-ready AI workforce for Ghana.'),
      block(
        'This project is commissioned by the German Federal Ministry for Economic Cooperation and Development (BMZ), implemented by Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ) GmbH in partnership with the Ministry of Trade, Agribusiness and Industry (MoTAI) to promote sustainable economic growth and job creation in Ghana.'
      ),
    ],
  },
  'secureai-hackathon-2026-kicks-off-with-116-teams': {
    title: 'SecureAI Hackathon 2026 Kicks Off with 116 Teams',
    date: 'September 26, 2026',
    dateISO: '2026-09-26',
    category: 'Hackathon',
    author: 'CAIRLab Communications',
    tags: ['Hackathon', 'SecureAI', 'Opening Day'],
    excerpt:
      "The SecureAI Hackathon 2026 officially kicked off with opening remarks from Dr. Emmanuel Ahene and presentations from CAIRLab's student researchers, as 116 teams begin competing for one of 12 spots in the next stage.",
    image: '',
    body: [
      block('The hackathon officially kicked off today! The opening session set the stage for what promises to be an exciting challenge.'),
      block(
        'Dr. Emmanuel Ahene (Ph.D), Principal Investigator for CAIRLab KNUST, delivered the opening remarks, followed by presentations from our student researchers Hoke Ishmael, Doh Richard, Emmanuel De-Graft, Dominic Agyili, and Obed Somuah. The session was coordinated by Nani Desmond, bringing participants together as we prepare for the competition ahead.'
      ),
      block(
        'We were also joined by CAIRLab KNUST faculty member Dr. Justice Owusu Agyemang, and industry experts Mr. Sanders Tetteh and Mr. Eric Sowah Badger, who urged the participants to maximize the opportunity and transform their ideas into practical solutions.'
      ),
      block('Tomorrow, the real challenge begins. With 116 teams entering the competition, only 12 teams will make it through to the next stage.'),
      block('The challenge is on. Let the competition begin!'),
    ],
  },
  'dr-emmanuel-ahene-secures-onr-research-grant-for-secureai-project': {
    title: 'Dr. Emmanuel Ahene Secures ONR Research Grant for SecureAI Project',
    date: 'August 25, 2026',
    dateISO: '2026-08-25',
    category: 'Funding',
    author: 'CAIRLab Communications',
    tags: ['Funding', 'ONR', 'SecureAI'],
    excerpt:
      'Dr. Emmanuel Ahene, Senior Lecturer in the Department of Computer Science at KNUST, has secured a research grant from the Office of Naval Research (ONR), USA, to fund the SecureAI Project.',
    image: '/images/team-emmanuel-ahene.jpg',
    body: null,
  },
  'final-registration-push-for-secureai-hackathon-2026': {
    title: 'Final Registration Push for SecureAI Hackathon 2026',
    date: 'September 19, 2026',
    dateISO: '2026-09-19',
    category: 'Hackathon',
    author: 'CAIRLab Communications',
    tags: ['Hackathon', 'SecureAI', 'Registration'],
    excerpt:
      "The laboratory's immediate focus is locking in final team placements, with over 240 participants already signed up ahead of the September 20 deadline.",
    image: '',
    body: null,
  },
  'secureai-hackathon-2026-details-released': {
    title: 'SecureAI Hackathon 2026 Details Released',
    date: 'September 19, 2026',
    dateISO: '2026-09-19',
    category: 'Hackathon',
    author: 'CAIRLab Communications',
    tags: ['Hackathon', 'SecureAI', 'Registration'],
    excerpt:
      'The laboratory will host a hybrid (online and on-campus) hackathon from September 28 to 30, 2026, focused on building practical solutions to mitigate privacy and security risks associated with AI.',
    image: '',
    body: null,
  },
};

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const doc = await client.fetch(
      `*[_type == "newsPost" && slug.current == $slug][0]{ title, date, category, author, tags, excerpt, image, body }`,
      { slug }
    );
    if (doc) {
      const d = new Date(doc.date);
      const dateLabel = Number.isNaN(d.getTime())
        ? doc.date
        : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      return {
        title: doc.title,
        date: dateLabel,
        dateISO: Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10),
        category: doc.category || '',
        author: doc.author || '',
        tags: doc.tags ?? [],
        excerpt: doc.excerpt ?? '',
        image: doc.image ? urlFor(doc.image).width(1600).height(900).fit('crop').url() : '',
        body: doc.body ?? null,
      };
    }
  } catch (err) {
    console.error('Failed to fetch article from Sanity:', err);
  }
  return FALLBACK_ARTICLES[slug] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Article Not Found — CAIRLab' };
  const title = `${article.title} — CAIRLab`;
  const image = article.image || DEFAULT_OG_IMAGE;
  return {
    title,
    description: article.excerpt,
    openGraph: buildOpenGraph(title, article.excerpt, { path: `/news/${slug}`, image, type: 'article' }),
    twitter: buildTwitter(title, article.excerpt, image),
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <section className="cl-section">
      {article.dateISO && (
        <StructuredData
          data={newsArticleSchema({
            title: article.title,
            excerpt: article.excerpt,
            image: article.image || undefined,
            datePublished: article.dateISO,
            author: article.author,
            url: `${SITE_URL}/news/${slug}`,
          })}
        />
      )}
      <div className="cl-wrap cl-article-wrap">
        <Link href="/news" className="cl-profile-back">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Back to News
        </Link>

        {article.category && (
          <span
            className="cl-page-hero-kicker"
            style={{ background: 'var(--blue-subtle)', color: 'var(--blue-primary)', marginTop: '20px' }}
          >
            {article.category}
          </span>
        )}
        <h1 style={{ marginTop: '16px' }}>{article.title}</h1>
        <div className="cl-news-card-h-meta" style={{ marginBottom: '28px' }}>
          <span><i className="fa-solid fa-calendar" aria-hidden="true"></i> {article.date}</span>
          {article.author && <span><i className="fa-solid fa-user" aria-hidden="true"></i> {article.author}</span>}
        </div>

        {article.image && (
          <div
            className="cl-article-hero-image"
            style={{ backgroundImage: `url(${article.image})` }}
          />
        )}

        <div className="cl-article-body">
          {article.body && article.body.length > 0 ? (
            <PortableText value={article.body} />
          ) : (
            <p>{article.excerpt}</p>
          )}
        </div>

        {article.tags.length > 0 && (
          <div className="cl-news-card-h-tags" style={{ marginTop: '32px' }}>
            {article.tags.map((tag) => (
              <span className="cl-news-card-h-tag" key={tag}><i className="fa-solid fa-tag" aria-hidden="true"></i> {tag}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
