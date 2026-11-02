// components/layout/Footer.tsx
// Site-wide footer shared by every page.

import Link from 'next/link';
import Image from 'next/image';
import NewsletterSignup from './NewsletterSignup';

export default function Footer() {
  return (
    <footer className="cl-footer">
      <div className="cl-footer-pattern" />
      <div className="cl-footer-newsletter" id="newsletter">
        <div className="cl-footer-newsletter-inner">
          <div>
            <h4>Stay in the Loop</h4>
            <p>Get CAIRLab&apos;s research news and event announcements in your inbox.</p>
          </div>
          <NewsletterSignup />
        </div>
      </div>
      <div className="cl-footer-inner">
        <div>
          <h4>CAIRLAB</h4>
          <p>
            Cybersecurity and Artificial Intelligence Research Laboratory. Advancing AI and
            digital security research to protect data, empower communities, and drive
            responsible technology adoption.
          </p>
          <div className="cl-social-row">
            <a
              href="https://www.linkedin.com/company/cair-lab-knust/home/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
            <a
              href="https://youtu.be/P0JtV8ElpDw"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <i className="fa-brands fa-youtube"></i>
            </a>
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=College%20of%20Science%2C%20KNUST%2C%20Kumasi%2C%20Ghana"
            target="_blank"
            rel="noopener noreferrer"
            className="cl-footer-qr"
          >
            <Image
              src="/images/cairlab-location-qr.png"
              alt="QR code linking to directions to CAIRLab on Google Maps"
              width={72}
              height={72}
            />
            <div>
              <strong>Find Us</strong>
              <span>Scan or click for directions to CAIRLab</span>
            </div>
          </a>
        </div>
        <div className="cl-footer-cols">
          <div className="cl-footer-links">
            <h4>Navigation</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/themes">Themes</Link></li>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/publications">Publications</Link></li>
              <li><Link href="/news">News</Link></li>
            </ul>
          </div>
          <div className="cl-footer-links">
            <h4>Connect</h4>
            <ul>
              <li><Link href="/events">Events</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/initiatives">Initiatives</Link></li>
              <li><Link href="/apply-for-scholarship">Apply For Scholarship</Link></li>
              <li><Link href="/contact">Get Involve</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="cl-footer-status">
        <div className="cl-status-dot" />
        <span>All CAIRLab compute systems and AI clusters fully operational.</span>
      </div>
    </footer>
  );
}
