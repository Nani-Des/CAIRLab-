'use client';

// components/ai-for-professionals/ManageNominees.tsx
// The partner manager's view (opened from their emailed link): their current
// nominees, who has registered, and a form to nominate more staff. Changes
// are saved to Sanity by app/api/ai-for-professionals/nominees/route.ts.

import { useState, type FormEvent } from 'react';
import { HUBS, TRACKS } from '@/lib/aiForProfessionals';
import type { ManagedNominee } from '@/lib/aiProPartners';

export default function ManageNominees({ token, partner, initial }: { token: string; partner: string; initial: ManagedNominee[] }) {
  const [nominees, setNominees] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  async function call(payload: Record<string, unknown>) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/ai-for-professionals/nominees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...payload }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ tone: 'error', text: result.error || 'Something went wrong. Please try again.' });
        return false;
      }
      setNominees(result.nominees);
      return true;
    } catch {
      setMessage({ tone: 'error', text: 'Network error — please check your connection and try again.' });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (await call({ action: 'add', ...data })) {
      form.reset();
      setMessage({ tone: 'ok', text: `${data.fullName} has been nominated and emailed an invitation to register.` });
    }
  }

  async function remove(n: ManagedNominee) {
    if (!window.confirm(`Remove ${n.fullName} from your nominations?`)) return;
    if (await call({ action: 'remove', key: n.key })) setMessage({ tone: 'ok', text: `${n.fullName} has been removed.` });
  }

  return (
    <div className="cl-aipro">
      <div className="cl-form">
        <h3 className="cl-form-section-title">{partner} — nominated staff</h3>
        {nominees.length === 0 ? (
          <p className="cl-aipro-lead">You haven&apos;t nominated anyone yet. Use the form below to nominate your staff.</p>
        ) : (
          <ul className="cl-aipro-nominees">
            {nominees.map((n) => (
              <li key={n.key}>
                <div>
                  <strong>{n.fullName || n.email}</strong>
                  <span>{[n.email, n.track, n.hub].filter(Boolean).join(' · ')}</span>
                </div>
                {n.registered ? (
                  <span className="cl-aipro-badge ok"><i className="fa-solid fa-circle-check" aria-hidden="true"></i> Registered</span>
                ) : (
                  <>
                    <span className="cl-aipro-badge">Not registered yet</span>
                    <button type="button" className="cl-aipro-linkbtn" onClick={() => remove(n)} disabled={busy}>Remove</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="cl-form-hint">
          The programme&apos;s &ldquo;Train-2&rdquo; model is two staff per organisation. Nominated staff register themselves on the
          registration page with the email you enter here.
        </p>
      </div>

      <form className="cl-form" onSubmit={add}>
        <h3 className="cl-form-section-title">Nominate a staff member</h3>
        <div className="cl-form-row">
          <div>
            <label htmlFor="fullName">Full name *</label>
            <input id="fullName" name="fullName" required />
          </div>
          <div>
            <label htmlFor="email">Email address *</label>
            <input id="email" name="email" type="email" required placeholder="they will register with this email" />
          </div>
        </div>
        <div className="cl-form-row">
          <div>
            <label htmlFor="jobTitle">Job title</label>
            <input id="jobTitle" name="jobTitle" />
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" />
          </div>
        </div>
        <div className="cl-form-row">
          <div>
            <label htmlFor="track">Track *</label>
            <select id="track" name="track" required defaultValue="">
              <option value="" disabled>Select a track</option>
              {TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="hub">Preferred hub</label>
            <select id="hub" name="hub" defaultValue="">
              <option value="">Select</option>
              {HUBS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
        {message && <p className={message.tone === 'ok' ? 'cl-aipro-notice-ok' : 'cl-form-error'}>{message.text}</p>}
        <button type="submit" className="cl-btn-blue" disabled={busy}>{busy ? 'Saving…' : 'Nominate →'}</button>
      </form>
    </div>
  );
}
