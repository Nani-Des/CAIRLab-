// app/hackathon/page.tsx
// Hackathon page.
//
// CONTENT NOW LIVES IN SANITY: fetched from the CMS at /studio (see
// sanity/schemaTypes/hackathon.ts). To add a new hackathon or edit this
// one, log into /studio and use the "Hackathon" document type — no code
// change or redeploy needed. The page shows whichever hackathon has the
// most recent `date`, and revalidates every 60 seconds.
//
// FALLBACK below is only a safety net — what renders if the Sanity fetch
// fails or returns nothing, so the page never goes empty.

import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { buildOpenGraph, buildTwitter, DEFAULT_OG_IMAGE } from '@/lib/seo';

export const revalidate = 60;

type InfoCard = { icon: string; label: string; value: string };
type Hackathon = {
  title: string;
  status: string;
  poweredBy: string;
  description: string;
  heroImage: string;
  registerLink: string;
  infoCards: InfoCard[];
  challengeParagraphs: string[];
  tagline: string;
  whoShouldJoin: string[];
  joinTagline: string;
  partnersText: string;
  partners: string[];
};

const FALLBACK: Hackathon = {
  title: 'SecureAI Hackathon 2026',
  status: 'Registration Open',
  poweredBy: 'Powered by CAIRLab, KNUST',
  description:
    'Build practical, user-friendly solutions that help people identify and mitigate privacy and security risks when interacting with AI tools.',
  heroImage: '/images/hackathon-hero.jpg',
  registerLink: '/contact',
  infoCards: [
    { icon: 'fa-calendar-days', label: 'Event Dates', value: '28th – 30th September 2026' },
    { icon: 'fa-location-dot', label: 'Location', value: 'Hybrid — Online & On-Campus' },
    { icon: 'fa-hourglass-half', label: 'Registration Deadline', value: '20th September 2026' },
    { icon: 'fa-trophy', label: 'Prize', value: 'Cash prize up to $1,500.00 for the top-performing team' },
  ],
  challengeParagraphs: [
    'AI is transforming the way we work, learn, create, and solve problems. With that power comes a growing challenge: how do we use AI safely and responsibly?',
    'SecureAI Hackathon 2026 brings together students, developers, cybersecurity enthusiasts, innovators, researchers, and problem-solvers to build practical solutions that make AI safer for everyone.',
  ],
  tagline: 'Think creatively. Build practically. Solve a real-world problem. Make AI safer for everyone.',
  whoShouldJoin: [
    'Students and researchers',
    'Developers and UX designers',
    'Cybersecurity and privacy enthusiasts',
    'Innovators passionate about responsible AI',
  ],
  joinTagline: 'Bring your skills. Bring your ideas. Build for a safer AI future.',
  partnersText: 'This SecureAI Hackathon is powered by CAIRLab, KNUST and funded by ONR Global with partnership support from IBM CAS.',
  partners: ['CAIRLab, KNUST', 'ONR Global', 'IBM CAS'],
};

async function getHackathon(): Promise<Hackathon> {
  try {
    const doc = await client.fetch(
      `*[_type == "hackathon"] | order(date desc)[0]{
        title, status, poweredBy, description, heroImage, registerLink,
        infoCards, challengeParagraphs, tagline, whoShouldJoin, joinTagline,
        partnersText, partners
      }`
    );
    if (doc) {
      return {
        title: doc.title || FALLBACK.title,
        status: doc.status || FALLBACK.status,
        poweredBy: doc.poweredBy || FALLBACK.poweredBy,
        description: doc.description || FALLBACK.description,
        heroImage: doc.heroImage ? urlFor(doc.heroImage).width(1600).url() : FALLBACK.heroImage,
        registerLink: doc.registerLink || FALLBACK.registerLink,
        infoCards: (doc.infoCards ?? []).length > 0
          ? doc.infoCards.map((c: InfoCard) => ({ ...c, icon: `fa-${c.icon}` }))
          : FALLBACK.infoCards,
        challengeParagraphs: doc.challengeParagraphs?.length ? doc.challengeParagraphs : FALLBACK.challengeParagraphs,
        tagline: doc.tagline || FALLBACK.tagline,
        whoShouldJoin: doc.whoShouldJoin?.length ? doc.whoShouldJoin : FALLBACK.whoShouldJoin,
        joinTagline: doc.joinTagline || FALLBACK.joinTagline,
        partnersText: doc.partnersText || FALLBACK.partnersText,
        partners: doc.partners?.length ? doc.partners : FALLBACK.partners,
      };
    }
  } catch (err) {
    console.error('Failed to fetch hackathon from Sanity, using fallback content:', err);
  }
  return FALLBACK;
}

export async function generateMetadata(): Promise<Metadata> {
  const hackathon = await getHackathon();
  const title = `${hackathon.title} — CAIRLab`;
  const image = hackathon.heroImage || DEFAULT_OG_IMAGE;
  return {
    title,
    description: hackathon.description,
    openGraph: buildOpenGraph(title, hackathon.description, { path: '/hackathon', image }),
    twitter: buildTwitter(title, hackathon.description, image),
  };
}

export default async function HackathonPage() {
  const hackathon = await getHackathon();

  return (
    <>
      <section
        className="cl-page-hero cl-page-hero--image"
        style={{ '--hero-image': `url(${hackathon.heroImage})` } as React.CSSProperties}
      >
        <div className="cl-wrap">
          <div className="cl-hackathon-status">
            <span className="cl-status-dot" />
            {hackathon.status}
          </div>
          <p className="cl-hackathon-powered">{hackathon.poweredBy}</p>
          <h1>{hackathon.title}</h1>
          <p>{hackathon.description}</p>
          <div className="cl-hero-ctas" style={{ marginTop: '28px' }}>
            <a
              href={hackathon.registerLink}
              className="cl-btn-blue"
              {...(hackathon.registerLink.startsWith('http')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              Register Now →
            </a>
          </div>
        </div>
      </section>

      <section className="cl-section">
        <div className="cl-wrap">
          <div className="cl-info-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {hackathon.infoCards.map((card) => (
              <div className="cl-info-card" key={card.label}>
                <div className="cl-info-icon"><i className={`fa-solid ${card.icon}`} aria-hidden="true"></i></div>
                <h3>{card.label}</h3>
                <p>{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cl-section cl-section-mist">
        <div className="cl-wrap">
          <div className="cl-section-head">
            <h2>The Challenge</h2>
            {hackathon.challengeParagraphs.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
          <div className="cl-hackathon-tagline">{hackathon.tagline}</div>
        </div>
      </section>

      <section className="cl-section">
        <div className="cl-wrap">
          <div className="cl-section-head">
            <h2>Who Should Join</h2>
          </div>
          <div className="cl-info-grid">
            {hackathon.whoShouldJoin.map((item) => (
              <div className="cl-info-card" key={item}>
                <div className="cl-info-icon"><i className="fa-solid fa-check" aria-hidden="true"></i></div>
                <p style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '17px' }}>{item}</p>
              </div>
            ))}
          </div>
          <div className="cl-hackathon-tagline" style={{ marginTop: '40px' }}>{hackathon.joinTagline}</div>
        </div>
      </section>

      <section className="cl-section cl-section-black">
        <div className="cl-wrap">
          <div className="cl-section-head">
            <h2>Partners</h2>
            <p>{hackathon.partnersText}</p>
          </div>
          <div className="cl-partners">
            {hackathon.partners.map((partner) => (
              <div className="cl-partner-logo" key={partner}>{partner}</div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
