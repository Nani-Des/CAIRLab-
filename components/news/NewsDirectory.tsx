'use client';

// components/news/NewsDirectory.tsx
// Client component: search box + Category/Year/Byline filters + a list of
// horizontal "boxy" news cards. Filters only apply on "Apply Filters"
// (not live-as-you-type), same pattern as the Team page directory.

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import Pagination, { usePagination } from '@/components/layout/Pagination';

const PAGE_SIZE = 6;

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  date: string; // formatted, e.g. "Sep 05, 2026"
  year: string;
  category: string;
  author: string;
  tags: string[];
  excerpt: string;
  image: string;
};

export default function NewsDirectory({ news }: { news: NewsItem[] }) {
  const categories = useMemo(
    () => Array.from(new Set(news.map((n) => n.category).filter(Boolean))),
    [news]
  );
  const years = useMemo(() => Array.from(new Set(news.map((n) => n.year).filter(Boolean))), [news]);
  const bylines = useMemo(
    () => Array.from(new Set(news.map((n) => n.author).filter(Boolean))),
    [news]
  );

  const [searchDraft, setSearchDraft] = useState('');
  const [categoryDraft, setCategoryDraft] = useState('');
  const [yearDraft, setYearDraft] = useState('');
  const [bylineDraft, setBylineDraft] = useState('');
  const [applied, setApplied] = useState({ search: '', category: '', year: '', byline: '' });

  const filtered = useMemo(() => {
    const search = applied.search.trim().toLowerCase();
    return news.filter((n) => {
      if (applied.category && n.category !== applied.category) return false;
      if (applied.year && n.year !== applied.year) return false;
      if (applied.byline && n.author !== applied.byline) return false;
      if (search && !`${n.title} ${n.excerpt}`.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [news, applied]);

  const { page, pageCount, pageItems, setPage } = usePagination(filtered, PAGE_SIZE);
  const listRef = useRef<HTMLDivElement>(null);

  return (
    <div className="cl-directory-layout">
      <aside className="cl-directory-sidebar">
        <label className="cl-directory-filter-label" htmlFor="news-search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i> Search
        </label>
        <input
          id="news-search"
          type="text"
          placeholder="Search news..."
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
        />

        <label className="cl-directory-filter-label" htmlFor="news-category">
          <i className="fa-solid fa-folder" aria-hidden="true"></i> Category
        </label>
        <select id="news-category" value={categoryDraft} onChange={(e) => setCategoryDraft(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label className="cl-directory-filter-label" htmlFor="news-year">
          <i className="fa-solid fa-calendar" aria-hidden="true"></i> Year
        </label>
        <select id="news-year" value={yearDraft} onChange={(e) => setYearDraft(e.target.value)}>
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <label className="cl-directory-filter-label" htmlFor="news-byline">
          <i className="fa-solid fa-user" aria-hidden="true"></i> Byline
        </label>
        <select id="news-byline" value={bylineDraft} onChange={(e) => setBylineDraft(e.target.value)}>
          <option value="">All Bylines</option>
          {bylines.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <button
          type="button"
          className="cl-directory-apply-btn"
          onClick={() => {
            setApplied({ search: searchDraft, category: categoryDraft, year: yearDraft, byline: bylineDraft });
            setPage(1);
          }}
        >
          Apply Filters
        </button>
      </aside>

      <div ref={listRef} style={{ scrollMarginTop: '100px' }}>
        {filtered.length === 0 && <p className="cl-directory-empty">No news match those filters.</p>}
        {pageItems.map((item) => (
          <div className="cl-news-card-h" key={item.id} style={{ marginBottom: '24px' }}>
            <div
              className="cl-news-card-h-media"
              style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
            >
              <div className="cl-news-card-h-social" onClick={(e) => e.stopPropagation()}>
                <a
                  href="https://www.linkedin.com/company/cair-lab-knust/home/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow CAIRLab on LinkedIn"
                  title="Follow us on LinkedIn"
                >
                  <i className="fa-brands fa-linkedin-in" aria-hidden="true"></i>
                </a>
                <a href="/#newsletter" aria-label="Subscribe to our newsletter" title="Subscribe to our newsletter for updates">
                  <i className="fa-solid fa-envelope" aria-hidden="true"></i>
                </a>
              </div>
            </div>
            <div className="cl-news-card-h-body">
              <h3 className="cl-news-card-h-title">{item.title}</h3>
              <div className="cl-news-card-h-meta">
                <span>{item.date} <img src="/images/icon-calendar-3d.png" alt="" className="cl-icon-date-img" /></span>
                {item.author && <span><i className="fa-solid fa-user" aria-hidden="true"></i> {item.author}</span>}
                {item.category && <span><i className="fa-solid fa-folder" aria-hidden="true"></i> {item.category}</span>}
              </div>
              {item.excerpt && <p className="cl-news-card-h-desc">{item.excerpt}</p>}
              {item.tags.length > 0 && (
                <div className="cl-news-card-h-tags">
                  {item.tags.map((tag) => (
                    <span className="cl-news-card-h-tag" key={tag}><i className="fa-solid fa-tag" aria-hidden="true"></i> {tag}</span>
                  ))}
                </div>
              )}
              <div className="cl-news-card-h-footer">
                <Link href={`/news/${item.slug}`}>Read More →</Link>
              </div>
            </div>
          </div>
        ))}
        <Pagination page={page} pageCount={pageCount} onChange={setPage} scrollTo={listRef} />
      </div>
    </div>
  );
}
