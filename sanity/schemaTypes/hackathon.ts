// sanity/schemaTypes/hackathon.ts
// Content model for a hackathon event page (e.g. "SecureAI Hackathon
// 2026"). The Hackathon page shows the most recently dated one.

import { defineField, defineType } from 'sanity';

export const hackathonType = defineType({
  name: 'hackathon',
  title: 'Hackathon',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'Controls which hackathon shows on the page — the most recent date wins.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'registrationOpen',
      title: 'Registration open',
      description:
        'Turn this off to close registration: the "Register Now" button is replaced by "Registration Closed" and the badge changes to match. Turn it on to reopen.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'status',
      title: 'Status badge',
      description: 'Shown while registration is open, e.g. "Registration Open". Replaced by "Registration Closed" when the switch above is off.',
      type: 'string',
      initialValue: 'Registration Open',
    }),
    defineField({ name: 'poweredBy', title: 'Powered by', type: 'string' }),
    defineField({ name: 'description', title: 'Hero description', type: 'text', rows: 3 }),
    defineField({ name: 'heroImage', title: 'Hero background image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'registerLink',
      title: 'Register link (Google Form URL)',
      type: 'string',
      description:
        'The "Register Now" button on the Hackathon page links straight here. For each new hackathon: create a new Google Form, click Send > copy the link, and paste that link here. Leave as /contact if there is no form yet.',
      initialValue: '/contact',
    }),
    defineField({
      name: 'infoCards',
      title: 'Info cards',
      description: 'Usually 4: Event Dates, Location, Registration Deadline, Prize.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description: 'Font Awesome solid icon name, just the part after "fa-".',
            }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'value', title: 'Value', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        },
      ],
    }),
    defineField({
      name: 'challengeParagraphs',
      title: 'The Challenge — paragraphs',
      type: 'array',
      of: [{ type: 'text', rows: 3 }],
    }),
    defineField({ name: 'tagline', title: 'Tagline (challenge section)', type: 'text', rows: 2 }),
    defineField({ name: 'whoShouldJoin', title: 'Who Should Join', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'joinTagline', title: 'Tagline (who should join section)', type: 'text', rows: 2 }),
    defineField({ name: 'partnersText', title: 'Partners paragraph', type: 'text', rows: 2 }),
    defineField({ name: 'partners', title: 'Partner names', type: 'array', of: [{ type: 'string' }] }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'date' },
  },
});
