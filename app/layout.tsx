import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import SiteChrome from "@/components/layout/SiteChrome";
import { SITE_URL, buildOpenGraph, buildTwitter } from "@/lib/seo";
import { organizationSchema, StructuredData } from "@/lib/structuredData";
import { client } from "@/sanity/lib/client";
import "./globals.css";

// Self-hosted via next/font (no extra Google Fonts request at runtime,
// no layout-shifting flash of a fallback font) — replaces the site's old
// serif body/heading faces with something livelier per the site owner's
// request. See --font-body / --font-serif in globals.css.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const SITE_TITLE = "CAIRLab — Cybersecurity and Artificial Intelligence Research Laboratory";
const SITE_DESCRIPTION =
  "CAIRLab (Cybersecurity and Artificial Intelligence Research Laboratory) advances AI and digital security research to protect data, empower communities, and drive responsible technology adoption.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: buildOpenGraph(SITE_TITLE, SITE_DESCRIPTION),
  twitter: buildTwitter(SITE_TITLE, SITE_DESCRIPTION),
};

// Fetched here (server-side, once per request) rather than client-side in
// ScrollProgress — a phone on a flaky/limited connection (e.g. testing via
// a mobile hotspot) may not be able to reach Sanity's API directly from
// the browser at all, even though it can reach this dev server fine over
// the same local network. Fetching server-side sidesteps that entirely.
async function getSitePopup() {
  try {
    const doc = await client.fetch(
      `*[_type == "sitePopup"][0]{ enabled, badge, title, tagline, linkText, linkHref }`
    );
    if (doc?.title && doc.enabled !== false) {
      return {
        badge: (doc.badge as string) || '',
        title: doc.title as string,
        tagline: (doc.tagline as string) || '',
        linkText: (doc.linkText as string) || 'Learn More →',
        linkHref: (doc.linkHref as string) || '/hackathon',
      };
    }
  } catch (err) {
    console.error('Failed to fetch site popup:', err);
  }
  return null;
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const sitePopup = await getSitePopup();

  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        {/* Font Awesome CDN for social media icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
        />
        <StructuredData data={organizationSchema()} />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteChrome sitePopup={sitePopup}>{children}</SiteChrome>
      </body>
    </html>
  );
}
