// app/team/[slug]/page.tsx
// Individual team member profile page.
//
// CONTENT NOW LIVES IN SANITY: fetched by slug from the Team Member
// document type (see sanity/schemaTypes/teamMember.ts) — same content
// source as the /team listing page. Falls back to lib/team.ts's TEAM
// array if Sanity is unreachable or has no matching document.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMemberBySlug } from '@/lib/team';
import { buildOpenGraph, buildTwitter, DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/seo';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { personSchema, StructuredData } from '@/lib/structuredData';

export const revalidate = 60;

type Member = {
  name: string;
  badge: string;
  role: string;
  image: string;
  specialization: string;
  stats: { num: string; label: string }[];
  bio: string;
  tags: string[];
  linkedin?: string;
};

async function getMember(slug: string): Promise<Member | undefined> {
  try {
    const doc = await client.fetch(
      `*[_type == "teamMember" && slug.current == $slug][0]{ name, badge, role, image, specialization, stats, bio, tags, linkedin }`,
      { slug }
    );
    if (doc) {
      return {
        name: doc.name,
        badge: doc.badge || '',
        role: doc.role || '',
        image: doc.image ? urlFor(doc.image).width(800).height(800).fit('crop').url() : '',
        specialization: doc.specialization || '',
        stats: doc.stats ?? [],
        bio: doc.bio || '',
        tags: doc.tags ?? [],
        linkedin: doc.linkedin || undefined,
      };
    }
  } catch (err) {
    console.error('Failed to fetch team member from Sanity:', err);
  }
  return getMemberBySlug(slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const member = await getMember(slug);
  if (!member) return { title: 'Team Member — CAIRLab' };
  const title = `${member.name} — CAIRLab`;
  const image = member.image || DEFAULT_OG_IMAGE;
  return {
    title,
    description: member.bio,
    openGraph: buildOpenGraph(title, member.bio, { path: `/team/${slug}`, image }),
    twitter: buildTwitter(title, member.bio, image),
  };
}

export default async function TeamMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = await getMember(slug);
  if (!member) notFound();

  return (
    <section className="cl-section">
      <StructuredData
        data={personSchema({
          name: member.name,
          jobTitle: member.role,
          description: member.bio,
          image: member.image || undefined,
          url: `${SITE_URL}/team/${slug}`,
          linkedin: member.linkedin,
        })}
      />
      <div className="cl-wrap">
        <Link href="/team" className="cl-profile-back">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Back to Team
        </Link>

        <div className="cl-profile-layout">
          <div
            className="cl-profile-photo"
            role="img"
            aria-label={`Photo of ${member.name}`}
            style={{ '--card-image': `url(${member.image})` } as React.CSSProperties}
          />
          <div className="cl-profile-content">
            <div className="cl-profile-badge-row">
              <span className="cl-profile-badge">{member.badge}</span>
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cl-profile-linkedin"
                  aria-label={`${member.name} on LinkedIn`}
                >
                  <i className="fa-brands fa-linkedin-in" aria-hidden="true"></i>
                </a>
              )}
            </div>
            <h1>{member.name}</h1>
            <p className="cl-profile-role">{member.role}</p>
            <p className="cl-profile-spec">{member.specialization}</p>
            {member.stats.length > 0 && (
              <div className="cl-profile-stats">
                {member.stats.map((stat) => (
                  <div key={stat.label}>
                    <span className="cl-profile-stat-num">{stat.num}</span>
                    <span className="cl-profile-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="cl-profile-bio">{member.bio}</p>
            <div className="cl-profile-tags">
              {member.tags.map((tag) => (
                <span className="cl-profile-tag" key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
