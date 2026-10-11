// sanity/schemaTypes/homeStats.ts
// The 4 "impact" cards on the homepage (Years of Research, Active Research
// Labs, Expert Researchers, International Partners). A singleton — there's
// only ever one, pinned to the top of the Studio sidebar (see
// sanity.config.ts) so it's quick to find. Order in the "stats" array is
// the display order; the background photo behind each card is still a
// static file (matched by position, not editable here).

import { defineField, defineType } from 'sanity';

export const homeStatsType = {
  ...defineType({
    name: 'homeStats',
    title: 'Homepage Stats',
    type: 'document',
    fields: [
      defineField({
        name: 'stats',
        title: 'Stat cards',
        description: 'Exactly 4, in display order: Years of Research, Active Research Labs, Expert Researchers, International Partners. The background photo for each is fixed to that position — reordering these will mismatch the photos.',
        type: 'array',
        validation: (rule) => rule.length(4),
        of: [
          {
            type: 'object',
            name: 'stat',
            fields: [
              defineField({
                name: 'value',
                title: 'Number',
                description: 'E.g. "9+", "17", "3". Only a leading number is animated (counts up); anything after it (like "+") is kept as-is.',
                type: 'string',
                validation: (rule) => rule.required(),
              }),
              defineField({ name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required() }),
              defineField({
                name: 'icon',
                title: 'Icon',
                description: 'Font Awesome solid icon name, just the part after "fa-" (e.g. "calendar-days", "flask", "users", "globe").',
                type: 'string',
                validation: (rule) => rule.required(),
              }),
            ],
            preview: { select: { title: 'value', subtitle: 'label' } },
          },
        ],
      }),
    ],
    preview: {
      prepare() {
        return { title: 'Homepage Stats' };
      },
    },
  }),
};
