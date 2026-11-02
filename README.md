# CAIRLab Website

The public website for CAIRLab (Cybersecurity and Artificial Intelligence Research Lab) at KNUST — homepage, team directory, research themes, projects, news, events, hackathon page, publications, and a scholarship application form. Built with **Next.js 16** (App Router) and **Sanity** as the CMS, so most content (news posts, team members, events, research themes, hackathon details) can be edited by non-developers through a web-based editor at `/studio`, without touching code.

Live site: https://cairlab-mu.vercel.app (production alias — see [Custom domain](#custom-domain) to point a real domain at it).

---

## 1. Prerequisites

- **Node.js 20+** and npm
- A **Sanity account** (free) — the CMS backend. Either reuse the existing CAIRLab project (ask whoever manages it for the Project ID) or create a new one at [sanity.io/manage](https://sanity.io/manage).
- A **Resend account** (free tier is fine) — sends the contact form and scholarship application emails.
- A **Vercel account** — hosting. Not required for local development.
- The **Vercel CLI**, if you'll deploy from the command line: `npm i -g vercel`

## 2. Local setup

```bash
git clone https://github.com/KATAKYIE-KWESI/CAIRLab-.git cairlab
cd cairlab
npm install
cp .env.local.example .env.local
```

Now fill in `.env.local` — see [Environment variables](#3-environment-variables) below for what each one is and where to get it.

```bash
npm run dev
```

Open http://localhost:3000. The page hot-reloads as you edit files under `app/`.

Other scripts:

```bash
npm run build   # production build — run this before every deploy to catch errors early
npm run start   # serve the production build locally (after npm run build)
npm run lint    # ESLint
```

## 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill these in. **Never commit `.env.local`** — it's already git-ignored.

| Variable | Required | What it's for | Where to get it |
|---|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | Connects the site to its Sanity content | [sanity.io/manage](https://sanity.io/manage) → your project → Project ID (top of the settings page) |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | Which dataset within the project (almost always `production`) | Same page, under Datasets |
| `SANITY_API_TOKEN` | Yes | Server-side **write** access — needed for the newsletter signup form (`/api/newsletter`) and for `/studio` to save edits | sanity.io/manage → project → API → Tokens → Add API token → give it **Editor** permissions |
| `RESEND_API_KEY` | Yes | Sends the Contact form and Scholarship application emails | [resend.com](https://resend.com) → sign up → Dashboard → API Keys → Create API Key |
| `CONTACT_TO_EMAIL` | Yes | Inbox that receives contact/scholarship submissions | Any email you control. **Note:** until `cairlab.org` is verified as a sending domain in Resend, Resend can only deliver *to* the email address the Resend account was signed up with — sending to a different inbox will silently fail. Verify the domain in Resend's dashboard to lift this. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | The real deployed domain (no trailing slash), e.g. `https://cairlab.knust.edu.gh`. Used to build the sitemap, `robots.txt`, social share (Open Graph) links and the links in registration emails | Whatever domain you're deploying to. Defaults to `https://cairlab.knust.edu.gh` if left unset — **change this if you're deploying somewhere else**, or search engines and social previews will point at the wrong domain. |
| `NEWSLETTER_ADMIN_PASSWORD` | Yes | A shared secret that gates `/send-newsletter` (the page used to email all newsletter subscribers). There's no login system on this site — this password *is* the access control. | Make one up. Keep it out of chat/email where possible. |
| `NEXT_PUBLIC_SANITY_API_VERSION` | No | Pins the Sanity API version | Optional — defaults to `2025-01-01` if unset. Only set this if Sanity support tells you to. |

## 4. The Sanity CMS (`/studio`)

Most of the site's content already lives in Sanity, not in the codebase:

- **News posts**, **team members**, **events**, **projects**, **thematic areas** (with their research project cards), the **hackathon page**, **publications**, and the homepage **popup banner** are all editable document types.
- Editors log in at **`/studio`** on the deployed site (e.g. `https://cairlab.knust.edu.gh/studio`) with a Sanity account that's been added as a project member.
- **Roles matter.** Sanity's built-in roles are Administrator (full access), Editor (create/edit/publish/delete), Contributor (create/edit only — no publish or delete), and Viewer (read-only). If someone can't see a Delete button or can't publish, they likely need a higher role — grant it at sanity.io/manage → project → Members.
- Every content type degrades gracefully: if the Sanity fetch fails or a content type has zero documents, the corresponding page falls back to hardcoded placeholder content instead of breaking. You'll notice this as "generic-looking" content if Sanity is misconfigured — that's the fallback, not a bug.
- **One-time content seeding**: `scripts/seed-*.mjs` (news, team, events, projects, hackathon, themes) populate Sanity with the original launch content, including uploading local images from `public/images/` as real Sanity image assets. They're safe to re-run (they replace the same known document IDs) but you generally only need them once, when pointing the site at a **brand-new, empty** Sanity project. Run with `node scripts/seed-news.mjs` etc. — they read credentials from `.env.local`.

## 5. Deploying

There are two independent things that both need to happen for changes to go live: **push to GitHub** (source of truth / backup) and **deploy to Vercel** (what actually serves the site). Pushing to GitHub alone does **not** redeploy the site — this repo is linked to Vercel via the CLI, not via Vercel's "auto-deploy on push" GitHub integration.

### Deploy checklist

```bash
npm run build          # catches TypeScript/build errors before you deploy
git push origin main
vercel deploy --prod --yes
```

The `vercel` CLI needs to be logged in and the project linked once (`vercel link`) — the `.vercel/project.json` file in this repo already points at the existing `cairlab` project, so on a machine with CLI access to that Vercel team, `vercel deploy --prod` just works.

### Custom domain

By default the site lives at the Vercel-assigned `https://cairlab-mu.vercel.app`. To use a real domain (e.g. `cairlab.org`):

1. Vercel dashboard → your project → **Settings → Domains** → add the domain.
2. Add the DNS records Vercel shows you (A/CNAME) at your domain registrar.
3. Update `NEXT_PUBLIC_SITE_URL` in Vercel's environment variables to the new domain, then redeploy.
4. Add the new domain to Sanity's CORS allow-list (see the gotcha below) — content will otherwise fail to load.
5. Verify the domain in Resend if you want the contact/scholarship forms to actually deliver (see the `CONTACT_TO_EMAIL` note above).

## 6. Operational gotchas

These are non-obvious failure modes that came up building this site — worth knowing before you hit them cold.

**Sanity CORS blocks a new domain by default.** The site fetches content client- and server-side directly from Sanity's API. If you deploy to a domain that hasn't been added to Sanity's CORS allow-list, those fetches fail (silently, from a visitor's perspective — pages fall back to placeholder content rather than erroring). Fix: sanity.io/manage → project → **API → CORS Origins** → Add origin → enter the new domain (with `https://`). Do this for every new domain the site is served from, including Vercel preview URLs if you need Studio/content to work there too.

**GitHub rejects a push if *any* commit in the pushed history — not just the latest one — contains a file over 100MB.** This bit us mid-project: a large video got committed, then replaced with a compressed version in a *later* commit, but the push still failed because the oversized blob was still sitting in the earlier commit's history. If this happens: don't just replace the file again — the history itself needs cleaning, e.g. `git filter-repo --strip-blobs-bigger-than 90M --force` (only safe to run on commits that haven't been shared/pushed yet, since it rewrites commit hashes and requires a force-push).

**Vercel also has a 100MB per-file upload limit**, separate from GitHub's. This site keeps original, uncompressed video/image files out of git entirely — they live in `_source-videos/` and `_source-images/` at the repo root, which are excluded from git (`.gitignore`) and, belt-and-suspenders, from the Vercel upload itself (`.vercelignore`, in case they were ever accidentally tracked). Only compressed, web-ready copies under `public/videos/` and `public/images/` are ever committed or deployed. If you need to swap in a new large video/image: put the raw original in `_source-videos/` or `_source-images/`, generate a compressed copy into `public/`, and reference the compressed one in code. Never commit directly to `public/` a file you haven't checked the size of.

## 7. Project structure (quick orientation)

```
app/                    Next.js App Router pages (one folder per route)
app/studio/[[...tool]]/ Embeds the Sanity Studio CMS at /studio
components/             React components, grouped by page/feature
sanity/schemaTypes/     Sanity content model — what editors see in /studio
scripts/seed-*.mjs      One-time content population for a fresh Sanity project
public/images|videos/   Compressed, web-ready assets actually served
_source-videos/         Raw, uncompressed originals — git-ignored, local only
_source-images/         Same, for images
.env.local.example      Template for required environment variables
```
