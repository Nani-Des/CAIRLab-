'use client';

// components/homepage/PartnersCarousel.tsx
// The homepage "Trusted by" partner cards. On wide screens they simply wrap
// and centre; when they don't all fit (phones, small tablets) the row
// becomes swipeable, with ‹ › arrow buttons, a fade on the side that has
// more cards, and dots showing which card you're on. Arrows/dots only
// appear when there's actually something to scroll to.

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

export type Partner = { name: string; image: string; badge?: string };

export default function PartnersCarousel({ partners }: { partners: Partner[] }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [active, setActive] = useState(0);

  const update = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollable(max > 4);
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
    // The card whose left edge is closest to the strip's left edge.
    const cards = Array.from(el.children) as HTMLElement[];
    let best = 0;
    cards.forEach((card, i) => {
      if (Math.abs(card.offsetLeft - el.offsetLeft - el.scrollLeft) < Math.abs(cards[best].offsetLeft - el.offsetLeft - el.scrollLeft)) best = i;
    });
    setActive(el.scrollLeft >= max - 4 ? cards.length - 1 : best);
  }, []);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const scrollToCard = (index: number) => {
    const el = stripRef.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 24, behavior: 'smooth' });
  };

  return (
    <div className={`cl-partners-carousel${scrollable ? ' is-scrollable' : ''}${atStart ? ' at-start' : ''}${atEnd ? ' at-end' : ''}`}>
      <div className="cl-partners-strip" ref={stripRef}>
        {partners.map((partner) => (
          <div className="cl-partner-strip-item" key={partner.name}>
            <div
              className="cl-partner-strip-logo"
              role="img"
              aria-label={partner.name}
              style={{ '--card-image': `url(${partner.image})` } as CSSProperties}
            />
            <p className="cl-partner-strip-name">{partner.name}</p>
            {partner.badge && <span className="cl-partner-strip-badge">{partner.badge}</span>}
          </div>
        ))}
      </div>

      {scrollable && (
        <>
          <button
            type="button"
            className="cl-partners-arrow prev"
            aria-label="Previous partner"
            onClick={() => scrollToCard(Math.max(0, active - 1))}
            disabled={atStart}
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            className="cl-partners-arrow next"
            aria-label="Next partner"
            onClick={() => scrollToCard(Math.min(partners.length - 1, active + 1))}
            disabled={atEnd}
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
          <div className="cl-partners-dots" role="tablist" aria-label="Partners">
            {partners.map((partner, i) => (
              <button
                type="button"
                key={partner.name}
                role="tab"
                aria-selected={i === active}
                aria-label={`Show ${partner.name}`}
                className={i === active ? 'active' : undefined}
                onClick={() => scrollToCard(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
