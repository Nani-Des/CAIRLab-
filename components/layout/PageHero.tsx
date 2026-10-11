// components/layout/PageHero.tsx
// Compact banner used at the top of interior (non-home) pages.

export default function PageHero({
  kicker,
  title,
  description,
  image,
  tall,
}: {
  kicker: string;
  title: string;
  description: string;
  /** Optional background photo path (e.g. "/images/projects-hero.jpg"). A dark
   *  overlay is applied on top automatically so the white text stays readable.
   *  Until a file exists at that path, the hero just falls back to the plain
   *  dark gradient — nothing breaks, it simply won't show an image yet. */
  image?: string;
  /** Adds extra bottom padding so this hero matches the height of the
   *  Hackathon page's hero (which has extra content — status badge,
   *  powered-by line, CTA — that naturally makes it taller). */
  tall?: boolean;
}) {
  return (
    <section
      className={`cl-page-hero${image ? ' cl-page-hero--image' : ''}${tall ? ' cl-page-hero--tall' : ''}`}
      style={image ? ({ '--hero-image': `url(${image})` } as React.CSSProperties) : undefined}
    >
      <div className="cl-wrap">
        <span className="cl-page-hero-kicker">{kicker}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
