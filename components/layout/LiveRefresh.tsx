'use client';

// components/layout/LiveRefresh.tsx
// Keeps open tabs up to date: listens to Sanity for published content
// changes and re-renders the current page with fresh data, so visitors see
// new news/events/etc. without refreshing. Renders nothing.
//
// The pages themselves are rebuilt by the Sanity webhook hitting
// app/api/revalidate/route.ts; this waits a moment for that to finish
// before refreshing. Needs the site's address listed under CORS origins in
// sanity.io/manage (no credentials needed) or the browser can't connect.

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { client } from '@/sanity/lib/client';

// Long enough for the webhook to land and the page to be rebuilt; changes
// that arrive close together (e.g. publishing several docs) share one refresh.
const REFRESH_DELAY_MS = 3000;

export default function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Published documents only — drafts being edited in Studio don't change
    // the public site, so they shouldn't trigger refreshes.
    const subscription = client
      .listen('*[!(_id in path("drafts.**"))]', {}, { includeResult: false, visibility: 'query' })
      .subscribe({
        next: (event) => {
          if (event.type !== 'mutation') return;
          clearTimeout(timer);
          timer = setTimeout(() => router.refresh(), REFRESH_DELAY_MS);
        },
        // Network hiccups, blocked CORS origin, etc. — the site still works,
        // it just falls back to showing changes on the next page load.
        error: (err) => console.warn('Live content updates unavailable:', err),
      });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
