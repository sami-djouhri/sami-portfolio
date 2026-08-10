/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            // 2 Jahre + preload: Voraussetzung für die Aufnahme in die Browser-
            // HSTS-Preload-Liste (hstspreload.org). includeSubDomains gilt damit
            // für alle *.djouhri.de — alle Subdomains (mail/status/analytics)
            // laufen bereits ausschließlich über HTTPS.
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
      {
        // Statische Build-Zeit-Screenshots (public/previews) sind unveränderlich
        // pro Deploy; Next serviert public/ sonst mit max-age=0. Lang + immutable
        // cachen (neue Screenshots kommen mit neuem Deploy, nicht per URL-Änderung).
        source: '/previews/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/.well-known/security.txt',
        destination: '/security.txt',
        permanent: true,
      },
      // Seiten-Merge: /now + /aktuell -> /jetzt, /stack + /uses + /stats -> /toolbox.
      { source: '/now', destination: '/jetzt', permanent: true },
      { source: '/aktuell', destination: '/jetzt', permanent: true },
      { source: '/stack', destination: '/toolbox', permanent: true },
      { source: '/uses', destination: '/toolbox', permanent: true },
      { source: '/stats', destination: '/toolbox', permanent: true },
    ];
  },
};

export default nextConfig;
