// app/not-found.tsx
// Custom 404 page — Next.js renders this automatically for any unmatched
// route, replacing the framework's generic blank default.

import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="cl-section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="cl-wrap" style={{ textAlign: 'center' }}>
        <span
          className="cl-page-hero-kicker"
          style={{ background: 'var(--blue-subtle)', color: 'var(--blue-primary)' }}
        >
          404
        </span>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', margin: '20px 0 16px' }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-soft)', fontSize: '18px', maxWidth: '480px', margin: '0 auto 32px' }}>
          The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back
          on track.
        </p>
        <div className="cl-section-cta">
          <Link href="/" className="cl-btn-blue">Back to Home →</Link>
        </div>
      </div>
    </section>
  );
}
