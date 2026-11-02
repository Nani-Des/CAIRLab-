// lib/aiProAudience.ts
// GROQ filters for each broadcast audience (see sanity/schemaTypes/
// aiProBroadcast.ts). Shared by the sending route and the Studio's
// "Send to recipients" button, so the count it shows matches who gets it.

export const AUDIENCE_FILTERS: Record<string, string> = {
  employers: 'role == "employer"',
  employees: 'role == "employee"',
  employeesApproved: 'role == "employee" && status == "approved"',
  employeesPending: 'role == "employee" && status == "pending"',
  graduates: 'role == "graduate"',
};

// Query for the email addresses of everyone in the chosen audiences.
export function audienceEmailsQuery(audience: string[]) {
  const parts = audience.map((a) => AUDIENCE_FILTERS[a]).filter(Boolean);
  if (parts.length === 0) return null;
  return `*[_type == "aiProRegistration" && defined(email) && (${parts.map((p) => `(${p})`).join(' || ')})].email`;
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
