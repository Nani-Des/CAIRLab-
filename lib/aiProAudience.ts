// lib/aiProAudience.ts
// GROQ for each broadcast audience (see sanity/schemaTypes/aiProBroadcast.ts).
// Shared by the sending route and the Studio's "Send to recipients" button,
// so the count it shows matches who gets it. Each audience is a query that
// returns a list of email addresses; the chosen ones are joined together.

const REG = '_type == "aiProRegistration" && defined(email)';

export const AUDIENCE_QUERIES: Record<string, string> = {
  // Contact people of partner organisations (plus any older employer sign-ups).
  employers: `*[_type == "aiProPartner" && defined(contactEmail)].contactEmail + *[_type == "aiProPartner"].managerEmails[] + *[${REG} && role == "employer"].email`,
  // Everyone on a partner's nomination list, whether or not they've registered yet.
  nominees: '*[_type == "aiProPartner"].nominees[defined(email)].email',
  // Staff who have completed registration on the site.
  employees: `*[${REG} && role == "employee"].email`,
  graduates: `*[${REG} && role == "graduate"].email`,
  // Older approval-based statuses (kept so earlier messages still resolve).
  employeesApproved: `*[${REG} && role == "employee" && status == "approved"].email`,
  employeesPending: `*[${REG} && role == "employee" && status == "pending"].email`,
};

// Query for the email addresses of everyone in the chosen audiences.
export function audienceEmailsQuery(audience: string[]) {
  const parts = audience.map((a) => AUDIENCE_QUERIES[a]).filter(Boolean);
  if (parts.length === 0) return null;
  return parts.map((p) => `(${p})`).join(' + ');
}

// De-duplicate case-insensitively, keeping the first spelling seen.
export function uniqueEmails(emails: (string | null)[]) {
  const seen = new Map<string, string>();
  for (const e of emails) {
    const v = (e || '').trim();
    if (v && !seen.has(v.toLowerCase())) seen.set(v.toLowerCase(), v);
  }
  return [...seen.values()];
}
