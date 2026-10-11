// components/contact/ContactForm.tsx
// Client-side contact form — submits to app/api/contact/route.ts, which
// sends the message on via Resend. Shows a loading state on the submit
// button and a success/error message instead of the form once submitted.

'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      subject: String(data.get('subject') || ''),
      message: String(data.get('message') || ''),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(result.error || 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
      setErrorMessage('Network error — please check your connection and try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="cl-form-success">
        <div className="cl-form-success-icon">✓</div>
        <h3>Message Sent!</h3>
        <p>Thanks for reaching out — we&apos;ll get back to you as soon as possible.</p>
        <button type="button" className="cl-btn-blue" onClick={() => setStatus('idle')}>
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form className="cl-form" onSubmit={handleSubmit}>
      <div className="cl-form-row">
        <div>
          <label htmlFor="name">Full Name</label>
          <input id="name" name="name" type="text" placeholder="Ada Lovelace" required />
        </div>
        <div>
          <label htmlFor="email">Email Address</label>
          <input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
      </div>
      <div>
        <label htmlFor="subject">Subject</label>
        <input id="subject" name="subject" type="text" placeholder="Research collaboration" required />
      </div>
      <div>
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" placeholder="Tell us more..." required />
      </div>

      {status === 'error' && <p className="cl-form-error">{errorMessage}</p>}

      <button type="submit" className="cl-btn-blue" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send Message →'}
      </button>
    </form>
  );
}
