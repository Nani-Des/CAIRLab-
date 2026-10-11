// sanity/schemaTypes/project.ts
// Content model for one Projects-page spotlight card. Mirrors the fields
// used in app/projects/page.tsx (tag, icon, image, title, description,
// stats, focus, link) so migrating that hardcoded array to live content is
// a straight field-for-field mapping.

import { defineField, defineType } from 'sanity';

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'The project\'s URL, e.g. "secureai" for /projects/secureai. Click "Generate" to fill this from the title.',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tag',
      title: 'Tag',
      description: 'Short name shown on the pill badge, e.g. "SecureAI".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      description:
        'A Font Awesome solid icon name (fontawesome.com/search?s=solid), just the part after "fa-", e.g. "shield-halved".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Card image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      description: 'Usually 3 short number/label pairs, e.g. "15+" / "Papers".',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'num', title: 'Number', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: 'num', subtitle: 'label' } },
        },
      ],
    }),
    defineField({
      name: 'focus',
      title: 'Focus areas',
      description: 'Short chip labels shown on the card.',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'link',
      title: 'Link',
      description: 'Where the "Join the Team" button goes.',
      type: 'string',
      initialValue: '/contact',
    }),
    defineField({
      name: 'body',
      title: 'Full Write-Up',
      description:
        'The full story for the project\'s own page (/projects/[slug]). Optional — until this is filled in, that page just shows the description above.',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      description: 'Lower numbers show first. Leave blank to sort by creation date.',
      type: 'number',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'tag', media: 'image' },
  },
});
