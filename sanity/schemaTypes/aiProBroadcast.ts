// sanity/schemaTypes/aiProBroadcast.ts
// An email message to send to groups of AI for Professionals registrants
// (Studio > AI for Professionals > Broadcast messages). Write it, publish it,
// then use the "Send to recipients" button (sanity/actions/SendBroadcastAction).
// Sending is done by app/api/ai-for-professionals/broadcast/route.ts, which
// fills in the status fields below.

import { defineField, defineType } from 'sanity';

export const BROADCAST_AUDIENCES = [
  { title: 'Partner organisation contacts', value: 'employers' },
  { title: 'All nominated staff (on partner lists)', value: 'nominees' },
  { title: 'Registered staff (completed registration)', value: 'employees' },
  { title: 'Graduates', value: 'graduates' },
] as const;

export const aiProBroadcastType = defineType({
  name: 'aiProBroadcast',
  title: 'Broadcast Message',
  type: 'document',
  fields: [
    defineField({
      name: 'subject',
      title: 'Email subject',
      type: 'string',
      validation: (rule) => rule.required().max(150),
    }),
    defineField({
      name: 'audience',
      title: 'Send to',
      description: 'Tick every group that should receive this message. Anyone in more than one group still gets it only once.',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: [...BROADCAST_AUDIENCES], layout: 'grid' },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      description: 'Plain text. Leave a blank line between paragraphs. Recipients see "Dear participant," above it.',
      type: 'text',
      rows: 10,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'buttonText',
      title: 'Button text (optional)',
      description: 'e.g. "Register now" — shown as a button under the message.',
      type: 'string',
    }),
    defineField({
      name: 'buttonUrl',
      title: 'Button link (optional)',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['http', 'https', 'mailto'] }),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      readOnly: true,
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Not sent yet', value: 'draft' },
          { title: 'Queued', value: 'queued' },
          { title: 'Sending…', value: 'sending' },
          { title: 'Sent', value: 'sent' },
          { title: 'Failed', value: 'failed' },
        ],
      },
    }),
    defineField({ name: 'sentAt', title: 'Sent at', type: 'datetime', readOnly: true }),
    defineField({ name: 'recipientCount', title: 'Number of recipients', type: 'number', readOnly: true }),
    defineField({ name: 'error', title: 'Error (if sending failed)', type: 'text', rows: 2, readOnly: true }),
  ],
  orderings: [{ title: 'Newest first', name: 'createdDesc', by: [{ field: '_createdAt', direction: 'desc' }] }],
  preview: {
    select: { subject: 'subject', status: 'status', count: 'recipientCount', sentAt: 'sentAt' },
    prepare: ({ subject, status, count, sentAt }) => ({
      title: subject || 'Untitled message',
      subtitle:
        status === 'sent'
          ? `Sent to ${count ?? 0} people${sentAt ? ` · ${new Date(sentAt).toLocaleDateString()}` : ''}`
          : { queued: 'Queued', sending: 'Sending…', failed: 'Failed — see error' }[status as string] ?? 'Not sent yet',
    }),
  },
});
