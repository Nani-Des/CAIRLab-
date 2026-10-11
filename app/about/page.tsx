// app/about/page.tsx
// About page — CAIRLab mission, vision, journey, and values.

import type { Metadata } from 'next';
import PageHero from '@/components/layout/PageHero';
import VideoPlayer from '@/components/media/VideoPlayer';
import { buildOpenGraph, buildTwitter } from '@/lib/seo';

const TITLE = 'About — CAIRLab';
const DESCRIPTION =
  'CAIRLab (Cybersecurity and Artificial Intelligence Research Laboratory) advances AI and digital security research to protect data, empower communities, and drive responsible technology adoption.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph(TITLE, DESCRIPTION, { path: '/about' }),
  twitter: buildTwitter(TITLE, DESCRIPTION),
};

// Each milestone has an `image` slot (gif or static image both work — an
// animated gif just plays automatically). Give each one a path under
// public/images/ (e.g. "/images/journey-2015.png"); until a file exists
// there, that milestone just shows a plain gray circle, same graceful
// fallback used for photos elsewhere on the site.
const JOURNEY = [
  {
    year: '2015',
    image: '/images/journey-2015.png',
    title: 'Foundation of CAIRLab',
    description:
      'Established with a vision to bridge the gap between AI research and cybersecurity applications. Started with a small team of 5 researchers and one research project.',
  },
  {
    year: '2017',
    image: '/images/journey-2017.png',
    title: 'First Major Research Breakthrough',
    description:
      'Developed novel adversarial defense mechanisms for neural networks, published in top-tier conferences and attracting industry partnerships.',
  },
  {
    year: '2019',
    image: '/images/journey-2019.png',
    title: 'Expansion & New Labs',
    description:
      'Expanded research facilities and established specialized labs for SecureAI, SignTalk, and AI for Food Sustainability. Team grew to 15 members.',
  },
  {
    year: '2021',
    image: '/images/journey-2021.png',
    title: 'Industry Recognition',
    description:
      'Received multiple awards for innovation in AI security and established partnerships with leading tech companies and academic institutions worldwide.',
  },
  {
    year: '2023',
    image: '/images/journey-2023.png',
    title: 'Global Impact',
    description:
      'Our research directly contributed to securing critical infrastructure and developing international standards for ethical AI deployment. Team expanded to 25+ experts across multiple disciplines.',
  },
];

const VALUES = [
  {
    icon: '🛡️',
    title: 'Security First',
    description:
      'We prioritize security in all our research and development, ensuring that our AI systems are robust, resilient, and trustworthy.',
  },
  {
    icon: '🚀',
    title: 'Innovation',
    description:
      'We push boundaries and explore uncharted territories in AI and cybersecurity, constantly seeking novel approaches and solutions.',
  },
  {
    icon: '🤝',
    title: 'Collaboration',
    description:
      'We believe in the power of teamwork and partnerships, working together with academia, industry, and communities.',
  },
  {
    icon: '⚖️',
    title: 'Ethics & Responsibility',
    description:
      "We're committed to developing AI technologies that are ethical, transparent, and beneficial to society as a whole.",
  },
  {
    icon: '🎓',
    title: 'Education & Mentorship',
    description:
      "We're dedicated to nurturing the next generation of AI and cybersecurity experts through training and mentorship programs.",
  },
  {
    icon: '🌐',
    title: 'Global Impact',
    description:
      'Our research aims to address global challenges and create positive change through secure and responsible AI technologies.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="About Us"
        title="Cybersecurity & AI Research for a Safer Digital Future"
        description="The Cybersecurity and Artificial Intelligence Research Laboratory (CAIRLab) is dedicated to advancing the frontiers of AI and digital security. Our mission is to develop innovative solutions that protect data, empower communities, and drive responsible technology adoption."
        image="/images/aboutimg.jpg"
      />

      <section className="cl-section">
        <div className="cl-wrap">
          <div className="cl-about-split">
            <div>
              <p style={{ fontSize: '20px' }}>
                Our multidisciplinary team collaborates on projects ranging from adversarial
                machine learning to explainable AI, privacy-preserving systems, and real-world
                cybersecurity applications. We believe in ethical research, transparency, and
                making a positive impact through technology.
              </p>
              <div className="cl-stat" style={{ display: 'inline-block', padding: '28px 56px', marginTop: '16px' }}>
                <strong>9+</strong>
                <span>Years Research Excellence</span>
              </div>
            </div>
            <div className="cl-video-card" style={{ padding: 0, overflow: 'hidden', background: '#0F172A', position: 'relative', aspectRatio: '16/9', borderRadius: '16px', border: '4px solid var(--blue-subtle)', boxShadow: '0 20px 25px -5px rgba(29, 78, 216, 0.15)' }}>
              <VideoPlayer
                src="/videos/new_cairlab.mp4"
                poster="/images/clvideo-poster.jpg"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="cl-section cl-section-mist">
        <div className="cl-wrap">
          <div className="cl-section-head">
            <h2>Pioneering the Future of AI &amp; Cybersecurity</h2>
            <p>
              At CAIRLab, we&apos;re at the forefront of cybersecurity and artificial
              intelligence research, developing innovative solutions to protect digital
              ecosystems and advance responsible AI adoption.
            </p>
          </div>
          <div className="cl-about-split">
            <div>
              <h3>Our Mission</h3>
              <p>
                To advance the frontiers of artificial intelligence and cybersecurity through
                cutting-edge research, innovation, and collaboration. We develop robust AI
                systems that safeguard digital infrastructure while promoting ethical and
                responsible technology adoption.
              </p>
              <p>
                Our interdisciplinary approach combines theoretical research with practical
                applications, ensuring our work has real-world impact in protecting critical
                systems and data.
              </p>
            </div>
            <div>
              <h3>Our Vision</h3>
              <p>
                We envision a future where AI and cybersecurity work in harmony to create
                secure, trustworthy digital environments that empower individuals,
                organizations, and societies to thrive in an increasingly connected world.
              </p>
              <p>
                Through our research, we aim to establish new paradigms in secure AI
                development, threat intelligence, and privacy-preserving technologies that set
                global standards for excellence and ethical practice.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cl-section" id="journey">
        <div className="cl-wrap">
          <div className="cl-section-head">
            <span className="cl-page-hero-kicker" style={{ background: 'var(--blue-subtle)', color: 'var(--blue-primary)' }}>
              Our Journey
            </span>
            <h2>Milestones &amp; Achievements</h2>
            <p>
              From humble beginnings to becoming a leading research laboratory in AI and
              cybersecurity
            </p>
          </div>
          <div className="cl-journey-blocks">
            {JOURNEY.map((item, i) => (
              <div className={`cl-journey-block${i % 2 === 1 ? ' cl-journey-block--reverse' : ''}`} key={item.year}>
                <div className="cl-journey-block-text">
                  <span className="cl-journey-year">{item.year}</span>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
                <div
                  className="cl-journey-block-image"
                  aria-hidden="true"
                  style={{ '--card-image': `url(${item.image})` } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cl-section cl-section-mist" id="values">
        <div className="cl-wrap">
          <div className="cl-section-head">
            <span className="cl-page-hero-kicker" style={{ background: 'var(--blue-subtle)', color: 'var(--blue-primary)' }}>
              Our Principles
            </span>
            <h2>Core Values That Guide Us</h2>
            <p>The foundation of everything we do at CAIRLab</p>
          </div>
          <div className="cl-boxy-grid">
            {VALUES.map((value) => (
              <div className="cl-boxy-card" key={value.title}>
                <div className="cl-boxy-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cl-section cl-section-black">
        <div className="cl-wrap">
          <div className="cl-section-head">
            <h2>Join Us in Shaping the Future</h2>
            <p>
              Whether you&apos;re a researcher, student, industry partner, or simply passionate
              about AI and cybersecurity, there are many ways to get involved with CAIRLab.
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
