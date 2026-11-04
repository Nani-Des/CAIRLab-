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

// Organisations that aren't partners yet: the proposal to read and the
// Partnership Commitment & Employee Nomination Form to sign up with (from the
// proposal document, which is served from public/docs/).
export const PARTNERSHIP_PROPOSAL_PDF = '/docs/ai-for-professionals-partnership-proposal.pdf';
export const PARTNERSHIP_FORM_URL = 'https://forms.gle/4sFtwBiTPXtoHyxd6';
export const PROGRAMME_CONTACT = { name: 'Dr. Emmanuel Ahene', email: 'aheneemmanuel@knust.edu.gh', phone: '0203434503' };

// Nomination spreadsheets label tracks "Track 3 - Software Dev" etc.; map the
// track number onto the names used on the site.
export function trackFromNomination(value: string | undefined | null): string {
  const n = Number(/track\s*(\d)/i.exec(value || '')?.[1]);
  return n >= 1 && n <= TRACKS.length ? TRACKS[n - 1] : '';
}

// The reverse, for nominations added on the site: "Track 2 - AI for Data Analytics".
export function nominationTrackLabel(track: string): string {
  const i = (TRACKS as readonly string[]).indexOf(track);
  return i >= 0 ? `Track ${i + 1} - ${track}` : '';
}

export const HUBS = ['KNUST Kumasi', 'UDS Tamale', 'Hybrid'] as const;

// Graduate documents (transcript + CV), emailed to the programme inbox.
// Graduates' "Why do you want to join?" answer.
export const MOTIVATION_MAX_WORDS = 500;
export const countWords = (text: string) => (text.trim().match(/\S+/g) || []).length;

export const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx'] as const;
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;

// Graduate applications (graduates only, not current students).
export const QUALIFICATIONS = ['Diploma', 'HND', "Bachelor's degree", "Master's degree", 'PhD', 'Other'] as const;
export const STUDY_STATUSES = ['Recent graduate', 'National Service personnel', 'Graduate — employed', 'Graduate — job seeking'] as const;
export const GENDERS = ['Female', 'Male', 'Prefer not to say'] as const;

export const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–500', 'More than 500'] as const;

// Registrations are stored in Sanity with IDs under this path. The dataset
// is public, but documents whose ID contains a "." are only readable with a
// token — so names, emails and phone numbers never show up in public queries.
export const REGISTRATION_ID_PREFIX = 'aiPro.';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
