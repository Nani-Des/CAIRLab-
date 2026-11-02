// components/layout/SiteChrome.tsx
// Wraps every page with the site's AnnouncementBar/Navbar/Footer — except
// /studio. Sanity Studio expects to own the entire browser viewport for its
// own fixed toolbar and the bottom document action bar (where "Publish"
// lives); sandwiched inside our site chrome with no explicit height handed
// down, that bottom bar can end up clipped or pushed off-screen depending
// on window size, which is why Publish sometimes seemed to "disappear".

'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollProgress, { type SitePopupData } from './ScrollProgress';
import LiveRefresh from './LiveRefresh';

export default function SiteChrome({
  children,
  sitePopup,
}: {
  children: ReactNode;
  sitePopup: SitePopupData;
}) {
  const pathname = usePathname();

  if (pathname?.startsWith('/studio')) {
    // No nav/footer, no shared typography wrapper — Studio gets the full
    // viewport to itself and manages its own fonts/layout.
    return <>{children}</>;
  }

  return (
    <div className="cl-root">
      <AnnouncementBar />
      <Navbar />
      {children}
      <Footer />
      <ScrollProgress sitePopup={sitePopup} />
      <LiveRefresh />
    </div>
  );
}
