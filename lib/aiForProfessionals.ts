// lib/aiForProfessionals.ts
// Shared settings for the KNUST–GIZ "AI for Professionals" registration flow
// (app/initiatives/ai-for-professionals). Imported by both the client form
// and the server routes, so keep it free of secrets and server-only imports.

export const PROGRAMME_NAME = 'KNUST–GIZ AI for Professionals';
export const PROGRAMME_PATH = '/initiatives/ai-for-professionals';

export const TRACKS = [
  'AI for Creatives',
  'AI for Data Analytics',
  'AI for Augmented Software Development',
  'AI for Digital Marketing & E-commerce',
] as const;

// KoboToolbox surveys from the programme's links dashboard. Employees must
// complete the Employees Survey before they can request employer approval.
export const EMPLOYERS_SURVEY_URL = 'https://ee.kobotoolbox.org/x/OrOmH9SO';
export const EMPLOYEES_SURVEY_URL = 'https://ee.kobotoolbox.org/x/QjKdIZZf';
// Employers complete their registration by nominating staff here.
export const NOMINATION_FORM_URL = 'https://forms.gle/nBVtMBUFsX2pXdBg9';

// Graduate / tertiary student applications.
export const QUALIFICATIONS = ['Diploma', 'HND', "Bachelor's degree", "Master's degree", 'PhD', 'Other'] as const;
export const STUDY_STATUSES = ['Final-year student', 'Graduate (completed)', 'National Service personnel'] as const;
export const GENDERS = ['Female', 'Male', 'Prefer not to say'] as const;

export const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–500', 'More than 500'] as const;

// Registrations are stored in Sanity with IDs under this path. The dataset
// is public, but documents whose ID contains a "." are only readable with a
// token — so names, emails and phone numbers never show up in public queries.
export const REGISTRATION_ID_PREFIX = 'aiPro.';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
