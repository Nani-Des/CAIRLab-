// app/publications/page.tsx
// Publications page — real papers, added via /studio (Publication document
// type, see sanity/schemaTypes/publication.ts). Starts empty on purpose:
// no placeholder/fake papers are listed here. Add the first one in Studio
// and it'll appear within 60 seconds.

import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/layout/PageHero';
import { client } from '@/sanity/lib/client';
import { buildOpenGraph, buildTwitter } from '@/lib/seo';

const TITLE = 'Publications — CAIRLab';
const DESCRIPTION = "Peer-reviewed papers and research output from CAIRLab's labs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph(TITLE, DESCRIPTION, { path: '/publications' }),
  twitter: buildTwitter(TITLE, DESCRIPTION),
};

export const revalidate = 60;

type Publication = {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  link: string;
  abstract: string;
  theme: string;
};

async function getPublications(): Promise<Publication[]> {
  try {
    const docs = await client.fetch(
      `*[_type == "publication"] | order(year desc){ _id, title, authors, venue, year, link, abstract, theme }`
    );
    if (Array.isArray(docs)) {
      return docs.map((d) => ({
        id: d._id,
        title: d.title,
        authors: d.authors,
        venue: d.venue || '',
        year: d.year,
        link: d.link || '',
        abstract: d.abstract || '',
        theme: d.theme || '',
      }));
    }
  } catch (err) {
    console.error('Failed to fetch publications from Sanity:', err);
  }
  return [];
}

export default async function PublicationsPage() {
  const publications = await getPublications();

  return (
    <>
      <PageHero
        kicker="Research Output"
        title="Publications"
        description="Peer-reviewed papers and research output from our labs — updated as new work is published."
        image="/images/publications-hero.jpg"
      />

      <section className="cl-section">
        <div className="cl-wrap" style={{ maxWidth: '860px' }}>
          {publications.length === 0 ? (
            <div className="cl-directory-empty" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <i className="fa-solid fa-file-lines" style={{ fontSize: '32px', color: 'var(--text-soft)', marginBottom: '16px' }} aria-hidden="true"></i>
              <p style={{ fontSize: '17px', color: 'var(--text-soft)' }}>
                Publications will be listed here as they&apos;re added. Check back soon, or see our{' '}
                <Link href="/projects" style={{ color: 'var(--blue-primary)' }}>active research projects</Link> in the meantime.
              </p>
            </div>
          ) : (
            <div className="cl-pub-list">
              {publications.map((pub) => (
                <div className="cl-pub-item" key={pub.id}>
                  <div className="cl-pub-year">{pub.year}</div>
                  <div>
                    <h3>{pub.title}</h3>
                    <p className="cl-pub-meta">
                      {pub.authors}
                      {pub.venue && <> — {pub.venue}</>}
                    </p>
                    {pub.abstract && <p className="cl-pub-abstract">{pub.abstract}</p>}
                    <div className="cl-pub-footer">
                      {pub.theme && <span className="cl-pub-theme">{pub.theme}</span>}
                      {pub.link && (
                        <a href={pub.link} target="_blank" rel="noopener noreferrer">
                          Read Paper <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
