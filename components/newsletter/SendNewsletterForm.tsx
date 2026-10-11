// components/newsletter/SendNewsletterForm.tsx
// Password + subject + message, POSTs to app/api/send-newsletter/route.ts,
// then shows exactly how many sends succeeded/failed (and to which
// addresses) — not a generic "success" message, since partial failure is
// the expected case until a domain is verified in Resend.

'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'done' | 'error';
type Result = { total: number; sent: number; failed: number; failedDetails: { email: string; error?: string }[] };

export default function SendNewsletterForm() {
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');
    setResult(null);

    try {
      const res = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, subject, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong.');
        return;
      }

      setResult(data);
      setStatus('done');
    } catch {
      setStatus('error');
      setErrorMessage('Network error — please try again.');
    }
  }

  return (
    <form className="cl-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="nl-password">Password</label>
        <input
          id="nl-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="nl-subject">Subject</label>
        <input
          id="nl-subject"
          type="text"
          required
          placeholder="What's this update about?"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="nl-message">Message</label>
        <textarea
          id="nl-message"
          required
          style={{ minHeight: '200px' }}
          placeholder="Write your update here — one paragraph per line."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {status === 'error' && <p className="cl-form-error">{errorMessage}</p>}

      <button type="submit" className="cl-btn-blue" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send to All Subscribers'}
      </button>

      {status === 'done' && result && (
        <div className="cl-newsletter-result">
          <p>
            <strong>{result.sent}</strong> of <strong>{result.total}</strong> sent successfully.
            {result.failed > 0 && <> {result.failed} failed.</>}
          </p>
          {result.failedDetails.length > 0 && (
            <ul>
              {result.failedDetails.map((f) => (
                <li key={f.email}>
                  {f.email} — {f.error || 'unknown error'}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
