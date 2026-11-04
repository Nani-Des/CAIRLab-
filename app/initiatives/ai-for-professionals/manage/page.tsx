// app/initiatives/ai-for-professionals/manage/page.tsx
// Opened from the secure link a partner organisation's manager receives by
// email (app/api/ai-for-professionals/manager-link). Shows their nominees
// and lets them nominate more (components/ai-for-professionals/ManageNominees).

import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/layout/PageHero';
import ManageNominees from '@/components/ai-for-professionals/ManageNominees';
import { readManagerToken } from '@/lib/aiProManagerToken';
import { getManagedPartner } from '@/lib/aiProPartners';
import { PROGRAMME_NAME, PROGRAMME_PATH } from '@/lib/aiForProfessionals';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Manage Nominations — CAIRLab',
  robots: { index: false, follow: false },
};

export default async function ManagePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const auth = readManagerToken(token);
  const partner = auth ? await getManagedPartner(auth.partnerId).catch(() => null) : null;

  return (
    <>
      <PageHero kicker={PROGRAMME_NAME} title="Manage Your Nominations" description="View your organisation's nominated staff and nominate more people." />
      <section className="cl-section">
        <div className="cl-wrap" style={{ maxWidth: '860px' }}>
          {!auth || !partner || !token ? (
            <div className="cl-form-success">
              <h3>This link has expired or isn&apos;t valid</h3>
              <p>Links work for 24 hours. Request a new one on the registration page by choosing &ldquo;Partner organisation manager&rdquo;.</p>
              <Link href={`${PROGRAMME_PATH}?role=manager`} className="cl-btn-blue">Request a new link →</Link>
            </div>
          ) : (
            <ManageNominees token={token} partner={partner.name} initial={partner.nominees} />
          )}
        </div>
      </section>
    </>
  );
}
