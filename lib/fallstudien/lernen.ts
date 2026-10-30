import type { Fallstudie } from './typ';

const lernen: Fallstudie = {
  problem: {
    de: 'Lernplattformen am Markt sind generisch, entweder LMS-Schwergewichte oder Karteikarten-Apps. Beides passt nicht für jemanden, der über mehrere Domänen gleichzeitig lernt: IT-Zertifikate, Fahrschule, Schulstoff, Allgemeinbildung. Jede Domäne hat eigene Logik, eigene Visualisierungen, eigenes Tempo.',
    en: 'Learning platforms on the market are generic: either LMS heavyweights or flashcard apps. Neither fits someone learning across several domains at once: IT certifications, driving school, school material, general knowledge. Each domain has its own logic, its own visualizations, its own pace.',
  },
  approach: [
    {
      de: 'Sechs eigenständige Next.js-Apps, keine Monolith-Plattform. Jede hat ihre eigene, in die App eingebettete SQLite-Datenbank (better-sqlite3), ihr eigenes Theme und ihr eigenes Auth. Eine Änderung an einer App berührt die anderen fünf nicht.',
      en: 'Six standalone Next.js apps, not one monolith. Each has its own SQLite database embedded in the app (better-sqlite3), its own theme, its own auth; what does not belong together does not get built together.',
    },
    {
      de: 'Geteilte Web-Bausteine über ein Design-System (`design-system`), Tailwind-Tokens + Compose-Tokens werden in alle Apps synchronisiert, nicht copy-pasted.',
      en: 'Shared web building blocks through a design system (`design-system`); Tailwind and Compose tokens are synced into every app, never copy-pasted.',
    },
    {
      de: 'Drei Pilot-Apps nativ für Android über Compose Multiplatform mit Hilt-Dependency-Injection und Custom-Tab-Login.',
      en: 'Three pilot apps native on Android via Compose Multiplatform, with Hilt dependency injection and Custom-Tab login.',
    },
    {
      de: 'Ein Hub als Karten-Dashboard, der die Apps bündelt, auch das ein eigener Stack, kein Wrapper.',
      en: 'A hub as a card dashboard that ties the apps together, its own stack too, not a wrapper.',
    },
  ],
  architecture: {
    summary: {
      de: 'Hub, sechs Web-Apps und die Android-Piloten teilen sich ein Design-System und die Lernlogik über Sync-Skripte, laufen aber je App vollständig isoliert mit eigener Datenbank, eigenem Auth und eigenem Theme, geteilt wird, was geteilt gehört, getrennt der Rest.',
      en: 'Hub, six web apps and the Android pilots share a design system and the learning logic through sync scripts, but each app runs fully isolated with its own database, auth and theme. Share what should be shared, keep the rest apart.',
    },
    tiers: [
      {
        label: { de: 'Zugänge', en: 'Entry points' },
        nodes: [
          {
            id: 'hub',
            kind: 'edge',
            label: { de: 'Hub', en: 'Hub' },
            note: { de: 'Karten-Dashboard', en: 'card dashboard' },
          },
          {
            id: 'web',
            kind: 'edge',
            label: { de: 'Sechs Web-Apps', en: 'Six web apps' },
          },
          {
            id: 'android',
            kind: 'edge',
            label: { de: 'Android-Piloten', en: 'Android pilots' },
          },
        ],
      },
      {
        label: { de: 'Geteilte Bausteine', en: 'Shared building blocks' },
        nodes: [
          {
            id: 'design',
            kind: 'core',
            label: { de: 'Design-System', en: 'Design system' },
            note: { de: 'Web- + Compose-Tokens', en: 'web + Compose tokens' },
          },
          {
            id: 'logic',
            kind: 'core',
            label: { de: 'Lernlogik', en: 'Learning logic' },
          },
          {
            id: 'sync',
            kind: 'core',
            label: { de: 'Sync-Skripte', en: 'Sync scripts' },
            note: { de: 'kein copy-paste', en: 'no copy-paste' },
          },
        ],
      },
      {
        label: { de: 'Pro App isoliert', en: 'Per app isolated' },
        nodes: [
          {
            id: 'db',
            kind: 'data',
            label: { de: 'Eigene Datenbank', en: 'Own database' },
            note: { de: 'SQLite, pro App', en: 'SQLite, per app' },
          },
          {
            id: 'auth',
            kind: 'data',
            label: { de: 'Eigenes Auth', en: 'Own auth' },
          },
          {
            id: 'theme',
            kind: 'data',
            label: { de: 'Eigenes Theme', en: 'Own theme' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'design',
        to: 'web',
        label: { de: 'synchronisiert', en: 'synced' },
      },
      {
        from: 'design',
        to: 'android',
        label: { de: 'Compose-Tokens', en: 'Compose tokens' },
      },
      {
        from: 'web',
        to: 'db',
        label: { de: 'pro App getrennt', en: 'separate per app' },
      },
    ],
  },
  result: [
    {
      de: 'Sechs Apps live auf einem geteilten Kern; wo noch keine Inhalte vorliegen, steht das auch so da. Der frühere Monolith ist dafür stillgelegt.',
      en: 'Six apps live on a shared core, with honest empty states everywhere; an earlier monolith was retired in favor of the split apps.',
    },
    {
      de: 'Ein Prüfungssimulator zieht aus domänen-spezifischen Fragen-Pools echte Mock-Prüfungen mit Auswertung nach Themengebiet, ohne eine starre Fragenliste abzuspulen.',
      en: 'An exam simulator pulls real mock exams from domain-specific question pools and grades them per topic, without grinding through a fixed list.',
    },
    {
      de: 'Eine Abo- und Freischalt-Logik trennt Gratis von Premium pro App, inklusive Ablauf-Downgrade und Schutz gegen doppelte Freischaltung.',
      en: 'Subscription and entitlement logic separates free from premium per app, including expiry downgrade and protection against double redemption.',
    },
    {
      de: 'Native Android-Builds für die Apps, mit eigenem Passwort-Login im geteilten Kern, ohne Zwang zu einer Fremd-Anmeldung.',
      en: 'Native Android builds for the apps, with their own password login in the shared core, so nobody is forced into a third-party sign-in.',
    },
  ],
  decisions: [
    {
      title: { de: 'Warum sechs Apps', en: 'Why six apps' },
      body: {
        de: 'Plugins, Module und Rollen in einer Monolith-Plattform tragen ihren eigenen Overhead. Ein gemeinsames Datenmodell hätte bedeutet, dass eine Schema-Änderung für eine Prüfung alle sechs anfasst. Sechs schlanke Apps mit geteiltem Design-System sind mir das wert, der ursprüngliche Monolith ist dafür weg.',
        en: 'Plugins, modules and roles inside a monolith carry their own overhead. Six lean apps on a shared design system are cheaper in the long run than one shared data model that gets in every domain\'s way; the original monolith was deliberately given up for it.',
      },
    },
    {
      title: {
        de: 'Prüfungssimulator aus Fragen-Pools',
        en: 'An exam simulator from pools, not a fixed list',
      },
      body: {
        de: 'Eine echte Prüfungssimulation braucht wechselnde Fragen, nach Themengebiet gewichtet. Die Fragen liegen in domänen-spezifischen Pools, aus denen pro Durchlauf eine frische Auswahl gezogen und am Ende nach Gebieten ausgewertet wird.',
        en: 'A real exam simulation needs rotating questions weighted by topic. The questions sit in domain-specific pools; each run draws a fresh selection and grades it by topic at the end.',
      },
    },
    {
      title: { de: 'Freischaltung als geprüfter Anspruch', en: 'Entitlement as a verified claim' },
      body: {
        de: 'Premium wird nicht als Flag gesetzt, sondern als überprüfter Anspruch mit Ablauf und Schutz gegen doppelte oder fremde Freischaltung modelliert, damit der Zugang sauber bleibt, auch wenn ein Abo endet.',
        en: 'Premium is not a flag but a verified claim with an expiry and protection against double or foreign redemption, so access stays clean even after a subscription ends.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Web-Apps', en: 'Web apps' },
      value: { de: '6 live auf einem Kern', en: '6 live on one core' },
    },
    {
      label: { de: 'Android', en: 'Android' },
      value: { de: 'native Builds mit Passwort-Login', en: 'native builds with password login' },
    },
    {
      label: { de: 'Prüfungssimulator', en: 'Exam simulator' },
      value: { de: 'aus Pools, nach Gebiet ausgewertet', en: 'from pools, graded by topic' },
    },
  ],
  timeline: [
    {
      when: { de: '2025', en: '2025' },
      what: {
        de: 'Erste Web-Apps, Design-System aufgesetzt',
        en: 'First web apps, design system set up',
      },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Sechs Apps live, Monolith abgelöst, native Android-Builds',
        en: 'Six apps live, monolith retired, native Android builds',
      },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Prüfungssimulator und Abo-/Freischalt-Logik über die Apps gezogen',
        en: 'Exam simulator and subscription logic pulled across the apps',
      },
    },
  ],
};

export default lernen;
