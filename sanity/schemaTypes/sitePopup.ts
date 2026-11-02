// sanity/schemaTypes/sitePopup.ts
// The small dismissible popup shown at the bottom-right of every page on
// the site. A singleton — there's only ever one, pinned to the top of the
// Studio sidebar (see sanity.config.ts) so it's quick to find, instead of
// being buried inside another document's long field list.

import { defineField, defineType } from 'sanity';

export const sitePopupType = {
  ...defineType({
    name: 'sitePopup',
    title: 'Site Popup',
    type: 'document',
    fields: [
      defineField({
        name: 'enabled',
        title: 'Show popup',
        description: 'Turn this off to stop the popup from showing anywhere on the site. Turn it on to show it again.',
        type: 'boolean',
        initialValue: true,
      }),
      defineField({
        name: 'badge',
        title: 'Badge text',
        description: 'Small label at the top of the popup, e.g. "Registration Open".',
        type: 'string',
      }),
      defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
      defineField({ name: 'tagline', title: 'Tagline', type: 'text', rows: 2 }),
      defineField({ name: 'linkText', title: 'Link text', type: 'string', initialValue: 'Learn More →' }),
      defineField({
        name: 'linkHref',
        title: 'Link goes to',
        description: 'A path on this site (e.g. /initiatives) or a full URL.',
        type: 'string',
        initialValue: '/initiatives',
      }),
    ],
    preview: {
      select: { title: 'title', enabled: 'enabled' },
      prepare({ title, enabled }: { title?: string; enabled?: boolean }) {
        return { title: title || 'Site Popup', subtitle: enabled === false ? 'Hidden' : 'Showing on the site' };
      },
    },
  }),
  // Singleton: no "create new" or "delete" — only ever edit the one document.
  // (Not part of this Sanity version's TS types, but a long-supported field.)
  __experimental_actions: ['update', 'publish'],
};
