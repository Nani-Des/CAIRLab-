// sanity/schemaTypes/publication.ts
// A single published paper/research output, shown on /publications.
// Add real papers here as they're published — this list starts empty and
// the page shows a "coming soon" message until the first one is added.

import { defineField, defineType } from 'sanity';

export const publicationType = defineType({
  name: 'publication',
  title: 'Publication',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Paper Title', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'authors',
      title: 'Authors',
      description: 'e.g. "E. Ahene, J. Owusu Agyemang, et al."',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      description: 'The journal or conference it was published in, e.g. "IEEE S&P 2026".',
      type: 'string',
    }),
    defineField({ name: 'year', title: 'Year', type: 'number', validation: (rule) => rule.required() }),
    defineField({
      name: 'link',
      title: 'Link (DOI / PDF / preprint)',
      type: 'url',
    }),
    defineField({
      name: 'abstract',
      title: 'Abstract',
      description: 'Optional short summary shown on the publications page.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'theme',
      title: 'Related Theme',
      description: 'Optional — which research project/theme this paper belongs to, e.g. "SecureAI".',
      type: 'string',
    }),
  ],
  orderings: [
    { title: 'Year, newest first', name: 'yearDesc', by: [{ field: 'year', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'venue' },
  },
});
