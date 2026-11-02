// app/initiatives/ai-for-professionals/page.tsx
// KNUST–GIZ AI for Professionals registration for employers and employees
// (components/ai-for-professionals/RegistrationFlow), linked from the
// programme's card on /initiatives. ?role=employer preselects the employer
// form — used by the invitation link emailed to employers who haven't
// registered yet.

import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/layout/PageHero';
import RegistrationFlow from '@/components/ai-for-professionals/RegistrationFlow';
import { buildOpenGraph, buildTwitter } from '@/lib/seo';
import { PROGRAMME_PATH } from '@/lib/aiForProfessionals';
import { getAiProSettings } from '@/lib/aiProSettings';

const TITLE = 'Register — AI for Professionals (KNUST–GIZ) — CAIRLab';
const DESCRIPTION =
  'Register for the KNUST–GIZ AI for Professionals programme: practical, employer-validated AI skills training for staff, with employer approval.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph(TITLE, DESCRIPTION, { path: PROGRAMME_PATH }),
  twitter: buildTwitter(TITLE, DESCRIPTION),
};

export default async function AiForProfessionalsPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const initialRole = role === 'employer' || role === 'employee' || role === 'graduate' ? role : undefined;
  const settings = await getAiProSettings();

  return (
    <>
      <PageHero
        kicker="Initiatives · KNUST × GIZ"
        title="AI for Professionals — Registration"
        description="Employers register their organisation, staff register with their employer's approval, and tertiary students and graduates apply to join."
        image="/images/projects-hero.jpg"
      />

      <section className="cl-section">
        <div className="cl-wrap" style={{ maxWidth: '860px' }}>
          <p style={{ marginTop: 0 }}>
            <Link href="/initiatives#ai-for-professionals">← Back to the programme</Link>
          </p>
          {settings.registrationOpen ? (
            <RegistrationFlow initialRole={initialRole} />
          ) : (
            <div className="cl-form-success">
              <div className="cl-aipro-closed-icon"><i className="fa-solid fa-lock" aria-hidden="true"></i></div>
              <h3>Registration closed</h3>
              <p>{settings.closedMessage}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
