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
            // ⚠️ Wirksam ist dieser Header NICHT: der `djouhri.de`-Block in der
            // Caddyfile auf dem Edge-Server setzt Strict-Transport-Security selbst
            // und überschreibt ihn. Beide Werte werden deshalb gleich gehalten
            // (2 Jahre, includeSubDomains) — wer hier ändert, muss auch Caddy
            // ändern, sonst driften Code und Auslieferung auseinander.
            // Bewusst OHNE `preload`: die Aufnahme in die Browser-Preload-Liste
            // ist praktisch unumkehrbar und bindet alle *.djouhri.de dauerhaft an
            // HTTPS. Solange die Einreichung bei hstspreload.org nicht ansteht,
            // wäre die Direktive eine Absichtserklärung ohne Wirkung.
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
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
