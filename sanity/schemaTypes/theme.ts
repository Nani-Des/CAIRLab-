// sanity/schemaTypes/theme.ts
// Content model for a "Thematic Area" on the /themes page — each one has its
// own section with a list of research projects. The project `status` field
// (Active / Upcoming) is what drives the green/gray pill on each card, and
// can now be flipped straight from Studio — no code change needed.

import { defineField, defineType } from 'sanity';

export const themeType = defineType({
  name: 'theme',
  title: 'Thematic Area',
  type: 'document',
  fields: [
    defineField({
      name: 'navLabel',
      title: 'Nav label',
      description: 'Short label shown in the jump-to-section nav at the top of the page.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'Used as the section\'s URL anchor. Click "Generate" to fill this from the title.',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({
      name: 'order',
      title: 'Display order',
      description: 'Lower numbers show first on the page. E.g. 1, 2, 3...',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'projects',
      title: 'Projects in this thematic area',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'themeProject',
          fields: [
            defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
            defineField({ name: 'badge', title: 'Badge label', type: 'string' }),
            defineField({
              name: 'status',
              title: 'Status',
              description: 'Controls the green "Active" / gray "Upcoming" pill on the card.',
              type: 'string',
              options: {
                list: [
                  { title: 'Active', value: 'active' },
                  { title: 'Upcoming', value: 'upcoming' },
                ],
                layout: 'radio',
              },
              initialValue: 'upcoming',
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'related', title: 'Related to (project/label)', type: 'string' }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
            defineField({
              name: 'tags',
              title: 'Tags',
              type: 'array',
              of: [{ type: 'string' }],
              options: { layout: 'tags' },
            }),
            defineField({ name: 'lead', title: 'Lead', type: 'string' }),
            defineField({ name: 'years', title: 'Years', description: 'E.g. "2023-2025".', type: 'string' }),
            defineField({
              name: 'links',
              title: 'Links',
              description: 'Usually 2: "View Details" + "Publications" or "Demo".',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string' }),
                    defineField({ name: 'href', title: 'URL', type: 'string' }),
                  ],
                },
              ],
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'status', media: 'image' },
          },
        },
      ],
    }),
  ],
  orderings: [
    { title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'navLabel' },
  },
});
