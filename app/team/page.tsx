// app/team/page.tsx
// Team page — CAIRLab's researchers and leadership.
//
// CONTENT NOW LIVES IN SANITY: team members are fetched from the CMS at
// /studio (Team Member document type — see sanity/schemaTypes/teamMember.ts).
// To add someone, log into /studio, create a Team Member, and hit Publish
// when they're ready to go live — no code change or redeploy needed. The
// page revalidates every 60 seconds.
//
// FALLBACK_TEAM below (from lib/team.ts) is only a safety net — what
// renders if the Sanity fetch fails or returns nothing.

import type { Metadata } from 'next';
import PageHero from '@/components/layout/PageHero';
import TeamDirectory, { type Member } from '@/components/team/TeamDirectory';
import { TEAM, slugify } from '@/lib/team';
import { buildOpenGraph, buildTwitter } from '@/lib/seo';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

const TITLE = 'Our Team — CAIRLab';
const DESCRIPTION =
  'Meet the multidisciplinary team of researchers and leadership pushing the boundaries of AI and cybersecurity at CAIRLab.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph(TITLE, DESCRIPTION, { path: '/team' }),
  twitter: buildTwitter(TITLE, DESCRIPTION),
};

export const revalidate = 60;

const FALLBACK_TEAM: Member[] = TEAM.map((m) => ({ ...m, slug: slugify(m.name) }));

async function getTeam(): Promise<Member[]> {
  try {
    const docs = await client.fetch(
      `*[_type == "teamMember"] | order(order asc){ name, "slug": slug.current, badge, role, image, specialization, stats, bio, tags }`
    );
    if (Array.isArray(docs) && docs.length > 0) {
      return docs.map((d) => ({
        name: d.name,
        slug: d.slug,
        badge: d.badge || '',
        role: d.role || '',
        image: d.image ? urlFor(d.image).width(500).height(500).fit('crop').url() : '',
        specialization: d.specialization || '',
        stats: d.stats ?? [],
        bio: d.bio || '',
        tags: d.tags ?? [],
      }));
    }
  } catch (err) {
    console.error('Failed to fetch team from Sanity, using fallback content:', err);
  }
  return FALLBACK_TEAM;
}

export default async function TeamPage() {
  const team = await getTeam();

  return (
    <>
      <PageHero
        kicker="Our Brilliant Minds"
        title="Meet The CAIRLab Team"
        description="A multidisciplinary team of experts pushing the boundaries of AI and cybersecurity research."
        image="/images/team.jpg"
        tall
      />

      <section className="cl-section">
        <div className="cl-wrap">
          <TeamDirectory team={team} />
        </div>
      </section>

      <section className="cl-section cl-section-black">
        <div className="cl-wrap">
          <div className="cl-section-head">
            <h2>Want to Join Our Team?</h2>
            <p>
              We&apos;re always looking for talented researchers, developers, and students
              passionate about AI and cybersecurity.
            </p>
            <div className="cl-section-cta">
              <a href="/contact" className="cl-btn-blue">Get in Touch →</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
