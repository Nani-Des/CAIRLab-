// app/apply-for-scholarship/page.tsx
// Scholarship application page — PhD & MPhil scholarships in Cybersecurity / Computer Science.
// The form (ScholarshipForm) submits to app/api/apply-scholarship/route.ts,
// which emails the application + attached documents via Resend to the same
// inbox as the contact form (CONTACT_TO_EMAIL in .env.local).

import type { Metadata } from 'next';
import PageHero from '@/components/layout/PageHero';
import ScholarshipForm from '@/components/scholarship/ScholarshipForm';
import { buildOpenGraph, buildTwitter } from '@/lib/seo';

const TITLE = 'Apply for a Scholarship — CAIRLab';
const DESCRIPTION =
  "Fully-funded PhD and MPhil scholarships in Cybersecurity and Computer Science at CAIRLab. Join our research in AI and Cybersecurity.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph(TITLE, DESCRIPTION, { path: '/apply-for-scholarship' }),
  twitter: buildTwitter(TITLE, DESCRIPTION),
};

const PROGRAMS = [
  {
    icon: 'fa-graduation-cap',
    title: 'PhD Programs',
    description:
      '4-year fully-funded doctoral programs in Cybersecurity and AI Research with stipend and research funding.',
  },
  {
    icon: 'fa-user-graduate',
    title: 'MPhil Programs',
    description:
      '2-year research masters programs with opportunities to transition to PhD studies.',
  },
  {
    icon: 'fa-sack-dollar',
    title: 'Full Funding',
    description:
      'Comprehensive funding package including tuition, stipend, research expenses, and conference travel.',
  },
];

const STEPS = [
  { label: 'Personal Information', sub: 'Basic details & contact' },
  { label: 'Academic Background', sub: 'Education & qualifications' },
  { label: 'Research Interests', sub: 'Proposal & objectives' },
  { label: 'Documents Upload', sub: 'Required files' },
  { label: 'Review & Submit', sub: 'Final confirmation' },
];

// Answers restate what's already established elsewhere on this page (the
// program list, funding, eligibility criteria, and required documents) —
// nothing here is a new policy claim that isn't backed by content above.
const FAQS = [
  {
    q: 'What programs are available?',
    a: 'A 4-year fully-funded PhD in Cybersecurity and AI Research, and a 2-year MPhil research masters program with an option to transition to PhD studies.',
  },
  {
    q: 'What does the funding cover?',
    a: 'Tuition, stipend, research expenses, and conference travel — a comprehensive funding package for the full duration of the program.',
  },
  {
    q: 'What are the minimum academic requirements?',
    a: 'First Class or Upper Second Class honors in Computer Science, Cybersecurity, or a related field, with a minimum GPA of 3.5/4.0 or equivalent.',
  },
  {
    q: 'Do I need prior research experience?',
    a: 'Yes — demonstrable research experience through academic projects, publications, or relevant work experience in cybersecurity or AI.',
  },
  {
    q: "What if English isn't my first language?",
    a: 'Non-native English speakers need an IELTS score of 7.0, TOEFL 100, or an equivalent English proficiency test result.',
  },
  {
    q: 'What documents do I need to apply?',
    a: 'A personal statement, academic transcripts, degree certificates, at least two recommendation letters, and a CV/resume — all uploaded as part of the online application. A list of publications is optional if you have any.',
  },
];

const ELIGIBILITY = [
  {
    icon: 'fa-award',
    title: 'Academic Qualifications',
    description:
      'First Class or Upper Second Class honors in Computer Science, Cybersecurity, or related field. Minimum GPA of 3.5/4.0 or equivalent.',
  },
  {
    icon: 'fa-flask',
    title: 'Research Experience',
    description:
      'Demonstrable research experience through projects, publications, or relevant work experience in cybersecurity/AI.',
  },
  {
    icon: 'fa-code',
    title: 'Technical Skills',
    description:
      'Proficiency in programming (Python, C++, Java), machine learning frameworks, and cybersecurity tools.',
  },
  {
    icon: 'fa-language',
    title: 'English Proficiency',
    description:
      'For non-native speakers: IELTS 7.0, TOEFL 100, or equivalent English language proficiency test scores.',
  },
  {
    icon: 'fa-file-lines',
    title: 'Research Proposal',
    description:
      "Well-articulated research statement aligning with CAIRLab's research focus areas.",
  },
  {
    icon: 'fa-envelope-open-text',
    title: 'Recommendation Letters',
    description:
      'At least two academic recommendation letters from professors familiar with your research capabilities.',
  },
];

export default function ScholarshipPage() {
  return (
    <>
      <PageHero
        kicker="Scholarship Applications"
        title="PhD & MPhil Scholarships in Cybersecurity / Computer Science"
        description="Join CAIRLab's cutting-edge research in AI and Cybersecurity. Fully-funded scholarships available for outstanding candidates."
        image="/images/scholarship-hero.jpg"
      />

      <section className="cl-section">
        <div className="cl-wrap">
          <div className="cl-info-grid">
            {PROGRAMS.map((program) => (
              <div className="cl-info-card" key={program.title}>
                <div className="cl-info-icon"><i className={`fa-solid ${program.icon}`} aria-hidden="true"></i></div>
                <h3>{program.title}</h3>
                <p>{program.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cl-section cl-section-mist">
        <div className="cl-wrap" style={{ display: 'grid', gap: '48px' }}>
          <div>
            <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Application Progress</h2>
            <div className="cl-stepper">
              {STEPS.map((step, i) => (
                <div className={`cl-stepper-step${i === 0 ? ' active' : ''}`} key={step.label}>
                  <div className="cl-stepper-number">{i + 1}</div>
                  <div>
                    <div className="cl-stepper-label">{step.label}</div>
                    <div className="cl-stepper-sub">{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cl-deadline-callout">
            <div className="cl-deadline-icon"><i className="fa-solid fa-hourglass-half" aria-hidden="true"></i></div>
            <div>
              <h4>Application Deadline: October 27, 2025</h4>
              <p>Applications close at 11:59pm</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cl-section">
        <div className="cl-wrap">
          <ScholarshipForm />
        </div>
      </section>

      <section className="cl-section cl-section-mist">
        <div className="cl-wrap">
          <div className="cl-section-head">
            <h2>Eligibility &amp; Requirements</h2>
            <p>Ensure you meet all requirements before submitting your application</p>
          </div>
          <div className="cl-info-grid">
            {ELIGIBILITY.map((item) => (
              <div className="cl-info-card" key={item.title}>
                <div className="cl-info-icon"><i className={`fa-solid ${item.icon}`} aria-hidden="true"></i></div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cl-section">
        <div className="cl-wrap" style={{ maxWidth: '760px' }}>
          <div className="cl-section-head">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers before you start your application</p>
          </div>
          <div className="cl-faq-list">
            {FAQS.map((item) => (
              <details className="cl-faq-item" key={item.q}>
                <summary>
                  {item.q}
                  <i className="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
