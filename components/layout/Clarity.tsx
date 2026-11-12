// components/layout/Clarity.tsx
// Microsoft Clarity (heatmaps + session recordings) for the public site.
// Rendered from SiteChrome, so it never loads on /studio. It also skips
// private pages that show people's personal details (managers' nominee
// list, approval links, the newsletter sender). Clarity masks what visitors
// type into form fields by default.

'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

const CLARITY_PROJECT_ID = 'zc861asi60';

const PRIVATE_PATHS = [
  '/initiatives/ai-for-professionals/manage',
  '/initiatives/ai-for-professionals/approve',
  '/send-newsletter',
];

export default function Clarity() {
  const pathname = usePathname() || '';
  if (PRIVATE_PATHS.some((p) => pathname.startsWith(p))) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`}
    </Script>
  );
}
