'use client';

// components/team/TeamDirectory.tsx
// Client component: search box + two filter dropdowns + the card grid.
// Filters only apply when "Apply Filters" is clicked (not live-as-you-type),
// matching the reference layout this was modeled on.

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import Pagination, { usePagination } from '@/components/layout/Pagination';

const PAGE_SIZE = 8;

export type Member = {
  name: string;
  slug: string;
  badge: string;
  role: string;
  image: string;
  specialization: string;
  stats: { num: string; label: string }[];
  bio: string;
  tags: string[];
};

export default function TeamDirectory({ team }: { team: Member[] }) {
  const positions = useMemo(() => Array.from(new Set(team.map((m) => m.badge))), [team]);
  const roles = useMemo(() => Array.from(new Set(team.map((m) => m.role))), [team]);

  // Draft = what's currently in the form controls; applied = what's actually
  // filtering the grid. They only sync when "Apply Filters" is clicked.
  const [searchDraft, setSearchDraft] = useState('');
  const [positionDraft, setPositionDraft] = useState('');
  const [roleDraft, setRoleDraft] = useState('');
  const [applied, setApplied] = useState({ search: '', position: '', role: '' });

  const filtered = useMemo(() => {
    const search = applied.search.trim().toLowerCase();
    return team.filter((m) => {
      if (applied.position && m.badge !== applied.position) return false;
      if (applied.role && m.role !== applied.role) return false;
      if (search && !`${m.name} ${m.specialization}`.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [team, applied]);

  const { page, pageCount, pageItems, setPage } = usePagination(filtered, PAGE_SIZE);
  const listRef = useRef<HTMLDivElement>(null);

  return (
    <div className="cl-team-layout">
      <aside className="cl-team-sidebar">
        <label className="cl-team-filter-label" htmlFor="team-search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i> Search
        </label>
        <input
          id="team-search"
          type="text"
          placeholder="Search team members..."
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
        />

        <label className="cl-team-filter-label" htmlFor="team-position">
          <i className="fa-solid fa-flask" aria-hidden="true"></i> Position
        </label>
        <select id="team-position" value={positionDraft} onChange={(e) => setPositionDraft(e.target.value)}>
          <option value="">All Positions</option>
          {positions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <label className="cl-team-filter-label" htmlFor="team-role">
          <i className="fa-solid fa-user-graduate" aria-hidden="true"></i> Role
        </label>
        <select id="team-role" value={roleDraft} onChange={(e) => setRoleDraft(e.target.value)}>
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <button
          type="button"
          className="cl-team-apply-btn"
          onClick={() => {
            setApplied({ search: searchDraft, position: positionDraft, role: roleDraft });
            setPage(1);
          }}
        >
          Apply Filters
        </button>
      </aside>

      <div ref={listRef} style={{ scrollMarginTop: '100px' }}>
      <div className="cl-team-grid">
        {filtered.length === 0 && (
          <p style={{ color: 'var(--text-soft)', gridColumn: '1 / -1' }}>No team members match those filters.</p>
        )}
        {pageItems.map((member) => (
          <div className="cl-team-card" key={member.slug}>
            <Link href={`/team/${member.slug}`} className="cl-team-link">
              <div
                className="cl-team-avatar"
                role="img"
                aria-label={`Photo of ${member.name}`}
                style={{ '--card-image': `url(${member.image})` } as React.CSSProperties}
              />
              <h3>{member.name}</h3>
            </Link>
            <span className="cl-team-badge">{member.badge}</span>
            <p className="cl-team-role">{member.role}</p>
          </div>
        ))}
      </div>
      <Pagination page={page} pageCount={pageCount} onChange={setPage} scrollTo={listRef} />
      </div>
    </div>
  );
}
