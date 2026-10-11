// sanity/schemaTypes/event.ts
// Content model for a workshop/seminar/conference — used on both the
// homepage "Recent & Upcoming Events" section (soonest 2) and the full
// /events listing page.

import { defineField, defineType } from 'sanity';

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'date', title: 'Date', type: 'date', validation: (rule) => rule.required() }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({
      name: 'eventType',
      title: 'Type',
      description: 'Short label on the thumbnail, e.g. "Workshop", "Seminar", "Conference".',
      type: 'string',
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      options: { list: ['Hybrid', 'Online', 'In-Person'] },
    }),
    defineField({
      name: 'registrationStatus',
      title: 'Registration status',
      type: 'string',
      options: { list: ['open', 'closed'] },
      initialValue: 'open',
    }),
    defineField({
      name: 'registrationLink',
      title: 'Registration link',
      description: 'Only used when registration status is "open".',
      type: 'string',
      initialValue: '/contact',
    }),
    defineField({ name: 'image', title: 'Thumbnail image', type: 'image', options: { hotspot: true } }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'date', media: 'image' },
  },
});
