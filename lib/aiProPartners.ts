// lib/aiProPartners.ts
// Server-only lookups for AI for Professionals partner organisations
// (sanity/schemaTypes/aiProPartner.ts). Partner documents are private, so
// these use the token-authenticated write client and only ever hand the
// browser what it needs: organisation names for the picker, and — once a
// company + email pair matches a nomination — that nominee's own details.

import { writeClient } from '@/sanity/lib/writeClient';
import { trackFromNomination } from '@/lib/aiForProfessionals';

export type Nominee = { fullName: string; email: string; jobTitle: string; track: string; hub: string };

export async function getPartnerNames(): Promise<string[]> {
  try {
    const names = await writeClient.fetch<(string | null)[]>('*[_type == "aiProPartner" && defined(name)] | order(name asc).name');
    return [...new Set(names.filter((n): n is string => Boolean(n && n.trim())).map((n) => n.trim()))];
  } catch (err) {
    console.error('Failed to load partner organisations:', err);
    return [];
  }
}

type PartnerDoc = {
  _id: string;
  name: string;
  nominees?: { _key: string; fullName?: string; email?: string; jobTitle?: string; track?: string; hub?: string; nextStepsEmailAt?: string }[];
};

export type NominationCheck =
  | { status: 'unknownCompany' }
  | { status: 'notNominated'; partner: string }
  | { status: 'alreadyRegistered'; partner: string }
  | { status: 'ok'; partner: string; partnerId: string; nomineeKey: string; nextStepsEmailAt?: string; nominee: Nominee };

// Is `email` on the nomination list of the partner called `company`?
export async function checkNomination(company: string, email: string): Promise<NominationCheck> {
  const partner = await writeClient.fetch<PartnerDoc | null>(
    '*[_type == "aiProPartner" && !(_id in path("drafts.**")) && lower(name) == lower($company)][0]{ _id, name, nominees[]{ _key, fullName, email, jobTitle, track, hub, nextStepsEmailAt } }',
    { company: company.trim() }
  );
  if (!partner) return { status: 'unknownCompany' };

  const wanted = email.trim().toLowerCase();
  const match = (partner.nominees || []).find((n) => (n.email || '').trim().toLowerCase() === wanted);
  if (!match) return { status: 'notNominated', partner: partner.name };

  const registered = await writeClient.fetch<number>(
    'count(*[_type == "aiProRegistration" && role == "employee" && lower(email) == lower($email)])',
    { email: wanted }
  );
  if (registered > 0) return { status: 'alreadyRegistered', partner: partner.name };

  return {
    status: 'ok',
    partner: partner.name,
    partnerId: partner._id,
    nomineeKey: match._key,
    nextStepsEmailAt: match.nextStepsEmailAt,
    nominee: {
      fullName: (match.fullName || '').trim(),
      email: (match.email || '').trim(),
      jobTitle: (match.jobTitle || '').trim(),
      track: trackFromNomination(match.track),
      hub: (match.hub || '').trim(),
    },
  };
}

// ---------------- partner managers ----------------

export type ManagerCheck =
  | { status: 'unknownCompany' }
  | { status: 'noContactEmail'; partner: string }
  | { status: 'notManager'; partner: string }
  | { status: 'ok'; partner: string; partnerId: string };

// Is `email` the partner's contact email or one of its other manager emails?
export async function checkManager(company: string, email: string): Promise<ManagerCheck> {
  const p = await writeClient.fetch<{ _id: string; name: string; contactEmail?: string; managerEmails?: string[] } | null>(
    '*[_type == "aiProPartner" && !(_id in path("drafts.**")) && lower(name) == lower($company)][0]{ _id, name, contactEmail, managerEmails }',
    { company: company.trim() }
  );
  if (!p) return { status: 'unknownCompany' };
  const allowed = [p.contactEmail, ...(p.managerEmails || [])].map((e) => (e || '').trim().toLowerCase()).filter(Boolean);
  if (allowed.length === 0) return { status: 'noContactEmail', partner: p.name };
  if (!allowed.includes(email.trim().toLowerCase())) return { status: 'notManager', partner: p.name };
  return { status: 'ok', partner: p.name, partnerId: p._id };
}

export type ManagedNominee = {
  key: string;
  fullName: string;
  email: string;
  jobTitle: string;
  track: string;
  hub: string;
  registered: boolean;
};

// A partner's nominees for the manager's page, with who has registered so far.
export async function getManagedPartner(partnerId: string) {
  const data = await writeClient.fetch<{
    partner: { name: string; nominees?: { _key: string; fullName?: string; email?: string; jobTitle?: string; track?: string; hub?: string }[] } | null;
    registered: (string | null)[];
  }>(
    `{
      "partner": *[_id == $id][0]{ name, nominees[]{ _key, fullName, email, jobTitle, track, hub } },
      "registered": *[_type == "aiProRegistration" && role == "employee"].email
    }`,
    { id: partnerId }
  );
  if (!data.partner) return null;
  const registered = new Set(data.registered.filter(Boolean).map((e) => (e as string).toLowerCase()));
  const nominees: ManagedNominee[] = (data.partner.nominees || []).map((n) => ({
    key: n._key,
    fullName: (n.fullName || '').trim(),
    email: (n.email || '').trim(),
    jobTitle: (n.jobTitle || '').trim(),
    track: trackFromNomination(n.track),
    hub: (n.hub || '').trim(),
    registered: registered.has((n.email || '').trim().toLowerCase()),
  }));
  return { name: data.partner.name, nominees };
}
