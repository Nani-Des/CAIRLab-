// components/layout/NewsletterSignup.tsx
// Small email-capture form in the footer — submits to
// app/api/newsletter/route.ts, which saves the subscriber in Sanity and
// (if Resend is configured) emails a quick notification.

'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(result.error || 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMessage('Network error — please try again.');
    }
  }

  if (status === 'success') {
    return (
      <p className="cl-newsletter-success">
        <i className="fa-solid fa-circle-check" aria-hidden="true"></i> You&apos;re subscribed — thanks for joining!
      </p>
    );
  }

  return (
    <form className="cl-newsletter-form" onSubmit={handleSubmit}>
      <div className="cl-newsletter-row">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
        />
        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {status === 'error' && <p className="cl-newsletter-error">{errorMessage}</p>}
    </form>
  );
}
