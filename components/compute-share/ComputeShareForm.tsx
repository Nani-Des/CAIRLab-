// components/compute-share/ComputeShareForm.tsx
// "Get started" box on the Cybersecurity & AI Certification Initiative page
// (app/compute-share): people simply email Dr. Ahene. No server route —
// app/api/compute-share was removed earlier.

const EMAIL = 'aheneemmanuel@knust.edu.gh';

export default function ComputeShareForm() {
  return (
    <div className="cl-cert-cta">
      <div className="cl-cert-cta-icon"><i className="fa-solid fa-envelope" aria-hidden="true"></i></div>
      <h2>Interested? Email us</h2>
      <p>Tell us which certification you&apos;d like to take and we&apos;ll get back to you with the next steps.</p>
      <a href={`mailto:${EMAIL}`} className="cl-cert-cta-email">{EMAIL}</a>
    </div>
  );
}
