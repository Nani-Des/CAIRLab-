// app/compute-share/page.tsx
// Compute Share Initiative sign-up — linked from the announcement bar.
// ComputeShareForm is an email button that opens a message to
// Dr. Ahene (no server route — app/api/compute-share was removed).

import type { Metadata } from 'next';
import PageHero from '@/components/layout/PageHero';
import ComputeShareForm from '@/components/compute-share/ComputeShareForm';
import { buildOpenGraph, buildTwitter } from '@/lib/seo';

const TITLE = 'Compute Share Initiative — CAIRLab';
const DESCRIPTION =
  'Get involved in the CAIRLab Compute Share Initiative as a student, researcher, or engineer.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph(TITLE, DESCRIPTION, { path: '/compute-share' }),
  twitter: buildTwitter(TITLE, DESCRIPTION),
};

export default function ComputeSharePage() {
  return (
    <>
      <PageHero
        kicker="Compute Share Initiative"
        title="Get Involved"
        description="Are you interested in writing CEH or any other EC-Council exam? Leave your details and we'll be in touch."
        image="/images/announce.jpg"
      />

      <section className="cl-section">
        <div className="cl-wrap" style={{ maxWidth: '760px' }}>
          <ComputeShareForm />
        </div>
      </section>
    </>
  );
}
