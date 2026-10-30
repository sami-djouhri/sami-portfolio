import type { Fallstudie } from './typ';

const cmsBaukasten: Fallstudie = {
  problem: {
    de: 'Kleine Websites brauchen ein Content-Management, aber ein schwergewichtiges Fremd-CMS ist für eine simple Seite überdimensioniert: ständige Updates, große Angriffsfläche, am Ende mehr Plugin als Inhalt. Jede Seite neu aufzusetzen ist aber auch keine Lösung. Gesucht war eine eigene, schlanke Grundlage, auf der sich Inhalte bequem pflegen lassen und bei der eine neue Seite vor allem eine Konfigurations-Frage ist.',
    en: 'Small websites need content management, but a heavyweight third-party CMS is oversized for a simple site: constant updates, a large attack surface, more plugin than content. At the same time, you do not want to set up every small site anew. What was needed was an own, deliberately lean foundation: enough to maintain content comfortably, and cut so a new site is essentially a configuration question.',
  },
  approach: [
    {
      de: 'Ein eigenes, schlankes CMS (PHP hinter Apache, MySQL-Datenbank) dient als Vorlage. Drin ist nur, was eine kleine Inhalts-Seite wirklich braucht, dafür verständlich und wartbar.',
      en: 'A dedicated, lean CMS (PHP behind Apache, MySQL database) serves as the template. It holds only the building blocks a small content site really needs, and those are understandable and maintainable.',
    },
    {
      de: 'Eine Pflege-Oberfläche, die ausschließlich aus dem eigenen Netz erreichbar ist; am öffentlichen Rand wird der Admin-Pfad hart abgewiesen, und ein Passwort ist nicht die einzige Hürde.',
      en: 'A care interface reachable only from my own network; at the public edge the admin path is hard-rejected, so a password is not the only hurdle.',
    },
    {
      de: 'Der öffentliche Teil liest aus einem eigenen Datenspeicher und wird schnell und statisch ausgeliefert, getrennt vom schreibenden Admin-Pfad.',
      en: 'The public part reads from a dedicated data store and is served fast and statically, separated from the writing admin path.',
    },
    {
      de: 'Feature-Module (Kontaktformular, Newsletter, Einwilligung, Impressum/Datenschutz) werden pro Seite nur aktiviert, wenn sie gebraucht werden; der Modul-Loader ist gegen Pfad-Tricks gehärtet, sodass jede Seite nur trägt, was sie wirklich braucht.',
      en: 'Feature modules (contact form, newsletter, consent, imprint/privacy) are activated per site only when needed; the module loader is hardened against path tricks, so each page carries only what it truly needs.',
    },
    {
      de: 'Neben der händischen Pflege können Artikel über eine token-authentifizierte Ingest-Schnittstelle automatisch eingespielt werden, so speist etwa ein Blog-Generator Beiträge ein, ohne dass jemand den Admin öffnet.',
      en: 'Beyond manual maintenance, articles can be ingested automatically over a token-authenticated ingest interface, so a blog generator, for one, feeds posts in without anyone opening the admin.',
    },
    {
      de: 'Abgesichert durch eine eigene, schlanke Test-Harness: schnelle Unit-Tests ohne Datenbank, dazu Integrationstests gegen eine Wegwerf-Datenbank.',
      en: 'Backed by a dedicated, lean test harness: fast unit tests without a database plus integration tests against a throwaway database, in place of a heavy test framework.',
    },
    {
      de: 'Eine erste Seite läuft bereits auf dieser Grundlage, eine zweite erbt inzwischen dasselbe Image; daraus wird die Vorlage so verallgemeinert, dass weitere Seiten dieselbe Basis erben.',
      en: 'A first site already runs on this foundation and a second now inherits the same image; from there the template is generalized so further sites inherit the same base.',
    },
  ],
  architecture: {
    summary: {
      de: 'Besucher erreichen nur den öffentlichen, statisch ausgelieferten Teil, der aus einem eigenen Datenspeicher liest; die schreibende Pflege-Oberfläche ist ausschließlich aus dem eigenen Netz erreichbar und wird am öffentlichen Rand hart abgewiesen, sodass dieselbe Vorlage über mehrere Seiten getragen werden kann.',
      en: 'Visitors reach only the public, statically served part, which reads from a dedicated data store; the writing care interface is reachable only from my own network and is hard-rejected at the public edge, so the same template can be carried across multiple sites.',
    },
    tiers: [
      {
        label: { de: 'Öffentlich', en: 'Public' },
        nodes: [
          {
            id: 'edge',
            kind: 'edge',
            label: { de: 'Reverse-Proxy', en: 'Reverse proxy' },
            note: { de: 'Admin-Pfad abgewiesen', en: 'admin path rejected' },
          },
          {
            id: 'public',
            kind: 'edge',
            label: { de: 'Öffentliche Seite', en: 'Public site' },
            note: { de: 'statisch ausgeliefert', en: 'statically delivered' },
          },
        ],
      },
      {
        label: { de: 'CMS-Kern', en: 'CMS core' },
        nodes: [
          {
            id: 'render',
            kind: 'core',
            label: { de: 'Ausliefer-Schicht', en: 'Delivery layer' },
            note: { de: 'liest Inhalte', en: 'reads content' },
          },
          {
            id: 'admin',
            kind: 'core',
            label: { de: 'Pflege-Oberfläche', en: 'Care interface' },
            note: { de: 'nur eigenes Netz', en: 'own network only' },
          },
        ],
      },
      {
        label: { de: 'Daten', en: 'Data' },
        nodes: [
          {
            id: 'store',
            kind: 'data',
            label: { de: 'Inhalts-Speicher', en: 'Content store' },
          },
          {
            id: 'media',
            kind: 'data',
            label: { de: 'Medien', en: 'Media' },
          },
        ],
      },
      {
        label: { de: 'Weitere Seiten', en: 'Further sites' },
        nodes: [
          {
            id: 'tenant',
            kind: 'consumer',
            label: { de: 'Weitere Seiten', en: 'Further sites' },
            note: { de: 'erben die Vorlage', en: 'inherit the template' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'edge',
        to: 'public',
        label: { de: 'nur öffentlich', en: 'public only' },
      },
      {
        from: 'public',
        to: 'render',
      },
      {
        from: 'render',
        to: 'store',
        label: { de: 'lesend', en: 'reading' },
      },
      {
        from: 'admin',
        to: 'store',
        label: { de: 'schreibend, intern', en: 'writing, internal' },
      },
      {
        from: 'store',
        to: 'tenant',
        label: { de: 'Vorlage geerbt', en: 'template inherited' },
      },
    ],
  },
  result: [
    {
      de: 'Eine eigene, schlanke CMS-Grundlage trägt bereits zwei eigene Seiten auf einem geteilten Image.',
      en: 'A dedicated, lean CMS foundation already carries two live sites on a shared image.',
    },
    {
      de: 'Die Pflege-Oberfläche ist nur aus dem eigenen Netz erreichbar, der Admin-Pfad wird am öffentlichen Rand hart abgewiesen.',
      en: 'The care interface is reachable only from my own network; the admin path is hard-rejected at the public edge.',
    },
    {
      de: 'Der öffentliche Teil bleibt schnell und statisch, der schreibende Pfad ist davon getrennt.',
      en: 'The public part stays fast and static, with the writing path separated from it.',
    },
    {
      de: 'Die Vorlage ist so geschnitten, dass eine neue Seite die Basis einfach erbt.',
      en: 'The template is cut so a new site simply inherits the base.',
    },
  ],
  decisions: [
    {
      title: { de: 'Warum ein eigenes, schlankes CMS', en: 'Why a lean CMS of my own' },
      body: {
        de: 'Für eine kleine Inhalts-Seite ist ein großes Fremd-CMS mehr Angriffsfläche und Update-Last als Nutzen. Eine eigene, verständliche Grundlage kann genau das Nötige und bleibt wartbar.',
        en: 'For a small content site, a large third-party CMS is more attack surface and update burden than benefit. A dedicated, understandable foundation does exactly what is needed and stays maintainable.',
      },
    },
    {
      title: { de: 'Admin nur im eigenen Netz', en: 'Admin only in my own network' },
      body: {
        de: 'Eine öffentlich erreichbare Admin-Oberfläche ist ein Dauerziel. Den Pflege-Pfad schon am Rand komplett abzuweisen nimmt die Angriffsfläche von vornherein heraus. Ein Passwort allein hätte sie nur verkleinert.',
        en: 'A publicly reachable admin interface is a standing target. Rejecting the care path entirely at the edge removes the attack surface from the outset. A password alone would only have narrowed it.',
      },
    },
    {
      title: {
        de: 'Als Vorlage gebaut, nicht als Einzelstück',
        en: 'Built as a template, not a one-off',
      },
      body: {
        de: 'Die erste Seite ist zugleich die Blaupause: was sich verallgemeinern lässt, wird zur Vorlage, damit die nächste Seite dieselbe Basis erbt.',
        en: 'The first site is also the blueprint: what can be generalized becomes the template, so the next site inherits the same base.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Basis', en: 'Base' },
      value: { de: 'eigenes CMS · PHP · Apache · MySQL', en: 'own CMS · PHP · Apache · MySQL' },
    },
    {
      label: { de: 'Admin-Zugang', en: 'Admin access' },
      value: { de: 'nur eigenes Netz', en: 'own network only' },
    },
    {
      label: { de: 'Auslieferung', en: 'Delivery' },
      value: { de: 'öffentlich statisch', en: 'public static' },
    },
    {
      label: { de: 'Ziel', en: 'Goal' },
      value: { de: 'Vorlage für weitere Seiten', en: 'template for further sites' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Schlankes Eigen-CMS gebaut, erste eigene Seite darauf umgestellt',
        en: 'Lean own CMS built, first live site migrated onto it',
      },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Admin auf das eigene Netz beschränkt, öffentlicher Teil statisch getrennt',
        en: 'Admin restricted to my own network, public part split off statically',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Verallgemeinerung zur wiederverwendbaren Vorlage',
        en: 'Generalization into a reusable template',
      },
    },
  ],
};

export default cmsBaukasten;
