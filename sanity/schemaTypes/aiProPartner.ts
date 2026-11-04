// sanity/schemaTypes/aiProPartner.ts
// A partner organisation in the AI for Professionals programme ("Train-2,
// Place-2"), with the staff it nominated. Staff can only register on the site
// if they pick their organisation and use an email listed under its nominees
// (see app/api/ai-for-professionals/verify/route.ts).
//
// These documents hold names, emails and phone numbers, so they live under
// the private "aiPro." ID path like registrations — create new ones with
// Studio > AI for Professionals > "Add a partner organisation", which sets
// that ID (the normal "+" button is turned off for this type).

import { defineArrayMember, defineField, defineType } from 'sanity';

export const aiProPartnerType = defineType({
  name: 'aiProPartner',
  title: 'Partner Organisation',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Organisation name',
      description: 'Exactly as staff should see it in the "select your company" list.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'sector', title: 'Sector', type: 'string' }),
    defineField({ name: 'orgType', title: 'Type', type: 'string' }),
    defineField({ name: 'region', title: 'Address / region', type: 'string' }),
    defineField({ name: 'website', title: 'Website', type: 'string' }),
    defineField({ name: 'contactName', title: 'Contact person', type: 'string' }),
    defineField({ name: 'contactJobTitle', title: 'Contact job title', type: 'string' }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({ name: 'contactPhone', title: 'Contact phone / WhatsApp', type: 'string' }),
    defineField({
      name: 'managerEmails',
      title: 'Other manager emails',
      description:
        'Besides the contact email above, these people can also request a secure link on the website to view and add nominees for this organisation.',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'nominees',
      title: 'Nominated staff',
      description: 'Only these people can register as staff of this organisation. Their email must match what they type on the site.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'nominee',
          fields: [
            defineField({ name: 'fullName', title: 'Full name', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'email', title: 'Email', type: 'string', validation: (rule) => rule.required().email() }),
            defineField({ name: 'phone', title: 'Phone', type: 'string' }),
            defineField({ name: 'jobTitle', title: 'Job title', type: 'string' }),
            defineField({ name: 'track', title: 'Track', type: 'string', description: 'e.g. "Track 3 - Software Dev"' }),
            defineField({ name: 'hub', title: 'Preferred hub', type: 'string' }),
            defineField({ name: 'qualification', title: 'Highest qualification', type: 'string' }),
            defineField({ name: 'addedBy', title: 'Nominated on the website by', type: 'string', readOnly: true }),
            defineField({ name: 'addedAt', title: 'Nominated on the website at', type: 'datetime', readOnly: true }),
            defineField({ name: 'nextStepsEmailAt', title: '"Next steps" email last sent', type: 'datetime', readOnly: true }),
          ],
          preview: {
            select: { title: 'fullName', email: 'email', track: 'track' },
            prepare: ({ title, email, track }) => ({ title, subtitle: [email, track].filter(Boolean).join(' · ') }),
          },
        }),
      ],
    }),
    defineField({ name: 'notes', title: 'Notes', type: 'text', rows: 3 }),
  ],
  orderings: [{ title: 'Name A–Z', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] }],
  preview: {
    select: { name: 'name', nominees: 'nominees', contact: 'contactName' },
    prepare: ({ name, nominees, contact }) => {
      const count = Array.isArray(nominees) ? nominees.length : 0;
      return {
        title: name || 'Unnamed partner',
        subtitle: `${count ? `${count} nominated staff` : 'No nominees yet'}${contact ? ` · ${contact}` : ''}`,
      };
    },
  },
});
