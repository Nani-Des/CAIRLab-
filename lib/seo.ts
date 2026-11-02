// lib/seo.ts
// Shared Open Graph / Twitter card helpers, used by every page's metadata
// export so social share previews (LinkedIn, WhatsApp, Twitter/X, Slack,
// iMessage, etc.) show a real title, description, and image instead of a
// bare link. See NEXT_PUBLIC_SITE_URL in .env.local.example.

// The live site's address, used for email links (e.g. employer approval
// links), the sitemap, robots.txt and social-share previews. Set
// NEXT_PUBLIC_SITE_URL to override it (e.g. for the Vercel test copy).
// cairlab.org was only ever a placeholder in the setup docs — it isn't
// CAIRLab's domain — so if a server was configured with it, ignore it.
const PRODUCTION_URL = 'https://cairlab.knust.edu.gh';
const configuredUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');
export const SITE_URL =
  configuredUrl && !/^https?:\/\/(www\.)?cairlab\.org$/i.test(configuredUrl) ? configuredUrl : PRODUCTION_URL;

// A branded default image (1200x630, the standard OG size) used by any
// page that doesn't have its own more specific photo (e.g. a news post's
// own image). Lives at public/images/og-default.jpg.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;

type OgOptions = {
  path?: string; // e.g. "/about" — defaults to the homepage
  image?: string; // absolute URL — defaults to DEFAULT_OG_IMAGE
  type?: 'website' | 'article';
};

export function buildOpenGraph(title: string, description: string, opts: OgOptions = {}) {
  return {
    title,
    description,
    url: `${SITE_URL}${opts.path ?? ''}`,
    siteName: 'CAIRLab',
    type: opts.type ?? 'website',
    images: [{ url: opts.image ?? DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }],
  };
}

export function buildTwitter(title: string, description: string, image?: string) {
  return {
    card: 'summary_large_image' as const,
    title,
    description,
    images: [image ?? DEFAULT_OG_IMAGE],
  };
}
