/**
 * ZWEI Bauarten aus einem Baum (seit 2026-10-30, Fragerunde „statisch ausliefern").
 *
 * - Vorgabe: `output: 'export'`. Die oeffentliche Seite als fertige Dateien in
 *   `out/`, ausgeliefert von Caddy auf netcup. Keine Node-Laufzeit vor den Seiten.
 * - `BAU=dienst`: der Restdienst (`standalone`) fuer `/api/*` und den Posteingang.
 *   Nur in dieser Bauart gibt es die Dateien mit der Endung `.dienst.ts(x)`
 *   (API-Routen, Verwaltung, `proxy.dienst.ts`): `pageExtensions` nimmt sie nur
 *   hier auf. Im Export existieren sie fuer Next schlicht nicht, sonst bricht der
 *   Export an jeder dynamischen Route ab.
 *
 * ⚠️ `headers()` und `redirects()` unten wirken im Export NICHT (Next warnt beim
 * Bau). Sie sind trotzdem die eine Quelle: `scripts/caddy-block.mjs` liest beide
 * und erzeugt daraus den Caddy-Block. Wer hier eine Kopfzeile aendert, erzeugt den
 * Block neu, statt sie in Caddy von Hand nachzutragen.
 */
const DIENST = process.env.BAU === 'dienst';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: DIENST ? 'standalone' : 'export',
  ...(DIENST ? { pageExtensions: ['dienst.tsx', 'dienst.ts', 'tsx', 'ts'] } : {}),
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
            // `interest-cohort=()` stand hier bis 2026-09-17 und ist ersatzlos
            // entfallen. Es war der Riegel gegen FLoC, und FLoC hat Google im
            // Januar 2022 eingestellt; kein heutiger Browser kennt das Feature
            // noch. Ein Header, der gegen etwas Abgeschafftes schuetzt, sieht
            // nach Sorgfalt aus und leistet nichts, und beim naechsten Leser
            // kostet er die Zeit, das erst nachzuschlagen.
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            // ⚠️ Wirksam ist dieser Header NICHT: der `djouhri.de`-Block in der
            // Caddyfile auf dem Edge-Server setzt Strict-Transport-Security selbst
            // und überschreibt ihn. Beide Werte werden deshalb gleich gehalten
            // (2 Jahre, includeSubDomains), wer hier ändert, muss auch Caddy
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
      // Seiten-Merge: /stack + /uses + /stats -> /toolbox.
      { source: '/stack', destination: '/toolbox', permanent: true },
      { source: '/uses', destination: '/toolbox', permanent: true },
      { source: '/stats', destination: '/toolbox', permanent: true },

      // ── Abbau vom 2026-10-15: Logbuch und Aktueller Fokus ────────────────
      // Beide Rubriken sind entfallen (Entscheid 06.10.). Ziel ist die
      // Werkliste und nicht die Startseite: die fünf Vorfälle ziehen in die
      // technische Ebene ihres Dienstes, dort landet der Leser also näher an
      // dem, was er suchte.
      //
      // Diese Regeln greifen VOR dem Proxy (`proxy.ts`). Gemessen am
      // Bestandsfall `/now`, der mit 308 auf `/jetzt` antwortete, statt vom
      // Proxy auf `/de/now` geschoben zu werden. Deshalb stehen hier auch die
      // präfixierten Adressen, und deshalb ist die Reihenfolge Redirect → Proxy
      // und nicht umgekehrt. Wer das ändert, misst mit `curl -L` die Zahl der
      // Sprünge nach, nicht nur den Statuscode.
      { source: '/de/notizen', destination: '/de/projekte', permanent: true },
      { source: '/de/notizen/:slug', destination: '/de/projekte', permanent: true },
      { source: '/en/notes', destination: '/en/projects', permanent: true },
      { source: '/en/notes/:slug', destination: '/en/projects', permanent: true },
      { source: '/de/jetzt', destination: '/de/projekte', permanent: true },
      { source: '/en/now', destination: '/en/projects', permanent: true },
      // Die beiden unpräfixierten Altadressen zeigten bis hierher auf `/jetzt`.
      { source: '/now', destination: '/de/projekte', permanent: true },
      { source: '/aktuell', destination: '/de/projekte', permanent: true },
      { source: '/notizen', destination: '/de/projekte', permanent: true },

      // ── Übernahme vom 2026-10-21: der Entwurf IST die Startseite ──────────
      // Die Werkfeld-Fassung lag seit dem 15.10. unter `/entwurf`, damit der
      // Owner sie am Telefon am laufenden Dienst beurteilen konnte, ohne dass
      // die echte Startseite davon berührt war. Er hat sie gesehen und
      // freigegeben, also ist sie jetzt `/`.
      //
      // Die Adresse bekommt eine Weiterleitung und wird nicht einfach zur
      // 404: sie war einen knappen Monat lang der Ort, an dem die Arbeit zu
      // sehen war, sie steht in der Offen-Liste des Owners und damit
      // wahrscheinlich in seinem Verlauf. Ziel ist hier die Startseite selbst
      // und nicht die Werkliste, denn der Inhalt ist nicht entfallen, er ist
      // umgezogen.
      { source: '/de/entwurf', destination: '/de', permanent: true },
      { source: '/en/entwurf', destination: '/en', permanent: true },
      { source: '/entwurf', destination: '/de', permanent: true },
    ];
  },
};

export default nextConfig;
