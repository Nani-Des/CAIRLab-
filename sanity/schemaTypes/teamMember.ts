// sanity/schemaTypes/teamMember.ts
// A CAIRLab team member, shown on /team and their own /team/[slug] profile
// page. Like every other content type here, new members start as a draft
// in Studio — nothing shows on the live site until you hit Publish, which
// is the natural "they're accepted, make it official" moment.

import { defineField, defineType } from 'sanity';

export const teamMemberType = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Full Name', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'The profile page URL, e.g. "dr-jane-doe" for /team/dr-jane-doe. Click "Generate" to fill this from the name.',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'badge',
      title: 'Badge (position)',
      description: 'Shown as a pill on their card, e.g. "Director", "PhD", "MPhil". Also used for the Position filter on /team.',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      description: 'e.g. "Researcher", "PI", "Security Researcher". Used for the Role filter on /team.',
      type: 'string',
    }),
    defineField({ name: 'image', title: 'Photo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'specialization', title: 'Specialization', type: 'text', rows: 2 }),
    defineField({
      name: 'stats',
      title: 'Stats',
      description: 'Optional — only add these for people you want to show numbers for (e.g. Publications, Years).',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'num', title: 'Number', type: 'string' }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
          ],
          preview: { select: { title: 'num', subtitle: 'label' } },
        },
      ],
    }),
    defineField({ name: 'bio', title: 'Bio', type: 'text', rows: 4 }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn URL',
      description: 'Full profile link, e.g. https://www.linkedin.com/in/janedoe/. Shown as an icon on their profile page. Leave blank to hide it.',
      type: 'url',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      description: 'Short skill/focus labels shown on their profile page.',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      description: 'Lower numbers show first on the /team page. Leave blank to sort alphabetically instead.',
      type: 'number',
    }),
  ],
  orderings: [
    { title: 'Display Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', subtitle: 'badge', media: 'image' },
  },
});
