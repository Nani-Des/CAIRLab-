// app/events/page.tsx
// Events listing page — search + Type/Format filters, all events from
// Sanity, most recently dated first (same ordering as News). Content lives
// in the Studio (Event document type) — see sanity/schemaTypes/event.ts.
// Add/edit events at /studio, no code change or redeploy needed; this page
// revalidates every 60 seconds.

import type { Metadata } from 'next';
import PageHero from '@/components/layout/PageHero';
import EventsDirectory, { type EventItem } from '@/components/events/EventsDirectory';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { buildOpenGraph, buildTwitter, SITE_URL } from '@/lib/seo';
import { eventSchema, StructuredData } from '@/lib/structuredData';

const TITLE = 'Events — CAIRLab';
const DESCRIPTION = 'Workshops, technical seminars, and academic conferences from CAIRLab.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph(TITLE, DESCRIPTION, { path: '/events' }),
  twitter: buildTwitter(TITLE, DESCRIPTION),
};

export const revalidate = 60;

const FALLBACK_EVENTS: EventItem[] = [
  {
    id: 'fallback-event-1',
    title: 'SecureAI Hackathon 2026',
    date: 'September 28, 2026',
    dateISO: '2026-09-28',
    location: 'CAIRLab, KNUST — Hybrid',
    eventType: 'Hackathon',
    format: 'Hybrid',
    registrationStatus: 'open',
    registrationLink: '/initiatives#hackathon',
    image: '',
  },
  {
    id: 'fallback-event-3',
    title: 'SecureAI Hackathon 2026: Opening Day',
    date: 'September 26, 2026',
    dateISO: '2026-09-26',
    location: 'CAIRLab, KNUST — Hybrid',
    eventType: 'Hackathon',
    format: 'Hybrid',
    registrationStatus: 'closed',
    registrationLink: '/initiatives#hackathon',
    image: '',
  },
  {
    id: 'fallback-event-2',
    title: 'Agentic AI Threats: Public Webinar with Internet Society Ghana Chapter',
    date: 'September 12, 2026',
    dateISO: '2026-09-12',
    location: 'Online',
    eventType: 'Webinar',
    format: 'Online',
    registrationStatus: 'closed',
    registrationLink: '/contact',
    image: '',
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
}

async function getAllEvents(): Promise<EventItem[]> {
  try {
    const docs = await client.fetch(
      `*[_type == "event"] | order(date desc){ _id, title, date, location, eventType, format, registrationStatus, registrationLink, image }`
    );
    if (Array.isArray(docs) && docs.length > 0) {
      return docs.map((d) => ({
        id: d._id,
        title: d.title,
        date: formatDate(d.date),
        dateISO: Number.isNaN(new Date(d.date).getTime()) ? '' : new Date(d.date).toISOString().slice(0, 10),
        location: d.location || '',
        eventType: d.eventType || 'Event',
        format: d.format || '',
        registrationStatus: d.registrationStatus === 'closed' ? 'closed' : 'open',
        registrationLink: d.registrationLink || '/contact',
        image: d.image ? urlFor(d.image).width(400).height(280).fit('crop').url() : '',
      }));
    }
  } catch (err) {
    console.error('Failed to fetch events from Sanity, using fallback content:', err);
  }
  return FALLBACK_EVENTS;
}

export default async function EventsPage() {
  const events = await getAllEvents();

  return (
    <>
      {events
        .filter((e) => e.dateISO)
        .map((e) => (
          <StructuredData
            key={e.id}
            data={eventSchema({
              name: e.title,
              startDate: e.dateISO,
              location: e.location,
              format: e.format,
              url: e.registrationLink.startsWith('http') ? e.registrationLink : `${SITE_URL}${e.registrationLink}`,
              image: e.image || undefined,
            })}
          />
        ))}
      <PageHero
        kicker="Calendar"
        title="Recent & Upcoming Events"
        description="Participate in our specialized workshops, technical seminars, and academic conferences designed to foster open knowledge exchange."
        image="/images/events-hero.jpg"
      />

      <section className="cl-section">
        <div className="cl-wrap">
          <EventsDirectory events={events} />
        </div>
      </section>
    </>
  );
}
