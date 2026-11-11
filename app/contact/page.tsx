// app/contact/page.tsx
// Contact page — reach CAIRLAB, plus a live inquiry form.
// The form (ContactForm) submits to app/api/contact/route.ts, which emails
// submissions out via Resend — see that file and .env.local.example for setup.

import type { Metadata } from 'next';
import PageHero from '@/components/layout/PageHero';
import ContactForm from '@/components/contact/ContactForm';
import { buildOpenGraph, buildTwitter } from '@/lib/seo';

const TITLE = 'Contact — CAIRLAB';
const DESCRIPTION = 'Get in touch with CAIRLAB for partnerships, research collaboration, and general inquiries.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph(TITLE, DESCRIPTION, { path: '/contact' }),
  twitter: buildTwitter(TITLE, DESCRIPTION),
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Get In Touch"
        title="Contact Us"
        description="Have a question about our research, a partnership idea, or want to collaborate? We'd love to hear from you."
        image="/images/contact-hero.jpg"
      />

      <section className="cl-section">
        <div className="cl-wrap">
          <div className="cl-contact-layout">
            <div className="cl-contact-info">
              <div className="cl-contact-item">
                <div className="cl-contact-icon"><i className="fa-solid fa-location-dot" aria-hidden="true"></i></div>
                <div>
                  <h4>Visit Our Lab</h4>
                  <p>Ghana &ndash; Kumasi</p>
                  <p>KNUST, College of Science.</p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=College%20of%20Science%2C%20KNUST%2C%20Kumasi%2C%20Ghana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cl-contact-action"
                  >
                    View on Map <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
              <div className="cl-contact-item">
                <div className="cl-contact-icon"><i className="fa-solid fa-phone" aria-hidden="true"></i></div>
                <div>
                  <h4>Call Us</h4>
                  <p>+233 54 404 3688</p>
                  <p>Mon &ndash; Fri, 9:00 AM &ndash; 6:00 PM</p>
                  <a href="tel:+233544043688" className="cl-contact-action">
                    Call Now <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
              <div className="cl-contact-item">
                <div className="cl-contact-icon"><i className="fa-solid fa-envelope" aria-hidden="true"></i></div>
                <div>
                  <h4>Email Us</h4>
                  <p>cairlabknust@gmail.com</p>
                  <a href="mailto:cairlabknust@gmail.com" className="cl-contact-action">
                    Send Email <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
              <div className="cl-contact-item">
                <div className="cl-contact-icon"><i className="fa-solid fa-share-nodes" aria-hidden="true"></i></div>
                <div>
                  <h4>Follow Us</h4>
                  <p>Stay updated with our latest research and news</p>
                  <div className="cl-contact-social-row">
                    <a
                      href="https://www.linkedin.com/company/cair-lab-knust/home/"
                      aria-label="LinkedIn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa-brands fa-linkedin-in"></i>
                    </a>
                    <a href="https://youtu.be/P0JtV8ElpDw" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                      <i className="fa-brands fa-youtube"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
