// app/page.tsx
// CAIRLAB homepage — Next.js App Router page component.
// Shared chrome (fonts, announcement bar, nav, footer) lives in app/layout.tsx.

import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import HeroSlider from '@/components/homepage/HeroSlider';
import Reveal from '@/components/homepage/Reveal';
import PartnersCarousel from '@/components/homepage/PartnersCarousel';
import CountUp from '@/components/homepage/CountUp';
import VideoPlayer from '@/components/media/VideoPlayer';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

export const revalidate = 60;

const MEDIA_GRADIENTS = [
  'linear-gradient(135deg,#1E3A8A,#1D4ED8)',
  'linear-gradient(135deg,#1E293B,#334155)',
  'linear-gradient(135deg,#0F172A,#1E293B)',
];

// Partner logos — image is a path under public/images/ (give each one a
// unique filename); until a file exists there, the tile just shows blank,
// nothing broken.
const PARTNERS = [
  { name: 'IBM', image: '/images/ibm.jpg', badge: 'Partner' },
  { name: 'AI4SD', image: '/images/partner-ai4sd.jpg', badge: 'Partner' },
  { name: 'Responsible Artificial Intelligence Lab', image: '/images/partner-responsible-ai-lab.jpg', badge: 'Partner' },
  { name: 'ONR Global', image: '/images/partner-onr.png', badge: 'Global Funder' },
];

const FALLBACK_NEWS = [
  {
    id: 'fallback-news-1',
    slug: 'cairlab-launches-ai-for-professionals-project',
    title: 'CAIRLab Launches AI for Professionals Project',
    tags: ['AI for Professionals', 'Training', 'GIZ'],
    image: '',
    date: 'Sep 26, 2026',
    author: 'CAIRLab Communications',
  },
  {
    id: 'fallback-news-2',
    slug: 'secureai-hackathon-2026-kicks-off-with-116-teams',
    title: 'SecureAI Hackathon 2026 Kicks Off with 116 Teams',
    tags: ['Hackathon', 'SecureAI', 'Opening Day'],
    image: '',
    date: 'Sep 19, 2026',
    author: 'CAIRLab Communications',
  },
  {
    id: 'fallback-news-3',
    slug: 'final-registration-push-for-secureai-hackathon-2026',
    title: 'Final Registration Push for SecureAI Hackathon 2026',
    tags: ['Hackathon', 'SecureAI', 'Registration'],
    image: '',
    date: 'Sep 12, 2026',
    author: 'CAIRLab Communications',
  },
];

const FALLBACK_FEATURED_PROJECTS = [
  {
    id: 'fallback-project-1',
    tag: 'SecureAI',
    title: 'Building Trustworthy and Resilient AI Systems',
    description:
      'SecureAI researches defense mechanisms against adversarial attacks, data poisoning, and model extraction to protect AI throughout its entire lifecycle.',
    image: '/images/secureai-card.jpg',
  },
  {
    id: 'fallback-project-2',
    tag: 'AI For Food Sustainability',
    title: 'Revolutionizing Agriculture Through Intelligent Technology',
    description:
      'Harnessing AI, machine learning, and data analytics to build smarter, more sustainable food systems from farm to fork.',
    image: '/images/food-sustainability-card.jpg',
  },
  {
    id: 'fallback-project-3',
    tag: 'SignTalk',
    title: 'AI-Powered Sign Language Translation',
    description:
      'Real-time translation between sign language and spoken or written language, built with computer vision and NLP.',
    image: '/images/signtalk-card.jpg',
  },
];

const FALLBACK_EVENTS = [
  {
    id: 'fallback-event-1',
    title: 'SecureAI Hackathon 2026',
    date: 'September 28, 2026',
    location: 'CAIRLab, KNUST — Hybrid',
    eventType: 'Hackathon',
    format: 'Hybrid',
    registrationStatus: 'open',
    registrationLink: '/initiatives#hackathon',
    image: '',
  },
  {
    id: 'fallback-event-3',
    title: 'SecureAI Hackathon 2026: Opening Day',
    date: 'September 26, 2026',
    location: 'CAIRLab, KNUST — Hybrid',
    eventType: 'Hackathon',
    format: 'Hybrid',
    registrationStatus: 'closed',
    registrationLink: '/initiatives#hackathon',
    image: '',
  },
];

async function getLatestNews() {
  try {
    const docs = await client.fetch(
      `*[_type == "newsPost" && defined(slug.current)] | order(date desc)[0...3]{ _id, title, "slug": slug.current, tags, image, date, author }`
    );
    if (Array.isArray(docs) && docs.length > 0) {
      return docs.map((d) => ({
        id: d._id,
        slug: d.slug,
        title: d.title,
        tags: d.tags ?? [],
        image: d.image ? urlFor(d.image).width(600).height(375).fit('crop').url() : '',
        date: d.date ? formatNewsDate(d.date) : '',
        author: d.author || '',
      }));
    }
  } catch (err) {
    console.error('Failed to fetch news from Sanity, using fallback content:', err);
  }
  return FALLBACK_NEWS;
}

async function getFeaturedProjects() {
  try {
    const docs = await client.fetch(
      `*[_type == "project"] | order(order asc)[0...3]{ _id, tag, title, description, image }`
    );
    if (Array.isArray(docs) && docs.length > 0) {
      return docs.map((d) => ({
        id: d._id,
        tag: d.tag,
        title: d.title,
        description: d.description,
        image: d.image ? urlFor(d.image).width(640).height(480).fit('crop').url() : '',
      }));
    }
  } catch (err) {
    console.error('Failed to fetch projects from Sanity, using fallback content:', err);
  }
  return FALLBACK_FEATURED_PROJECTS;
}

function formatEventDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
}

// Short form ("Sep 26, 2026") — matches the date format used on /news.
function formatNewsDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

async function getUpcomingEvents() {
  try {
    const docs = await client.fetch(
      `*[_type == "event"] | order(date desc)[0...2]{ _id, title, date, location, eventType, format, registrationStatus, registrationLink, image }`
    );
    if (Array.isArray(docs) && docs.length > 0) {
      return docs.map((d) => ({
        id: d._id,
        title: d.title,
        date: formatEventDate(d.date),
        location: d.location || '',
        eventType: d.eventType || 'Event',
        format: d.format || '',
        registrationStatus: d.registrationStatus === 'closed' ? 'closed' : 'open',
        registrationLink: d.registrationLink || '/contact',
        image: d.image ? urlFor(d.image).width(400).height(280).fit('crop').url() : '',
      }));
    }
  } catch (err) {
    console.error('Failed to fetch events from Sanity, using fallback content:', err);
  }
  return FALLBACK_EVENTS;
}

// Background photo behind each stat card is a static file, matched by
// position (not editable in Sanity) — order here must match the "stats"
// array order set in the Homepage Stats singleton in Studio.
const HOME_STAT_IMAGES = [
  '/images/stat-years-of-research.jpg',
  '/images/stat-active-labs.jpg',
  '/images/stat-expert-researchers.jpg',
  '/images/stat-international-partners.jpg',
];

type HomeStat = { value: string; label: string; icon: string };

const FALLBACK_HOME_STATS: HomeStat[] = [
  { value: '9+', label: 'Years of Research', icon: 'calendar-days' },
  { value: '3', label: 'Active Research Labs', icon: 'flask' },
  { value: '17', label: 'Expert Researchers', icon: 'users' },
  { value: '2', label: 'International Partners', icon: 'globe' },
];

async function getHomeStats(): Promise<HomeStat[]> {
  try {
    const doc = await client.fetch(`*[_type == "homeStats"][0]{ stats }`);
    if (Array.isArray(doc?.stats) && doc.stats.length === 4) {
      return doc.stats;
    }
  } catch (err) {
    console.error('Failed to fetch home stats from Sanity, using fallback content:', err);
  }
  return FALLBACK_HOME_STATS;
}

export default async function HomePage() {
  const [news, featuredProjects, upcomingEvents, homeStats] = await Promise.all([
    getLatestNews(),
    getFeaturedProjects(),
    getUpcomingEvents(),
    getHomeStats(),
  ]);

  return (
    <>
      {/* Hero Slider Component */}
      <HeroSlider />

        {/* Welcome / About split — Styled with CAIRLAB blue/white identity */}
        <section className="cl-section" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)', borderTop: '1px solid #DBEAFE', borderBottom: '1px solid #DBEAFE' }}>
          <div className="cl-wrap">
            <div className="cl-about-split">
              <Reveal>
                <div style={{ padding: '24px 0' }}>
                  <span style={{ display: 'inline-block', padding: '4px 12px', background: '#DBEAFE', color: '#1D4ED8', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Institutional Overview
                  </span>
                  <h2 style={{ color: '#1E3A8A', marginBottom: '20px' }}>Welcome to CAIRLab</h2>
                  <p style={{ color: '#334155', lineHeight: '1.7', marginBottom: '16px' }}>
                    CAIRLab (Cybersecurity and Artificial Intelligence Research Laboratory) is dedicated to advancing the frontiers of AI and digital security — developing innovative solutions that protect data, empower communities, and drive responsible technology adoption.
                  </p>
                  <p style={{ color: '#334155', lineHeight: '1.7', marginBottom: '16px' }}>
                    Our multidisciplinary team works across adversarial machine learning, explainable AI, privacy-preserving systems, and real-world cybersecurity applications — bridging rigorous research with practical, deployable defenses.
                  </p>
                  <p style={{ color: '#334155', lineHeight: '1.7' }}>
                    We collaborate with academic institutions, industry partners, and government agencies to build robust technical capabilities and advance secure, trustworthy AI.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={150}>
                <div className="cl-video-card" style={{ padding: 0, overflow: 'hidden', background: '#0F172A', position: 'relative', aspectRatio: '16/9', borderRadius: '16px', border: '4px solid #DBEAFE', boxShadow: '0 20px 25px -5px rgba(29, 78, 216, 0.15)' }}>
                  <VideoPlayer
                    src="/videos/new_video_2.mp4"
                    poster="/images/cairlab-overview-poster.jpg"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="cl-video-overlay-top">
                    <div className="cl-video-overlay-channel">
                      <Image src="/images/logocair.png" alt="" width={28} height={28} />
                      <span>CAIRLab</span>
                    </div>
                    <strong className="cl-video-overlay-title">Institutional Overview</strong>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Impact stats — credibility signals for partners & investors */}
        <section className="cl-section" style={{ paddingTop: '56px', paddingBottom: '56px' }}>
          <div className="cl-wrap">
            <div className="cl-stats-row cl-stats-row--hero" style={{ marginTop: 0 }}>
              {homeStats.map((stat, i) => (
                <div
                  className="cl-stat cl-stat--hero"
                  key={stat.label}
                  style={{ '--card-image': `url(${HOME_STAT_IMAGES[i]})` } as CSSProperties}
                >
                  <div className="cl-stat-icon"><i className={`fa-solid fa-${stat.icon}`} aria-hidden="true"></i></div>
                  <strong className="cl-stat-number-lg"><CountUp value={stat.value} /></strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest News */}
        <section className="cl-section cl-section-mist">
          <div className="cl-wrap">
            <div className="cl-section-head">
              <h2>
                <span className="cl-section-icon"><i className="fa-solid fa-newspaper" aria-hidden="true"></i></span>
                Latest News
              </h2>
              <p>Stay informed about institutional announcements, groundbreaking research milestones, and community updates at CAIRLAB</p>
              <div className="cl-section-cta"><Link href="/news" className="cl-btn-blue">Explore All News →</Link></div>
            </div>
            <div className="cl-news-boxy-grid">
              {news.map((item, i) => (
                <Link href={`/news/${item.slug}`} className="cl-news-boxy-card" key={item.id}>
                  <div
                    className="cl-news-boxy-media"
                    style={{
                      background: item.image ? undefined : MEDIA_GRADIENTS[i % MEDIA_GRADIENTS.length],
                      backgroundImage: item.image ? `url(${item.image})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {item.tags.length > 0 && (
                      <div className="cl-news-boxy-tags">
                        {item.tags.map((tag: string) => (
                          <span className="cl-news-boxy-tag" key={tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <h3 className="cl-news-boxy-title">{item.title}</h3>
                  {(item.date || item.author) && (
                    <div className="cl-news-boxy-meta">
                      {item.date && <span>{item.date} <img src="/images/icon-calendar-3d.png" alt="" className="cl-icon-date-img" /></span>}
                      {item.author && <span><i className="fa-solid fa-user" aria-hidden="true"></i> {item.author}</span>}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Research Projects */}
        <section className="cl-section">
          <div className="cl-wrap">
            <Reveal>
              <div className="cl-section-head">
                <h2>
                  <span className="cl-section-icon"><i className="fa-solid fa-flask" aria-hidden="true"></i></span>
                  Research Projects
                </h2>
                <p>Cutting-edge initiatives building secure, trustworthy AI systems — from adversarial defense to privacy-preserving machine learning</p>
                <div className="cl-section-cta"><Link href="/projects" className="cl-btn-white" style={{ background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }}>View All Projects →</Link></div>
              </div>
            </Reveal>
            <div className="cl-projects-grid">
              {featuredProjects.map((project, i) => (
                <Reveal delay={i * 100} key={project.id}>
                  <div className="cl-project-card">
                    <div
                      className="cl-project-media"
                      style={{
                        background: project.image ? undefined : 'linear-gradient(160deg,#1E293B,#0F172A)',
                        backgroundImage: project.image ? `url(${project.image})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <span className="cl-project-tag">{project.tag}</span>
                      <h3>{project.title}</h3>
                    </div>
                    <div className="cl-project-body">
                      <p className="cl-project-desc">{project.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Partner logos */}
        <div className="cl-partners-wrap">
          <div className="cl-wrap">
            <Reveal>
              <p style={{ textAlign: 'center', color: 'var(--text-soft)', fontSize: '16px', fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '24px' , marginBottom: '24px' }}>

                Trusted by Leading Global Institutions
              </p>
              <PartnersCarousel partners={PARTNERS} />
            </Reveal>
            <Reveal delay={100}>
              <div className="cl-partners-cta">
                <div className="cl-partners-cta-icon"><i className="fa-solid fa-user-plus" aria-hidden="true"></i></div>
                <h3>Want to Get Involved with CAIRLab?</h3>
                <p>
                  Whether you&apos;re a researcher or an engineer passionate about secure,
                  trustworthy AI, we&apos;re always looking for talented people to join our work.
                </p>
                <a href="/apply-for-scholarship" className="cl-btn-blue">Apply Here →</a>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Events */}
        <section className="cl-section cl-section-black">
          <div className="cl-wrap">
            <Reveal>
              <div className="cl-section-head">
                <h2>
                  <span className="cl-section-icon"><i className="fa-solid fa-calendar-days" aria-hidden="true"></i></span>
                  Recent &amp; Upcoming Events
                </h2>
                <p>Participate in our specialized workshops, technical seminars, and academic conferences designed to foster open knowledge exchange</p>
                <div className="cl-section-cta"><a href="/events" className="cl-btn-blue">View All Events →</a></div>
              </div>
            </Reveal>
            <div className="cl-events-layout">
              <div className="cl-events-calendar">
                <img src="/images/icon-calendar-3d.png" alt="" />
              </div>
              <div className="cl-events-list">
                {upcomingEvents.map((event, i) => (
                  <Reveal delay={i * 100} key={event.id}>
                    <div className="cl-event-card">
                      <div
                        className="cl-event-thumb"
                        style={{
                          background: event.image ? undefined : (i === 0 ? 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' : 'linear-gradient(135deg, #0F172A, #1E293B)'),
                          backgroundImage: event.image ? `url(${event.image})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="cl-event-thumb-tag">{event.eventType}</div>
                      </div>
                      <div className="cl-event-body">
                        <div className="cl-event-meta">
                          <span>{event.date} <img src="/images/icon-calendar-3d.png" alt="" className="cl-icon-date-img" /></span>
                          {event.location && (
                            <span><i className="fa-solid fa-location-dot" aria-hidden="true"></i> {event.location}</span>
                          )}
                          {event.format && <span className="cl-event-pill">{event.format}</span>}
                        </div>
                        <h3>{event.title}</h3>
                        <div className="cl-event-footer-row">
                          {event.registrationStatus === 'open' ? (
                            <a href={event.registrationLink}>Register for Event →</a>
                          ) : (
                            <span className="cl-event-status-closed">Registration Closed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
