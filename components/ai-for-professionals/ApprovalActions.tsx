'use client';

// components/ai-for-professionals/ApprovalActions.tsx
// Approve / Reject buttons on the employer's approval page. A click is
// required (rather than approving when the page loads) so email security
// scanners that open links automatically can't approve anyone by accident.

import { useState } from 'react';

type State = { kind: 'idle' | 'sending' } | { kind: 'done'; status: 'approved' | 'rejected' } | { kind: 'error'; message: string };

export default function ApprovalActions({ token, name }: { token: string; name: string }) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function decide(action: 'approve' | 'reject') {
    if (action === 'reject' && !window.confirm(`Reject ${name}'s registration?`)) return;
    setState({ kind: 'sending' });
    try {
      const res = await fetch('/api/ai-for-professionals/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action }),
      });
      const result = await res.json();
      if (!res.ok) {
        setState({ kind: 'error', message: result.error || 'Something went wrong. Please try again.' });
        return;
      }
      setState({ kind: 'done', status: result.status });
    } catch {
      setState({ kind: 'error', message: 'Network error — please check your connection and try again.' });
    }
  }

  if (state.kind === 'done') {
    return (
      <div className={`cl-aipro-decision ${state.status}`}>
        <i className={`fa-solid ${state.status === 'approved' ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true"></i>
        <p>
          {state.status === 'approved'
            ? `Thank you — ${name} has been approved. We've let them know by email.`
            : `${name}'s registration has been rejected. We've let them know by email.`}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="cl-aipro-approve-buttons">
        <button type="button" className="cl-aipro-approve" onClick={() => decide('approve')} disabled={state.kind === 'sending'}>
          <i className="fa-solid fa-check" aria-hidden="true"></i> Approve
        </button>
        <button type="button" className="cl-aipro-reject" onClick={() => decide('reject')} disabled={state.kind === 'sending'}>
          <i className="fa-solid fa-xmark" aria-hidden="true"></i> Reject
        </button>
      </div>
      {state.kind === 'sending' && <p className="cl-form-hint">Saving…</p>}
      {state.kind === 'error' && <p className="cl-form-error" style={{ marginTop: 16 }}>{state.message}</p>}
    </div>
  );
}
