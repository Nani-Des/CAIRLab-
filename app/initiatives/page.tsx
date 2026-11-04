// app/initiatives/page.tsx
// Initiatives page: CAIRLab's ongoing programmes (INITIATIVES below — edit in
// code) followed by the current hackathon (from Sanity). Was /hackathon —
// that address now redirects here (see next.config.ts).
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
import Link from 'next/link';
import PageHero from '@/components/layout/PageHero';
import { buildOpenGraph, buildTwitter, DEFAULT_OG_IMAGE } from '@/lib/seo';
import { EMPLOYEES_SURVEY_URL, EMPLOYERS_SURVEY_URL, NOMINATION_FORM_URL } from '@/lib/aiForProfessionals';
import { getAiProSettings } from '@/lib/aiProSettings';

export const revalidate = 60;

// Ongoing programmes shown under "Initiatives". Links come from the
// programme's own links dashboard (https://forms.gle/8rRT812hbqNjB78s7).
const INITIATIVES = [
  {
    id: 'ai-for-professionals',
    // On-site registration with employer approval (app/initiatives/ai-for-professionals).
    registerHref: '/initiatives/ai-for-professionals',
    kicker: 'KNUST × GIZ',
    title: 'AI for Professionals',
    description:
      "Practical, employer-validated AI skills for Ghana's workforce. Commissioned by the German Federal Ministry for Economic Cooperation and Development (BMZ), implemented by GIZ in partnership with the Ministry of Trade, Agribusiness and Industry (MoTAI), and delivered by CAIRLab, KNUST.",
    tracks: [
      {
        icon: 'fa-palette',
        name: 'AI for Creatives',
        desc: 'Use AI tools to design graphics, write content, and edit photos and videos — turning creative ideas into finished work faster.',
      },
      {
        icon: 'fa-chart-line',
        name: 'AI for Data Analytics',
        desc: 'Learn to turn everyday business data into clear charts and insights with AI, so you can spot trends and make better decisions — no advanced maths needed.',
      },
      {
        icon: 'fa-code',
        name: 'AI for Augmented Software Development',
        desc: 'Use AI coding assistants to write, test and fix software faster — for developers who want to build better apps in less time.',
      },
      {
        icon: 'fa-bullhorn',
        name: 'AI for Digital Marketing & E-commerce',
        desc: 'Use AI to reach more customers online — create ads and social media posts, understand your audience, and grow your online sales.',
      },
    ],
    links: [
      { label: 'Employers Survey', desc: 'For organisations: tell us your AI skills needs.', icon: 'fa-building', href: EMPLOYERS_SURVEY_URL },
      { label: 'Employees Survey', desc: 'For staff interested in the training.', icon: 'fa-user-graduate', href: EMPLOYEES_SURVEY_URL },
      { label: 'Nomination Form', desc: 'Employers: nominate staff for the programme.', icon: 'fa-user-plus', href: NOMINATION_FORM_URL },
    ],
  },
];

type InfoCard = { icon: string; label: string; value: string };
type Hackathon = {
  title: string;
  status: string;
  poweredBy: string;
  description: string;
  heroImage: string;
  registerLink: string;
  registrationOpen: boolean;
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
  registrationOpen: true,
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
        title, status, poweredBy, description, heroImage, registerLink, registrationOpen,
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
        // Older hackathon documents don't have this field yet — treat as open.
        registrationOpen: doc.registrationOpen !== false,
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

const TITLE = 'Initiatives — CAIRLab';
const DESCRIPTION =
  'CAIRLab programmes with partners, including the KNUST–GIZ AI for Professionals programme and the SecureAI Hackathon.';

export async function generateMetadata(): Promise<Metadata> {
  const hackathon = await getHackathon();
  const image = hackathon.heroImage || DEFAULT_OG_IMAGE;
  return {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: buildOpenGraph(TITLE, DESCRIPTION, { path: '/initiatives', image }),
    twitter: buildTwitter(TITLE, DESCRIPTION, image),
  };
}

export default async function InitiativesPage() {
  const [hackathon, aiPro] = await Promise.all([getHackathon(), getAiProSettings()]);

  return (
    <>
      <PageHero
        kicker="Initiatives"
        title="Our Initiatives"
        description="Programmes CAIRLab runs with partners to build AI and cybersecurity skills — from professional training to hackathons."
        image="/images/projects-hero.jpg"
      />

      <section className="cl-section" id="initiatives">
        <div className="cl-wrap">
          {INITIATIVES.map((item) => (
            <article className="cl-initiative" key={item.id} id={item.id}>
              <span className="cl-initiative-kicker">{item.kicker}</span>
              <h3>{item.title}</h3>
              <p className="cl-initiative-desc">{item.description}</p>
              {item.registerHref && (
                <div className="cl-initiative-register">
                  {aiPro.registrationOpen ? (
                    <>
                      <Link href={item.registerHref} className="cl-btn-blue">Register for training →</Link>
                      <span>
                        Staff nominated by partner organisations register here; organisations can apply to become partners;
                        graduates apply with their transcript and CV.
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="cl-registration-closed"><i className="fa-solid fa-lock" aria-hidden="true"></i> Registration closed</span>
                      <span>{aiPro.closedMessage}</span>
                    </>
                  )}
                </div>
              )}
              <div className="cl-initiative-tracks">
                {/* Click a track to read what it covers (native <details>, works without JavaScript). */}
                {item.tracks.map((t, i) => (
                  <details className="cl-initiative-track" key={t.name}>
                    <summary>
                      <i className={`fa-solid ${t.icon}`} aria-hidden="true"></i>
                      <span><small>Track {i + 1}</small>{t.name}</span>
                      <i className="fa-solid fa-chevron-down cl-initiative-track-caret" aria-hidden="true"></i>
                    </summary>
                    <p>{t.desc}</p>
                  </details>
                ))}
              </div>
              <div className="cl-initiative-links">
                {item.links.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="cl-initiative-link">
                    <span className="cl-initiative-link-icon"><i className={`fa-solid ${l.icon}`} aria-hidden="true"></i></span>
                    <span className="cl-initiative-link-text">
                      <strong>{l.label} →</strong>
                      <span>{l.desc}</span>
                    </span>
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="hackathon"
        className="cl-page-hero cl-page-hero--image cl-initiatives-hackathon"
        style={{ '--hero-image': `url(${hackathon.heroImage})` } as React.CSSProperties}
      >
        <div className="cl-wrap">
          <div className={`cl-hackathon-status${hackathon.registrationOpen ? '' : ' closed'}`}>
            <span className="cl-status-dot" />
            {hackathon.registrationOpen ? hackathon.status : 'Registration Closed'}
          </div>
          <p className="cl-hackathon-powered">{hackathon.poweredBy}</p>
          <h2>{hackathon.title}</h2>
          <p>{hackathon.description}</p>
          <div className="cl-hero-ctas" style={{ marginTop: '28px' }}>
            {hackathon.registrationOpen ? (
              <a
                href={hackathon.registerLink}
                className="cl-btn-blue"
                {...(hackathon.registerLink.startsWith('http')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                Register Now →
              </a>
            ) : (
              <span className="cl-registration-closed cl-registration-closed--dark">
                <i className="fa-solid fa-lock" aria-hidden="true"></i> Registration Closed
              </span>
            )}
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
