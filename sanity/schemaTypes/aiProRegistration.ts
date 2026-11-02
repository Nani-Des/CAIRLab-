// sanity/schemaTypes/aiProRegistration.ts
// One document per AI for Professionals registration (employer or employee),
// created automatically by app/api/ai-for-professionals/register/route.ts.
// Stored under the private "aiPro." ID path (see lib/aiForProfessionals.ts),
// so these are visible in Studio but never in public queries. The approval
// link's code is only kept as a hash, so it can't be copied from here.

import { defineField, defineType, type ConditionalPropertyCallbackContext } from 'sanity';

// Show each field only on the kinds of record it applies to.
type Role = 'employer' | 'employee' | 'graduate';
const onlyFor = (...roles: Role[]) => ({ document }: ConditionalPropertyCallbackContext) =>
  !roles.includes(document?.role as Role);

export const aiProRegistrationType = defineType({
  name: 'aiProRegistration',
  title: 'AI for Professionals Registration',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Employer', value: 'employer' },
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
          { title: 'Graduate / tertiary student', value: 'graduate' },
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
    defineField({ name: 'consentGiven', title: 'Agreed to data processing for the programme', type: 'boolean' }),
    defineField({ name: 'submittedAt', title: 'Submitted at', type: 'datetime' }),
    defineField({ name: 'decidedAt', title: 'Approved / rejected at', type: 'datetime', hidden: onlyFor('employee') }),
    defineField({ name: 'approvalTokenHash', title: 'Approval code (hashed)', type: 'string', hidden: true }),
  ],
  orderings: [{ title: 'Newest first', name: 'submittedDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: {
    select: { name: 'fullName', org: 'organisation', role: 'role', status: 'status', email: 'email' },
    prepare: ({ name, org, role, status, email }) => ({
      title: `${name || 'Unnamed'}${org ? ` — ${org}` : ''}`,
      subtitle: `${{ employer: 'Employer', employee: 'Employee', graduate: 'Graduate' }[role as string] ?? role} · ${
        { employer: 'Registered', pending: 'Pending approval', approved: 'Approved', rejected: 'Rejected', applied: 'Applied' }[status as string] ?? status
      }${email ? ` · ${email}` : ''}`,
    }),
  },
});
