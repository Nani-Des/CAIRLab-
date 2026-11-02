'use client';

// components/layout/Pagination.tsx
// Shared page-number control for the News, Events and Team directories.
// usePagination slices the (already filtered) list; <Pagination> renders
// Prev / 1 2 … 9 / Next and hides itself when everything fits on one page.

import { useState, type RefObject } from 'react';

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  // Clamp rather than store — if the list shrinks (e.g. filters applied),
  // an out-of-range page just shows the last one.
  const current = Math.min(page, pageCount);
  const pageItems = items.slice((current - 1) * pageSize, current * pageSize);
  return { page: current, pageCount, pageItems, setPage };
}

// Page numbers to show: always first/last, the current page and its
// neighbours, with null marking a "…" gap.
function pageList(page: number, pageCount: number): (number | null)[] {
  const pages: (number | null)[] = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== null) {
      pages.push(null);
    }
  }
  return pages;
}

export default function Pagination({
  page,
  pageCount,
  onChange,
  scrollTo,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  // Scrolled into view on page change, so the reader lands at the top of
  // the new page of results rather than down by the pager.
  scrollTo?: RefObject<HTMLElement | null>;
}) {
  if (pageCount <= 1) return null;

  const go = (p: number) => {
    onChange(p);
    scrollTo?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="cl-pagination-wrap">
      <nav className="cl-pagination" aria-label="Pagination">
        <button
          type="button"
          className="cl-pagination-arrow"
          onClick={() => go(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
          <span className="cl-pagination-arrow-label">Prev</span>
        </button>
        {pageList(page, pageCount).map((p, i) =>
          p === null ? (
            <span key={`gap-${i}`} className="cl-pagination-gap">…</span>
          ) : (
            <button
              type="button"
              key={p}
              onClick={() => go(p)}
              className={p === page ? 'active' : undefined}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className="cl-pagination-arrow"
          onClick={() => go(page + 1)}
          disabled={page === pageCount}
          aria-label="Next page"
        >
          <span className="cl-pagination-arrow-label">Next</span>
          <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
      </nav>
    </div>
  );
}
