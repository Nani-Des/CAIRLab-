import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Lets the dev server accept requests from a phone on the same network
  // (e.g. testing via a mobile hotspot at 172.20.10.2:3000) instead of
  // blocking them as a cross-origin request. Add more IPs here if you test
  // from other devices/networks later.
  allowedDevOrigins: ['172.20.10.2'],

  // Baseline security headers on every response. Deliberately not adding a
  // Content-Security-Policy here — Sanity Studio (embedded at /studio)
  // relies on inline scripts/styles it controls itself, and a CSP strict
  // enough to matter risks breaking Studio in ways that are easy to miss
  // in testing. Add one later as a deliberate, tested step if you want it.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
