'use client';

// components/layout/AnnouncementBar.tsx
// Dismissible banner shown above the nav on every page. Client component so
// the close button can actually hide it — the dismissal is remembered for
// the browser tab/session via sessionStorage, so it stays closed while
// navigating around the site but reappears on a fresh visit.

import Link from 'next/link';
import { useEffect, useState } from 'react';

const DISMISS_KEY = 'cl-announce-dismissed';

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // sessionStorage doesn't exist during SSR, so this can only be read
    // after mount — unlike deriving state from a changing prop, there's no
    // render-time alternative here.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (sessionStorage.getItem(DISMISS_KEY) === '1') setDismissed(true);
    } catch {
      // sessionStorage unavailable (private mode, etc.) — just don't persist
    }
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore — non-critical if it can't persist
    }
  };

  return (
    <div className="cl-announce">
      <div className="cl-announce-pattern" />
      <div className="cl-announce-media" />
      <div className="cl-announce-inner">
        <div className="cl-announce-text">
          <strong>CAIRLAB Compute Share Initiative</strong>
          <span>Want to get involved as a student, researcher, or engineer?</span>
        </div>
        <Link href="/apply-for-scholarship" className="cl-announce-cta">
          Apply to Get Involved →
        </Link>
        <button className="cl-announce-close" aria-label="Dismiss" onClick={dismiss}>
          ✕
        </button>
      </div>
    </div>
  );
}
