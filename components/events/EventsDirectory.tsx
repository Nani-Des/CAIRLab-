'use client';

// components/events/EventsDirectory.tsx
// Client component: search box + Type/Format filters + the event card list.
// Filters only apply on "Apply Filters", same pattern as News/Team.

import { useMemo, useRef, useState } from 'react';
import Pagination, { usePagination } from '@/components/layout/Pagination';

const PAGE_SIZE = 3;

export type EventItem = {
  id: string;
  title: string;
  date: string; // formatted, e.g. "March 18, 2026"
  dateISO: string; // raw ISO date, for structured data — not shown in the UI
  location: string;
  eventType: string;
  format: string;
  registrationStatus: 'open' | 'closed';
  registrationLink: string;
  image: string;
};

export default function EventsDirectory({ events }: { events: EventItem[] }) {
  const types = useMemo(() => Array.from(new Set(events.map((e) => e.eventType).filter(Boolean))), [events]);
  const formats = useMemo(() => Array.from(new Set(events.map((e) => e.format).filter(Boolean))), [events]);

  const [searchDraft, setSearchDraft] = useState('');
  const [typeDraft, setTypeDraft] = useState('');
  const [formatDraft, setFormatDraft] = useState('');
  const [applied, setApplied] = useState({ search: '', type: '', format: '' });

  const filtered = useMemo(() => {
    const search = applied.search.trim().toLowerCase();
    return events.filter((e) => {
      if (applied.type && e.eventType !== applied.type) return false;
      if (applied.format && e.format !== applied.format) return false;
      if (search && !`${e.title} ${e.location}`.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [events, applied]);

  const { page, pageCount, pageItems, setPage } = usePagination(filtered, PAGE_SIZE);
  const listRef = useRef<HTMLDivElement>(null);

  return (
    <div className="cl-directory-layout">
      <aside className="cl-directory-sidebar">
        <label className="cl-directory-filter-label" htmlFor="event-search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i> Search
        </label>
        <input
          id="event-search"
          type="text"
          placeholder="Search events..."
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
        />

        <label className="cl-directory-filter-label" htmlFor="event-type">
          <i className="fa-solid fa-chalkboard" aria-hidden="true"></i> Type
        </label>
        <select id="event-type" value={typeDraft} onChange={(e) => setTypeDraft(e.target.value)}>
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <label className="cl-directory-filter-label" htmlFor="event-format">
          <i className="fa-solid fa-globe" aria-hidden="true"></i> Format
        </label>
        <select id="event-format" value={formatDraft} onChange={(e) => setFormatDraft(e.target.value)}>
          <option value="">All Formats</option>
          {formats.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <button
          type="button"
          className="cl-directory-apply-btn"
          onClick={() => {
            setApplied({ search: searchDraft, type: typeDraft, format: formatDraft });
            setPage(1);
          }}
        >
          Apply Filters
        </button>
      </aside>

      <div ref={listRef} style={{ scrollMarginTop: '100px' }}>
      <div className="cl-events-list">
        {filtered.length === 0 && <p className="cl-directory-empty">No events match those filters.</p>}
        {pageItems.map((event, i) => (
          <div className="cl-event-card" key={event.id}>
            <div
              className="cl-event-thumb"
              style={{
                background: event.image ? undefined : (i % 2 === 0 ? 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' : 'linear-gradient(135deg, #0F172A, #1E293B)'),
                backgroundImage: event.image ? `url(${event.image})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="cl-event-thumb-tag">{event.eventType}</div>
            </div>
            <div className="cl-event-body">
              <div className="cl-event-meta">
                <span>{event.date} <img src="/images/icon-calendar-3d.png" alt="" className="cl-icon-date-img" /></span>
                {event.location && (
                  <span><i className="fa-solid fa-location-dot" aria-hidden="true"></i> {event.location}</span>
                )}
                {event.format && <span className="cl-event-pill">{event.format}</span>}
              </div>
              <h3>{event.title}</h3>
              <div className="cl-event-footer-row">
                {event.registrationStatus === 'open' ? (
                  <a href={event.registrationLink}>Register for Event →</a>
                ) : (
                  <span className="cl-event-status-closed">Registration Closed</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} pageCount={pageCount} onChange={setPage} scrollTo={listRef} />
      </div>
    </div>
  );
}
