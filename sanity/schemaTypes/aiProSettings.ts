// sanity/schemaTypes/aiProSettings.ts
// Open / close switch for the AI for Professionals registration
// (app/initiatives/ai-for-professionals). A singleton, pinned in the Studio
// sidebar under "AI for Professionals" (see sanity.config.ts). Closing
// registration stops new sign-ups; employers can still approve or reject
// requests that are already pending.

import { defineField, defineType } from 'sanity';

export const AI_PRO_SETTINGS_ID = 'aiProSettings';

export const aiProSettingsType = {
  ...defineType({
    name: 'aiProSettings',
    title: 'AI for Professionals Settings',
    type: 'document',
    fields: [
      defineField({
        name: 'registrationOpen',
        title: 'Registration open',
        description:
          'Turn this off to close registration: the website shows the message below instead of the form, and the "Register for training" button changes to "Registration closed". Turn it on to reopen.',
        type: 'boolean',
        initialValue: true,
      }),
      defineField({
        name: 'closedMessage',
        title: 'Message shown when registration is closed',
        type: 'text',
        rows: 3,
        initialValue: 'Registration for this programme is now closed. Thank you for your interest — follow us for news of the next intake.',
      }),
    ],
    preview: {
      select: { open: 'registrationOpen' },
      prepare({ open }: { open?: boolean }) {
        return { title: 'AI for Professionals Settings', subtitle: open === false ? 'Registration closed' : 'Registration open' };
      },
    },
  }),
  // Singleton: no "create new" or "delete" — only ever edit the one document.
  __experimental_actions: ['update', 'publish'],
};
