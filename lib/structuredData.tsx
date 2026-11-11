// lib/structuredData.ts
// JSON-LD structured data helpers (schema.org). This is what lets Google
// show rich results — a logo/description in search, a byline and date on
// a news article, a date/location card for an event — instead of just a
// plain blue link. Render the result inside a
// <script type="application/ld+json"> tag via <StructuredData data={...} />.
//
// Only built for content types with real data behind them and an actual
// Google rich-result type: Organization (sitewide), NewsArticle, Event,
// and Person (team profiles, since we have real verified LinkedIn URLs).
// Skipped Project/Publication — schema.org has no well-supported rich
// result for a generic research project, so there'd be no visible payoff.

import { SITE_URL } from './seo';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CAIRLab',
    alternateName: 'Cybersecurity and Artificial Intelligence Research Laboratory',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logocair.png`,
    description:
      'CAIRLab advances AI and digital security research to protect data, empower communities, and drive responsible technology adoption.',
    // Real, verified official URLs for the same organization.
    sameAs: ['https://cairlab.knust.edu.gh', 'https://www.linkedin.com/company/cair-lab-knust/home/'],
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'Kwame Nkrumah University of Science and Technology (KNUST)',
    },
  };
}

// Tells Google which name to show above our address in search results
// ("site name"). Without it Google guesses, and picked "KNUST" from the
// knust.edu.gh domain. https://developers.google.com/search/docs/appearance/site-names
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CAIRLab',
    alternateName: ['CAIRLab KNUST', 'Cybersecurity and Artificial Intelligence Research Laboratory'],
    url: `${SITE_URL}/`,
  };
}

export function newsArticleSchema(article: {
  title: string;
  excerpt: string;
  image?: string;
  datePublished: string; // ISO date
  author?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.image ? [article.image] : undefined,
    datePublished: article.datePublished,
    author: {
      '@type': article.author?.toLowerCase().includes('communications') ? 'Organization' : 'Person',
      name: article.author || 'CAIRLab',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CAIRLab',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logocair.png` },
    },
    mainEntityOfPage: article.url,
  };
}

export function eventSchema(event: {
  name: string;
  startDate: string; // ISO date
  location: string;
  format?: string;
  url: string;
  image?: string;
  isFree?: boolean;
}) {
  const isOnline = /online/i.test(event.format || '') || /online/i.test(event.location);
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    startDate: event.startDate,
    eventAttendanceMode: isOnline
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : /hybrid/i.test(event.format || '')
        ? 'https://schema.org/MixedEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: isOnline
      ? { '@type': 'VirtualLocation', url: event.url }
      : { '@type': 'Place', name: event.location, address: event.location },
    image: event.image ? [event.image] : undefined,
    organizer: { '@type': 'Organization', name: 'CAIRLab', url: SITE_URL },
    url: event.url,
  };
}

export function personSchema(person: {
  name: string;
  jobTitle: string;
  description: string;
  image?: string;
  url: string;
  linkedin?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    jobTitle: person.jobTitle,
    description: person.description,
    image: person.image || undefined,
    url: person.url,
    sameAs: person.linkedin ? [person.linkedin] : undefined,
    worksFor: { '@type': 'Organization', name: 'CAIRLab', url: SITE_URL },
  };
}

/** Renders any schema object(s) as a JSON-LD <script> tag. */
export function StructuredData({ data }: { data: object | object[] }) {
  // JSON.stringify doesn't escape "<" — a "</script>" inside any string
  // value (e.g. a news title) would otherwise prematurely close this tag.
  // This content comes from Sanity (Studio-authored, not public input), so
  // the risk is already low, but escaping it is free and closes it fully.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
