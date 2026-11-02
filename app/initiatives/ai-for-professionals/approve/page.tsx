// app/initiatives/ai-for-professionals/approve/page.tsx
// The page an employer lands on from the approval email
// (/initiatives/ai-for-professionals/approve?token=...). Shows who registered
// and the Approve / Reject buttons; the decision itself is saved by
// app/api/ai-for-professionals/decide/route.ts.

import { createHash } from 'node:crypto';
import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/layout/PageHero';
import ApprovalActions from '@/components/ai-for-professionals/ApprovalActions';
import { writeClient } from '@/sanity/lib/writeClient';
import { PROGRAMME_NAME } from '@/lib/aiForProfessionals';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Approve Registration — CAIRLab',
  robots: { index: false, follow: false },
};

type Registration = {
  status: string;
  fullName: string;
  email: string;
  organisation: string;
  jobTitle?: string;
  track?: string;
};

export default async function ApprovePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const reg = token
    ? await writeClient
        .fetch<Registration | null>(
          '*[_type == "aiProRegistration" && approvalTokenHash == $hash][0]{ status, fullName, email, organisation, jobTitle, track }',
          { hash: createHash('sha256').update(token).digest('hex') }
        )
        .catch(() => null)
    : null;

  return (
    <>
      <PageHero kicker={PROGRAMME_NAME} title="Employer Approval" description="Confirm whether your staff member may take part in the programme." />

      <section className="cl-section">
        <div className="cl-wrap" style={{ maxWidth: '680px' }}>
          {!reg || !token ? (
            <div className="cl-form-success">
              <h3>This link isn&apos;t valid</h3>
              <p>The approval link may be incomplete or out of date. Please use the full link from the email we sent you.</p>
              <Link href="/contact" className="cl-btn-blue">Contact Us →</Link>
            </div>
          ) : reg.status !== 'pending' ? (
            <div className="cl-form-success">
              <h3>Already answered</h3>
              <p>
                {reg.fullName}&apos;s registration has already been <strong>{reg.status}</strong>. No further action is
                needed.
              </p>
            </div>
          ) : (
            <div className="cl-form">
              <h3 className="cl-form-section-title">Approve {reg.fullName}?</h3>
              <p style={{ margin: 0 }}>
                <strong>{reg.fullName}</strong> has registered for the {PROGRAMME_NAME} programme and listed you as their
                employer or line manager.
              </p>
              <dl className="cl-aipro-details">
                <dt>Name</dt><dd>{reg.fullName}</dd>
                <dt>Email</dt><dd>{reg.email}</dd>
                <dt>Organisation</dt><dd>{reg.organisation}</dd>
                {reg.jobTitle && (<><dt>Job title</dt><dd>{reg.jobTitle}</dd></>)}
                {reg.track && (<><dt>Track</dt><dd>{reg.track}</dd></>)}
              </dl>
              <ApprovalActions token={token} name={reg.fullName} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
