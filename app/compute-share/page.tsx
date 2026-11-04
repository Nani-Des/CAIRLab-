// app/compute-share/page.tsx
// Cybersecurity & AI Certification Initiative (formerly "Compute Share"; the
// URL stays /compute-share) — linked from the announcement bar. A landing
// page listing the EC-Council certifications people can pursue; interested
// people email Dr. Ahene (components/compute-share/ComputeShareForm.tsx). No prices, dates or
// discounts are stated here — those come from the programme team by email.

import type { Metadata } from 'next';
import PageHero from '@/components/layout/PageHero';
import ComputeShareForm from '@/components/compute-share/ComputeShareForm';
import { buildOpenGraph, buildTwitter } from '@/lib/seo';

const TITLE = 'Cybersecurity & AI Certification Initiative — CAIRLab';
const DESCRIPTION =
  'Get certified with the CAIRLab Cybersecurity & AI Certification Initiative — CEH and other EC-Council certification exams, with guidance from CAIRLab, KNUST.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph(TITLE, DESCRIPTION, { path: '/compute-share' }),
  twitter: buildTwitter(TITLE, DESCRIPTION),
};

const CERTIFICATIONS = [
  {
    code: 'CEH',
    name: 'Certified Ethical Hacker',
    icon: 'fa-user-secret',
    text: 'The best-known ethical hacking certification: find weaknesses the way attackers would, then fix them.',
    for: 'Aspiring penetration testers & security analysts',
  },
  {
    code: 'CCT',
    name: 'Certified Cybersecurity Technician',
    icon: 'fa-screwdriver-wrench',
    text: 'An entry-level certification covering the core technical skills of cybersecurity.',
    for: 'Beginners starting a cybersecurity career',
  },
  {
    code: 'CND',
    name: 'Certified Network Defender',
    icon: 'fa-network-wired',
    text: 'Protect, detect and respond to threats on an organisation’s network.',
    for: 'Network & system administrators',
  },
  {
    code: 'CSA',
    name: 'Certified SOC Analyst',
    icon: 'fa-tower-observation',
    text: 'Work in a Security Operations Centre: monitor alerts, investigate incidents and escalate threats.',
    for: 'SOC & security monitoring roles',
  },
  {
    code: 'CHFI',
    name: 'Computer Hacking Forensic Investigator',
    icon: 'fa-magnifying-glass',
    text: 'Investigate cyber incidents and collect digital evidence that holds up.',
    for: 'Incident responders & digital forensics',
  },
  {
    code: '+',
    name: 'Other EC-Council exams',
    icon: 'fa-layer-group',
    text: 'Interested in a different EC-Council certification? Let us know which one in your email.',
    for: 'Ask us about other certifications',
  },
];

export default function ComputeSharePage() {
  return (
    <>
      <PageHero
        kicker="Cybersecurity & AI Certification Initiative"
        title="Get Certified. Get Ahead."
        description="Thinking about writing CEH or another EC-Council exam? CAIRLab, KNUST can help you take the next step in your cybersecurity career."
        image="/images/announce.jpg"
      />

      <section className="cl-section">
        <div className="cl-wrap">
          <div className="cl-section-head">
            <h2>Certifications you can pursue</h2>
            <p>Popular EC-Council certifications — tell us which one you&apos;re interested in.</p>
          </div>
          <div className="cl-cert-grid">
            {CERTIFICATIONS.map((c) => (
              <article className="cl-cert-card" key={c.name}>
                <div className="cl-cert-card-top">
                  <span className="cl-cert-icon"><i className={`fa-solid ${c.icon}`} aria-hidden="true"></i></span>
                  <span className="cl-cert-code">{c.code}</span>
                </div>
                <h3>{c.name}</h3>
                <p>{c.text}</p>
                <span className="cl-cert-for"><i className="fa-solid fa-user" aria-hidden="true"></i> {c.for}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cl-section cl-section-mist" id="get-started">
        <div className="cl-wrap" style={{ maxWidth: '720px' }}>
          <ComputeShareForm />
        </div>
      </section>

    </>
  );
}
