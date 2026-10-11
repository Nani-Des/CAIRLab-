// sanity/schemaTypes/newsPost.ts
// Content model for a news/announcement card — used on both the homepage
// "Latest News" section (most recent 3) and the full /news listing page.

import { defineField, defineType } from 'sanity';

export const newsPostType = defineType({
  name: 'newsPost',
  title: 'News Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'The article\'s URL, e.g. "dr-ahene-wins-award" for /news/dr-ahene-wins-award. Click "Generate" to fill this from the headline.',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'Controls sort order — most recent first.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      description: 'Used for the Category filter on the /news page, e.g. "Events", "Partnership", "Award".',
      type: 'string',
    }),
    defineField({
      name: 'author',
      title: 'Byline (author)',
      description: 'Used for the Byline filter on the /news page.',
      type: 'string',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      description: 'Short labels shown on the card, e.g. "Partnership", "Event".',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'image',
      title: 'Image',
      description: 'Optional — cards without one show a plain gradient block instead.',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      description: 'A short summary shown on the full /news listing page.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Full Article',
      description:
        'The full story, shown on the article\'s own page (/news/[slug]). Optional — until this is filled in, the article page just shows the excerpt above.',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'date', media: 'image' },
  },
});
