# CAIRLab Website — Deployment Guide

This document is for whoever is deploying this site to production. It covers what you need, in what order, and the gotchas that aren't obvious from the code alone.

## Stack

- **Next.js 16.3.4** (App Router), React 19.2.8, TypeScript
- **Sanity CMS** (v6) — embedded Studio at `/studio`, content fetched via `next-sanity`
- **Resend** — transactional email (contact form, scholarship applications, newsletter)
- No database beyond Sanity. No separate backend service.

Scripts: `npm run dev` / `npm run build` / `npm run start` / `npm run lint`. Standard Next.js — any host with Node.js 20+ support works. **Vercel is the natural fit** (built by the Next.js team, zero-config for this stack) and is what these instructions assume, but nothing here is Vercel-specific except where noted.

---

## 1. Environment variables

Copy `.env.local.example` → set these in your hosting platform's environment variable settings (not `.env.local` in production — that file is git-ignored and never deployed).

| Variable | Public? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | Sanity project ID (`ouyo1vwi`) — safe to expose, it's not a secret |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | `production` |
| `SANITY_API_TOKEN` | **No — secret** | Write-access token. Used server-side only (API routes, `sanity/lib/writeClient.ts`). **Never** prefix with `NEXT_PUBLIC_`. |
| `RESEND_API_KEY` | **No — secret** | Resend API key for sending emails |
| `CONTACT_TO_EMAIL` | No | Inbox that receives contact form / scholarship application / newsletter-signup-notification emails |
| `NEXT_PUBLIC_SITE_URL` | Yes | The real production domain, no trailing slash (e.g. `https://cairlab.knust.edu.gh`). Used to build the sitemap, robots.txt, and Open Graph/social-share URLs. **Get this right before launch** — social previews and search indexing depend on it. |
| `NEWSLETTER_ADMIN_PASSWORD` | **No — secret** | Gates `/send-newsletter`, an internal tool with no real login system behind it (see §5) |

**Before going live**, regenerate `SANITY_API_TOKEN` in [sanity.io/manage](https://sanity.io/manage) (Project → API → Tokens) and set a real, unique `NEWSLETTER_ADMIN_PASSWORD` — the current values in `.env.local` were used during development and should be treated as already-exposed.

---

## 2. Sanity — CORS origins (easy to miss, breaks everything if skipped)

Sanity blocks API requests from origins it doesn't recognize. Before the deployed site can read/write any content (including Studio working at all):

1. Go to [sanity.io/manage](https://sanity.io/manage) → your project → **API** → **CORS Origins**.
2. Add your production URL (e.g. `https://cairlab.knust.edu.gh`), with **"Allow credentials"** checked (Studio needs this to log in).
3. If there's a preview/staging domain too (e.g. Vercel's auto-generated `*.vercel.app` preview URLs), add those as well, or Studio previews will fail with CORS errors that look unrelated to CORS.

Without this step, the site will build and deploy fine, then show empty content everywhere (all pages fall back to their hardcoded `FALLBACK_*` content — see §6) and `/studio` won't load.

---

## 3. Resend — email sending

Three features depend on Resend: the Contact form, the Scholarship application form, and the newsletter (`/send-newsletter`).

**Current state**: configured against Resend's free-tier sandbox. All outgoing mail is sent `from: onboarding@resend.dev`, and — critically — **Resend only allows sending TO the email address the account was signed up with** until a domain is verified. In production this means real visitors' contact-form submissions will silently fail to arrive (the API returns an error, which the form does surface to the user, but nobody will actually receive the message).

**To fix before launch:**
1. In the Resend dashboard, go to **Domains** → **Add Domain**, add the real domain, and follow the DNS verification steps (adds SPF/DKIM records).
2. Once verified, update the `from` address in these three files to use it (e.g. `contact@cairlab.org`):
   - `app/api/contact/route.ts`
   - `app/api/apply-scholarship/route.ts`
   - `app/api/newsletter/route.ts`
   - `app/api/send-newsletter/route.ts`
3. Confirm `CONTACT_TO_EMAIL` is set to the real inbox that should receive these (currently a personal test address from development).

---

## 4. Build considerations

- **Large media files**: `public/videos/hero-video.mp4` (~31MB) and `public/videos/cairlab-overview.mp4` (~10MB) are committed directly to the repo and served as static files. This is fine for most hosts but adds to build/deploy time and repo size. If your host has strict size limits or you want faster deploys, consider moving these to a dedicated video host (Mux, Cloudflare Stream, or even just a CDN bucket) and pointing the `<video src>` at that URL instead.
- **Sanity Studio bundle**: `/studio` is a full CMS UI bundled into this same Next.js app. It adds meaningfully to build time and JS bundle size but requires no separate deployment or hosting.
- **ISR**: most content pages use `export const revalidate = 60` — they're statically generated and refresh from Sanity every 60 seconds, not on every request. No special host configuration needed for this (works on Vercel and any host with standard Next.js ISR support).

---

## 5. Known gaps / accepted tradeoffs

Worth knowing about, not necessarily blocking launch:

- **No rate limiting** on `/api/contact`, `/api/apply-scholarship`, `/api/newsletter`, or `/api/send-newsletter`. Someone could script repeated requests to spam the inbox or run up Resend usage. Fixing this properly needs a shared store (Redis / Vercel KV / Upstash) to track request counts across serverless invocations — recommend adding this once you know the final hosting platform.
- **`/send-newsletter` is password-gated, not properly authenticated.** It's a single shared secret checked server-side (`NEWSLETTER_ADMIN_PASSWORD`), not a real login/session system. Fine for one trusted operator; not designed to scale to multiple admins or resist a determined attacker with the password.
- **No Content-Security-Policy header.** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` are set (see `next.config.ts`), but CSP was deliberately left out — Sanity Studio relies on inline scripts/styles it controls itself, and a CSP strict enough to matter risks silently breaking Studio. Add one as a deliberate, tested step if needed.
- **`npm audit` reports ~15 vulnerabilities**, all transitive dependencies of Sanity Studio's own build tooling (`js-yaml`, `smol-toml`, `uuid`), not of the Next.js app itself or anything that reaches site visitors. Fixing requires a breaking upgrade to `sanity@5.x` — worth doing deliberately with its own testing pass, not as part of a deploy.

---

## 6. How content works (so "it's empty" doesn't cause panic)

Every content-driven page (Projects, News, Events, Team, Hackathon, Publications) fetches from Sanity first, and falls back to hardcoded content in the page file itself (`FALLBACK_*` constants) only if that fetch fails or returns nothing. If the live site ever shows generic/placeholder-looking content instead of real data, it means either:
- The Sanity CORS origin isn't set for that domain (see §2), or
- The environment variables aren't set correctly on the host, or
- Sanity itself is unreachable.

It is **not** a sign the code is broken — check the above three things first.

---

## 7. Post-deploy checklist

- [ ] `/` loads with real content (not fallback placeholders — cross-check against `/studio`)
- [ ] `/studio` loads and you can log in with a Sanity account that has project access
- [ ] Submit the Contact form and confirm the email actually arrives at `CONTACT_TO_EMAIL`
- [ ] Submit a test Scholarship application (with a small PDF attached) and confirm it arrives with the attachment
- [ ] Sign up for the newsletter via the footer, confirm it appears in Sanity (`newsletterSubscriber` documents) and the notification email arrives
- [ ] Visit `/sitemap.xml` and `/robots.txt` — confirm the domain in the URLs matches the real production domain (this comes from `NEXT_PUBLIC_SITE_URL`)
- [ ] Share a link to the homepage in Slack/WhatsApp/iMessage and confirm a proper preview card shows (title, description, image) — validates Open Graph tags
- [ ] Test on an actual phone, not just desktop browser responsive mode
