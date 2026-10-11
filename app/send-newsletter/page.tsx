// app/send-newsletter/page.tsx
// Internal tool: write a message and send it to every saved newsletter
// subscriber (see app/api/newsletter/route.ts for how people sign up, and
// app/api/send-newsletter/route.ts for the send itself). Password-gated,
// not linked from anywhere in the site's navigation, and excluded from
// search engines — reach it by typing the URL directly.

import type { Metadata } from 'next';
import SendNewsletterForm from '@/components/newsletter/SendNewsletterForm';

export const metadata: Metadata = {
  title: 'Send Newsletter — CAIRLab',
  robots: { index: false, follow: false },
};

export default function SendNewsletterPage() {
  return (
    <section className="cl-section" style={{ minHeight: '70vh' }}>
      <div className="cl-wrap" style={{ maxWidth: '640px' }}>
        <div className="cl-section-head" style={{ textAlign: 'left', margin: '0 0 32px' }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 12px' }}>Send Newsletter</h1>
          <p style={{ margin: 0 }}>
            Sends your message to everyone who signed up in the footer. Important: until{' '}
            <strong>cairlab.org</strong> (or whatever domain you use) is verified in Resend, emails can
            only actually reach the address your Resend account was signed up with — sends to other
            subscribers will show as failed below until that&apos;s done.
          </p>
        </div>
        <SendNewsletterForm />
      </div>
    </section>
  );
}
