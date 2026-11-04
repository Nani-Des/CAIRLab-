// app/initiatives/ai-for-professionals/page.tsx
// KNUST–GIZ AI for Professionals registration for employers and employees
// (components/ai-for-professionals/RegistrationFlow), linked from the
// programme's card on /initiatives. ?role=employer preselects the employer
// form — used by the invitation link emailed to employers who haven't
// registered yet.

import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/layout/PageHero';
import RegistrationFlow, { type Role } from '@/components/ai-for-professionals/RegistrationFlow';
import { buildOpenGraph, buildTwitter } from '@/lib/seo';
import { PROGRAMME_PATH } from '@/lib/aiForProfessionals';
import { getAiProSettings } from '@/lib/aiProSettings';
import { getPartnerNames } from '@/lib/aiProPartners';

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
  // ?role=partner|nonPartner|graduate preselects a path (older links used employee/employer).
  const roles: Record<string, Role> = { partner: 'partner', employee: 'partner', manager: 'manager', employer: 'manager', nonPartner: 'nonPartner', graduate: 'graduate' };
  const initialRole = role ? roles[role] : undefined;
  const [settings, partners] = await Promise.all([getAiProSettings(), getPartnerNames()]);

  return (
    <>
      <PageHero
        kicker="Initiatives · KNUST × GIZ"
        title="AI for Professionals — Registration"
        description="Staff nominated by partner organisations register here, organisations can find out how to become partners, and graduates apply with their transcript and CV."
        image="/images/projects-hero.jpg"
      />

      <section className="cl-section">
        <div className="cl-wrap" style={{ maxWidth: '860px' }}>
          <p style={{ marginTop: 0 }}>
            <Link href="/initiatives#ai-for-professionals">← Back to the programme</Link>
          </p>
          {settings.registrationOpen ? (
            <RegistrationFlow initialRole={initialRole} partners={partners} />
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
