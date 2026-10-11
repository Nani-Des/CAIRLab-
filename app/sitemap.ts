// app/sitemap.ts
// Auto-generates /sitemap.xml at build/request time — Next.js's built-in
// support for the MetadataRoute.Sitemap type. Helps Google/Bing discover
// every page instead of only what they happen to find by following links.
//
// NEXT_PUBLIC_SITE_URL should be set once the site has a real deployed
// domain (see .env.local.example) — defaults to https://cairlab.org
// (the domain used elsewhere on the site, e.g. hello@cairlab.org) until then.

import type { MetadataRoute } from 'next';
import { TEAM, slugify } from '@/lib/team';
import { client } from '@/sanity/lib/client';

async function getTeamSlugs(): Promise<string[]> {
  try {
    const docs: { slug: string }[] = await client.fetch(
      `*[_type == "teamMember" && defined(slug.current)]{ "slug": slug.current }`
    );
    if (Array.isArray(docs) && docs.length > 0) return docs.map((d) => d.slug);
  } catch (err) {
    console.error('Sitemap: failed to fetch team members from Sanity:', err);
  }
  return TEAM.map((member) => slugify(member.name));
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cairlab.org').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    { path: '', priority: 1, freq: 'weekly' as const },
    { path: '/about', priority: 0.8, freq: 'monthly' as const },
    { path: '/themes', priority: 0.8, freq: 'monthly' as const },
    { path: '/projects', priority: 0.8, freq: 'weekly' as const },
    { path: '/news', priority: 0.8, freq: 'daily' as const },
    { path: '/events', priority: 0.8, freq: 'weekly' as const },
    { path: '/team', priority: 0.7, freq: 'monthly' as const },
    { path: '/contact', priority: 0.6, freq: 'yearly' as const },
    { path: '/hackathon', priority: 0.7, freq: 'weekly' as const },
    { path: '/apply-for-scholarship', priority: 0.7, freq: 'monthly' as const },
    { path: '/publications', priority: 0.7, freq: 'weekly' as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map(({ path, priority, freq }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }));

  const teamSlugs = await getTeamSlugs();
  const teamEntries: MetadataRoute.Sitemap = teamSlugs.map((slug) => ({
    url: `${SITE_URL}/team/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  let newsEntries: MetadataRoute.Sitemap = [];
  try {
    const posts: { slug: string; date: string }[] = await client.fetch(
      `*[_type == "newsPost" && defined(slug.current)]{ "slug": slug.current, date }`
    );
    newsEntries = posts.map((post) => ({
      url: `${SITE_URL}/news/${post.slug}`,
      lastModified: new Date(post.date || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch (err) {
    console.error('Sitemap: failed to fetch news posts from Sanity:', err);
  }

  let projectEntries: MetadataRoute.Sitemap = [];
  try {
    const projects: { slug: string }[] = await client.fetch(
      `*[_type == "project" && defined(slug.current)]{ "slug": slug.current }`
    );
    projectEntries = projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch (err) {
    console.error('Sitemap: failed to fetch projects from Sanity:', err);
  }

  return [...staticEntries, ...teamEntries, ...newsEntries, ...projectEntries];
}
