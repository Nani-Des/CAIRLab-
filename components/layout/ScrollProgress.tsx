// components/layout/ScrollProgress.tsx
// Fixed circle (bottom-right, every page) with the CAIRLab logo in the
// center. A ring around it fills in as you scroll down the page, and
// clicking it smooth-scrolls back to the top.
//
// It also surfaces a small dismissible popup (the "Site Popup" singleton
// in Studio — see sanity/schemaTypes/sitePopup.ts) — real data from Sanity,
// fetched server-side and passed in as `sitePopup` (see app/layout.tsx),
// not shown again this browser session once closed.

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const POPUP_DISMISS_KEY = 'cl-site-popup-dismissed';

export type SitePopupData = { badge: string; title: string; tagline: string; linkText: string; linkHref: string } | null;

export default function ScrollProgress({ sitePopup }: { sitePopup: SitePopupData }) {
  const [progress, setProgress] = useState(0);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    let ticking = false;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;
      setProgress(pct);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!sitePopup) return;

    let alreadyDismissed = false;
    try {
      alreadyDismissed = sessionStorage.getItem(POPUP_DISMISS_KEY) === '1';
    } catch {
      // sessionStorage unavailable — just don't persist the dismissal
    }
    if (alreadyDismissed) return;

    const timer = setTimeout(() => setPopupOpen(true), 1500);
    return () => clearTimeout(timer);
  }, [sitePopup]);

  function scrollToTop() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function dismissPopup() {
    setPopupOpen(false);
    try {
      sessionStorage.setItem(POPUP_DISMISS_KEY, '1');
    } catch {
      // ignore — non-critical if it can't persist
    }
  }

  const offset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <div className="cl-scroll-progress-wrap">
      {popupOpen && sitePopup && (
        <div className="cl-hackathon-popup" role="dialog" aria-label="Announcement">
          <button type="button" className="cl-hackathon-popup-close" aria-label="Dismiss" onClick={dismissPopup}>
            ✕
          </button>
          {sitePopup.badge && (
            <span className="cl-hackathon-popup-badge">
              <span className="cl-status-dot" /> {sitePopup.badge}
            </span>
          )}
          <strong>{sitePopup.title}</strong>
          {sitePopup.tagline && <p>{sitePopup.tagline}</p>}
          <Link href={sitePopup.linkHref} className="cl-hackathon-popup-link" onClick={dismissPopup}>
            {sitePopup.linkText}
          </Link>
        </div>
      )}
      <button
        type="button"
        className="cl-scroll-progress"
        onClick={scrollToTop}
        aria-label={`Scroll to top (${Math.round(progress)}% scrolled)`}
      >
        <svg width="56" height="56" viewBox="0 0 56 56">
          <circle className="cl-scroll-progress-track" cx="28" cy="28" r={RADIUS} />
          <circle
            className="cl-scroll-progress-fill"
            cx="28"
            cy="28"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <Image src="/images/logocair.png" alt="" width={28} height={28} className="cl-scroll-progress-logo" />
      </button>
    </div>
  );
}
