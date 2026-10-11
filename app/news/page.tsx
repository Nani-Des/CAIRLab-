// app/news/page.tsx
// News listing page — search + Category/Year/Byline filters, all news posts
// from Sanity. Content lives in the Studio (News Post document type) — see
// sanity/schemaTypes/newsPost.ts. Add/edit posts at /studio, no code
// change or redeploy needed; this page revalidates every 60 seconds.
//
// Each card links to its own article page at /news/[slug] (app/news/[slug]/page.tsx).

import type { Metadata } from 'next';
import PageHero from '@/components/layout/PageHero';
import NewsDirectory, { type NewsItem } from '@/components/news/NewsDirectory';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { buildOpenGraph, buildTwitter } from '@/lib/seo';

const TITLE = 'News — CAIRLab';
const DESCRIPTION = 'Institutional announcements, research milestones, and community updates from CAIRLab.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph(TITLE, DESCRIPTION, { path: '/news' }),
  twitter: buildTwitter(TITLE, DESCRIPTION),
};

export const revalidate = 60;

const FALLBACK_NEWS: NewsItem[] = [
  {
    id: 'fallback-news-0a',
    slug: 'cairlab-launches-ai-for-professionals-project',
    title: 'CAIRLab Launches AI for Professionals Project',
    date: 'Sep 26, 2026',
    year: '2026',
    category: 'Project Launch',
    author: 'CAIRLab Communications',
    tags: ['AI for Professionals', 'Training', 'GIZ', 'BMZ', 'Employment'],
    excerpt:
      'CAIRLab KNUST launches the AI for Professionals Project, training at least 120 young Ghanaians in employer-validated AI skills across four pathways, commissioned by BMZ and implemented by GIZ in partnership with MoTAI.',
    image: '',
  },
  {
    id: 'fallback-news-0b',
    slug: 'secureai-hackathon-2026-kicks-off-with-116-teams',
    title: 'SecureAI Hackathon 2026 Kicks Off with 116 Teams',
    date: 'Sep 26, 2026',
    year: '2026',
    category: 'Hackathon',
    author: 'CAIRLab Communications',
    tags: ['Hackathon', 'SecureAI', 'Opening Day'],
    excerpt:
      "The SecureAI Hackathon 2026 officially kicked off with opening remarks from Dr. Emmanuel Ahene and presentations from CAIRLab's student researchers, as 116 teams begin competing for one of 12 spots in the next stage.",
    image: '',
  },
  {
    id: 'fallback-news-1',
    slug: 'dr-emmanuel-ahene-secures-onr-research-grant-for-secureai-project',
    title: 'Dr. Emmanuel Ahene Secures ONR Research Grant for SecureAI Project',
    date: 'Aug 25, 2026',
    year: '2026',
    category: 'Funding',
    author: 'CAIRLab Communications',
    tags: ['Funding', 'ONR', 'SecureAI'],
    excerpt:
      'Dr. Emmanuel Ahene, Senior Lecturer in the Department of Computer Science at KNUST, has secured a research grant from the Office of Naval Research (ONR), USA, to fund the SecureAI Project.',
    image: '/images/team-emmanuel-ahene.jpg',
  },
  {
    id: 'fallback-news-2',
    slug: 'final-registration-push-for-secureai-hackathon-2026',
    title: 'Final Registration Push for SecureAI Hackathon 2026',
    date: 'Sep 19, 2026',
    year: '2026',
    category: 'Hackathon',
    author: 'CAIRLab Communications',
    tags: ['Hackathon', 'SecureAI', 'Registration'],
    excerpt:
      "The laboratory's immediate focus is locking in final team placements, with over 240 participants already signed up ahead of the September 20 deadline.",
    image: '',
  },
  {
    id: 'fallback-news-3',
    slug: 'secureai-hackathon-2026-details-released',
    title: 'SecureAI Hackathon 2026 Details Released',
    date: 'Sep 19, 2026',
    year: '2026',
    category: 'Hackathon',
    author: 'CAIRLab Communications',
    tags: ['Hackathon', 'SecureAI', 'Registration'],
    excerpt:
      'The laboratory will host a hybrid (online and on-campus) hackathon from September 28 to 30, 2026, focused on building practical solutions to mitigate privacy and security risks associated with AI.',
    image: '',
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { label: iso, year: '' };
  return {
    label: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    year: String(d.getFullYear()),
  };
}

async function getAllNews(): Promise<NewsItem[]> {
  try {
    const docs = await client.fetch(
      `*[_type == "newsPost" && defined(slug.current)] | order(date desc){ _id, title, "slug": slug.current, date, category, author, tags, excerpt, image }`
    );
    if (Array.isArray(docs) && docs.length > 0) {
      return docs.map((d) => {
        const { label, year } = formatDate(d.date);
        return {
          id: d._id,
          slug: d.slug,
          title: d.title,
          date: label,
          year,
          category: d.category || '',
          author: d.author || '',
          tags: d.tags ?? [],
          excerpt: d.excerpt ?? '',
          image: d.image ? urlFor(d.image).width(700).height(440).fit('crop').url() : '',
        };
      });
    }
  } catch (err) {
    console.error('Failed to fetch news from Sanity, using fallback content:', err);
  }
  return FALLBACK_NEWS;
}

export default async function NewsPage() {
  const news = await getAllNews();

  return (
    <>
      <PageHero
        kicker="Newsroom"
        title="News & Announcements"
        description="Institutional announcements, research milestones, and community updates from CAIRLab."
        image="/images/news-hero.jpg"
      />

      <section className="cl-section">
        <div className="cl-wrap">
          <NewsDirectory news={news} />
        </div>
      </section>
    </>
  );
}
