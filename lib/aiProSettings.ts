// lib/aiProSettings.ts
// Reads the AI for Professionals open/close switch from Sanity (server-only
// use: pages and API routes). Missing settings count as "open", so the form
// keeps working until someone actually closes it in Studio.

import { client } from '@/sanity/lib/client';

export type AiProSettings = { registrationOpen: boolean; closedMessage: string };

const DEFAULT_CLOSED_MESSAGE =
  'Registration for this programme is now closed. Thank you for your interest — follow us for news of the next intake.';

export async function getAiProSettings(): Promise<AiProSettings> {
  try {
    const doc = await client.fetch<{ registrationOpen?: boolean; closedMessage?: string } | null>(
      '*[_id == "aiProSettings"][0]{ registrationOpen, closedMessage }'
    );
    return {
      registrationOpen: doc?.registrationOpen !== false,
      closedMessage: doc?.closedMessage || DEFAULT_CLOSED_MESSAGE,
    };
  } catch (err) {
    console.error('Failed to fetch AI for Professionals settings:', err);
    return { registrationOpen: true, closedMessage: DEFAULT_CLOSED_MESSAGE };
  }
}
