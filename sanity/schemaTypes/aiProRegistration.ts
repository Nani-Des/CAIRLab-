// sanity/schemaTypes/aiProRegistration.ts
// One document per AI for Professionals registration (employer or employee),
// created automatically by app/api/ai-for-professionals/register/route.ts.
// Stored under the private "aiPro." ID path (see lib/aiForProfessionals.ts),
// so these are visible in Studio but never in public queries. The approval
// link's code is only kept as a hash, so it can't be copied from here.

import { defineField, defineType, type ConditionalPropertyCallbackContext, type FieldDefinition } from 'sanity';

// Show each field only on the kinds of record it applies to.
type Role = 'employer' | 'employee' | 'graduate';
const onlyFor = (...roles: Role[]) => ({ document }: ConditionalPropertyCallbackContext) =>
  !roles.includes(document?.role as Role);

export const aiProRegistrationType = defineType({
  name: 'aiProRegistration',
  title: 'AI for Professionals Registration',
  type: 'document',
  // Everything is read-only except the "Application received email sent"
  // tick, which staff switch on after emailing an applicant manually.
  fields: ([
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Employer', value: 'employer' },
          { title: 'Registered (nominated by partner)', value: 'nominated' },
          { title: 'Pending approval', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Graduate applied', value: 'applied' },
        ],
      },
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Employer', value: 'employer' },
          { title: 'Employee', value: 'employee' },
          { title: 'Graduate', value: 'graduate' },
        ],
      },
    }),
    defineField({ name: 'fullName', title: 'Full name (employer: contact person)', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'organisation', title: 'Organisation (graduates: institution)', type: 'string' }),
    defineField({ name: 'jobTitle', title: 'Job title', type: 'string', hidden: onlyFor('employer', 'employee') }),
    defineField({ name: 'gender', title: 'Gender', type: 'string', hidden: onlyFor('graduate') }),
    defineField({ name: 'programmeOfStudy', title: 'Programme of study', type: 'string', hidden: onlyFor('graduate') }),
    defineField({ name: 'qualification', title: 'Highest qualification', type: 'string', hidden: onlyFor('graduate') }),
    defineField({ name: 'studyStatus', title: 'Current status', type: 'string', hidden: onlyFor('graduate') }),
    defineField({ name: 'completionYear', title: 'Year of completion', type: 'string', hidden: onlyFor('graduate') }),
    defineField({ name: 'location', title: 'Town / region', type: 'string', hidden: onlyFor('graduate') }),
    defineField({ name: 'track', title: 'Track', type: 'string', hidden: onlyFor('employee', 'graduate') }),
    defineField({ name: 'hub', title: 'Preferred hub (from nomination)', type: 'string', hidden: onlyFor('employee') }),
    defineField({ name: 'motivation', title: 'Why they want to join', type: 'text', hidden: onlyFor('graduate') }),
    defineField({ name: 'employerEmail', title: 'Employer / line manager email', type: 'string', hidden: onlyFor('employee') }),
    defineField({
      name: 'surveyCompleted',
      title: 'Said they completed the Employees Survey',
      description: 'Self-declared on the registration form — check against the KoboToolbox export if needed.',
      type: 'boolean',
      hidden: onlyFor('employee'),
    }),
    defineField({ name: 'sector', title: 'Sector / industry', type: 'string', hidden: onlyFor('employer') }),
    defineField({ name: 'companySize', title: 'Number of employees', type: 'string', hidden: onlyFor('employer') }),
    defineField({
      name: 'skillsNeeded',
      title: 'AI skills the organisation needs most',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: onlyFor('employer'),
    }),
    defineField({ name: 'staffToNominate', title: 'Staff they would like to nominate', type: 'string', hidden: onlyFor('employer') }),
    defineField({ name: 'skillsGaps', title: 'Skills gaps in their workforce', type: 'text', hidden: onlyFor('employer') }),
    defineField({
      name: 'transcript',
      title: 'Transcript',
      description: 'Click the file to open or download it.',
      type: 'file',
      hidden: onlyFor('graduate'),
    }),
    defineField({ name: 'cv', title: 'CV', description: 'Click the file to open or download it.', type: 'file', hidden: onlyFor('graduate') }),
    defineField({ name: 'transcriptFileName', title: 'Transcript (original file name)', type: 'string', hidden: onlyFor('graduate') }),
    defineField({ name: 'cvFileName', title: 'CV (original file name)', type: 'string', hidden: onlyFor('graduate') }),
    defineField({
      name: 'confirmationEmailSent',
      title: 'Confirmation email sent ("Application received" / "You\'re registered")',
      description:
        'No = the automatic email could not be sent (e.g. the Gmail daily limit was reached). Email this person manually, then switch this on and click Publish to take them off the "confirmation not sent" list.',
      type: 'boolean',
      hidden: ({ document }) => document?.confirmationEmailSent === undefined,
    }),
    defineField({
      name: 'documentsSentTo',
      title: 'Transcript & CV emailed to',
      description: 'Older applications: the documents were emailed to this inbox instead of being stored here.',
      type: 'string',
      hidden: ({ document }) => document?.role !== 'graduate' || !document?.documentsSentTo,
    }),
    defineField({ name: 'consentGiven', title: 'Agreed to data processing for the programme', type: 'boolean' }),
    defineField({ name: 'submittedAt', title: 'Submitted at', type: 'datetime' }),
    defineField({ name: 'decidedAt', title: 'Approved / rejected at', type: 'datetime', hidden: onlyFor('employee') }),
    defineField({ name: 'approvalTokenHash', title: 'Approval code (hashed)', type: 'string', hidden: true }),
  ] as FieldDefinition[]).map((field) => (field.name === 'confirmationEmailSent' ? field : { ...field, readOnly: true })),
  orderings: [{ title: 'Newest first', name: 'submittedDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: {
    select: { name: 'fullName', org: 'organisation', role: 'role', status: 'status', email: 'email', confirmed: 'confirmationEmailSent' },
    prepare: ({ name, org, role, status, email, confirmed }) => ({
      title: `${confirmed === false ? '✉️ ' : ''}${name || 'Unnamed'}${org ? ` — ${org}` : ''}`,
      subtitle: `${{ employer: 'Employer', employee: 'Employee', graduate: 'Graduate' }[role as string] ?? role} · ${
        { employer: 'Registered', nominated: 'Registered (nominated)', pending: 'Pending approval', approved: 'Approved', rejected: 'Rejected', applied: 'Applied' }[status as string] ?? status
      }${email ? ` · ${email}` : ''}`,
    }),
  },
});
