// sanity/schemaTypes/newsletterSubscriber.ts
// One document per newsletter signup (from the footer form). Not intended
// to be edited by hand in Studio — created automatically by
// app/api/newsletter/route.ts when someone subscribes. Kept here mainly so
// you have a real list to export/email later.

import { defineField, defineType } from 'sanity';

export const newsletterSubscriberType = defineType({
  name: 'newsletterSubscriber',
  title: 'Newsletter Subscriber',
  type: 'document',
  fields: [
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'subscribedAt', title: 'Subscribed At', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'email', subtitle: 'subscribedAt' },
  },
});
