// sanity/env.ts
// Central place to read Sanity connection settings from environment
// variables. Deliberately doesn't throw on missing values — until real
// credentials are set in .env.local (see .env.local.example), these fall
// back to empty strings so the rest of the site keeps building/running.
// The Studio itself (app/studio) will show a "configure your project"
// prompt if these are missing, rather than crashing the build.

export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
