'use client';

// components/layout/Navbar.tsx
// Site-wide navigation bar. Client component so it can highlight the
// current route via usePathname and drive the dropdown / mobile drawer state
// (App Router provides no server equivalent for either).
//
// - >=1080px: inline links; a link with children opens a floating popover
//   anchored under it, without shifting any other nav item.
// - <1080px: a hamburger button opens a full-height drawer sliding in from
//   the right; items with children are shown as an always-expanded group.

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const DROPDOWN_CLOSE_DELAY = 150;

type NavChild = { href: string; label: string; description: string; icon: string };
type NavLink = { href: string; label: string; icon: string; children?: NavChild[] };

// icon is a Font Awesome solid icon name (e.g. "fa-house") — only rendered
// in the mobile drawer today; the desktop inline nav stays text-only.
const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Home', icon: 'fa-house' },
  {
    href: '/about',
    label: 'About',
    icon: 'fa-circle-info',
    children: [
      { href: '/about', label: 'Overview', description: 'Mission, vision & values', icon: 'fa-compass' },
      { href: '/about#journey', label: 'Our Journey', description: 'Milestones & achievements', icon: 'fa-route' },
      { href: '/about#values', label: 'Our Values', description: 'Our guiding principles', icon: 'fa-scale-balanced' },
      { href: '/team', label: 'Team', description: 'Meet our researchers', icon: 'fa-users' },
      { href: '/contact', label: 'Contact Us', description: 'Get in touch', icon: 'fa-envelope' },
    ],
  },
  {
    href: '/themes',
    label: 'Thematic Areas',
    icon: 'fa-layer-group',
    children: [
      { href: '/themes', label: 'Themes', description: 'Our research focus areas', icon: 'fa-layer-group' },
      { href: '/publications', label: 'Publications', description: 'Papers & research output', icon: 'fa-book' },
    ],
  },
  { href: '/projects', label: 'Projects', icon: 'fa-flask' },
  { href: '/news', label: 'News', icon: 'fa-newspaper' },
  { href: '/events', label: 'Events', icon: 'fa-calendar-days' },
  { href: '/contact', label: 'Contact', icon: 'fa-envelope' },
  { href: '/initiatives', label: 'Initiatives', icon: 'fa-laptop-code' },
  { href: '/apply-for-scholarship', label: 'Apply For Scholarship', icon: 'fa-graduation-cap' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = (label: string) => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpenDropdown((current) => (current === label ? null : current));
    }, DROPDOWN_CLOSE_DELAY);
  };

  // Close everything on route change. Reset during render (rather than in an
  // effect) per React's guidance for state that depends on a changing prop.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setDrawerOpen(false);
    setOpenDropdown(null);
  }

  // Close the popover on outside click, and everything on Escape.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setDrawerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Lock page scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // Clear any pending close timer on unmount.
  useEffect(() => () => cancelClose(), []);

  const isLinkActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <div className="cl-nav-bar">
      <div className="cl-nav-inner" ref={navRef}>
        <Link href="/" className="cl-logo">
          <Image
            src="/images/logocair.png"
            alt="CAIRLAB Logo"
            width={32}
            height={32}
            className="cl-logo-mark"
            priority
          />
          <span className="cl-logo-words">
            <span className="cl-logo-text">CAIRLab</span>
            <span className="cl-logo-tagline">Cybersecurity &amp; Artificial Intelligence Research Lab, KNUST</span>
          </span>
        </Link>

        {/* Desktop / tablet inline nav */}
        <nav className="cl-nav-links">
          {NAV_LINKS.map((link) => {
            const isActive = isLinkActive(link.href);

            if (!link.children) {
              return (
                <Link key={link.href} href={link.href} className={isActive ? 'active' : ''}>
                  {link.label}
                </Link>
              );
            }

            const isOpen = openDropdown === link.label;
            return (
              <div
                className="cl-nav-item"
                key={link.href}
                onMouseEnter={() => {
                  cancelClose();
                  setOpenDropdown(link.label);
                }}
                onMouseLeave={() => scheduleClose(link.label)}
              >
                <button
                  type="button"
                  className={`cl-nav-item-trigger${isActive ? ' active' : ''}${isOpen ? ' open' : ''}`}
                  aria-expanded={isOpen}
                  onClick={() => setOpenDropdown(isOpen ? null : link.label)}
                >
                  {link.label}
                  <span className="cl-nav-caret" aria-hidden="true">▾</span>
                </button>
                <div className={`cl-nav-dropdown${isOpen ? ' open' : ''}`}>
                  {link.children.map((child) => (
                    <Link key={child.href} href={child.href} className="cl-nav-dropdown-item">
                      <i className={`fa-solid ${child.icon}`} aria-hidden="true"></i>
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Mobile hamburger — opens the right-side drawer */}
        <button
          type="button"
          className="cl-nav-toggle"
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          <span className="cl-nav-toggle-icon" />
        </button>
      </div>

      {/* Mobile drawer + backdrop */}
      <div
        className={`cl-nav-scrim${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <div className={`cl-nav-drawer${drawerOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="cl-nav-drawer-header">
          <Link href="/" className="cl-logo" onClick={() => setDrawerOpen(false)}>
            <Image src="/images/logocair.png" alt="CAIRLAB Logo" width={28} height={28} className="cl-logo-mark" />
            <span className="cl-logo-text">CAIRLab</span>
          </Link>
          <button type="button" className="cl-nav-drawer-close" aria-label="Close navigation menu" onClick={() => setDrawerOpen(false)}>
            ✕
          </button>
        </div>
        <div className="cl-nav-drawer-body">
          {NAV_LINKS.map((link) => {
            const isActive = isLinkActive(link.href);

            if (!link.children) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`cl-nav-drawer-link${isActive ? ' active' : ''}`}
                  onClick={() => setDrawerOpen(false)}
                >
                  <i className={`fa-solid ${link.icon} cl-nav-drawer-icon`} aria-hidden="true"></i>
                  {link.label}
                </Link>
              );
            }

            return (
              <div className="cl-nav-drawer-group" key={link.href}>
                <div className={`cl-nav-drawer-group-label${isActive ? ' active' : ''}`}>
                  <i className={`fa-solid ${link.icon} cl-nav-drawer-icon`} aria-hidden="true"></i>
                  {link.label}
                </div>
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="cl-nav-drawer-child"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <i className={`fa-solid ${child.icon} cl-nav-drawer-child-icon`} aria-hidden="true"></i>
                    <span className="cl-nav-drawer-child-text">
                      <span className="cl-nav-drawer-child-title">{child.label}</span>
                      <span className="cl-nav-drawer-child-desc">{child.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
