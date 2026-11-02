// app/robots.ts
// Auto-generates /robots.txt — Next.js's built-in support for the
// MetadataRoute.Robots type. Points crawlers at the sitemap and keeps the
// CMS/admin and API routes out of search results.

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/api/', '/send-newsletter'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
