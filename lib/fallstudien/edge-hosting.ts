import type { Fallstudie } from './typ';

const edgeHosting: Fallstudie = {
  problem: {
    de: 'Öffentlich erreichbare Dienste und der eigene Heim-Verbund gehören nicht ins selbe Netz-Segment. Wird ein exponierter Webdienst übernommen, soll der Angreifer nicht direkt neben der privaten Infrastruktur stehen. Dazu kam, dass ich Mail für meine Domänen nicht dauerhaft einem Drittanbieter-Postfach überlassen wollte. Also ein eigener öffentlicher Server als getrennte Zone, der mehrere Seiten trägt und die Mail selbst übernimmt.',
    en: 'Publicly reachable services and a private home network do not belong in the same network segment: an exposed web service that gets compromised must not stand in the same room as the private infrastructure. At the same time, you do not want to leave mail for your own domains permanently to a third-party mailbox. I wanted a public server that deliberately stands as a separate zone next to the home network, carries several sites under one uniform security posture, and takes over mail for the own domains itself.',
  },
  approach: [
    {
      de: 'Einen eigenen öffentlichen Server (Debian) als getrennte Edge-Zone aufsetzen, abseits des privaten Heim-Segments, damit ein exponierter Dienst nie direkt neben der internen Infrastruktur sitzt.',
      en: 'Stand up a dedicated public server (Debian) as a separate edge zone, deliberately away from the private home segment, so an exposed service never sits right next to the internal infrastructure.',
    },
    {
      de: 'Ein TLS-Reverse-Proxy (Caddy mit automatischem TLS) terminiert alle Domänen und reicht nur lokal an die dahinterliegenden Container weiter, die nach außen keinen eigenen Port öffnen.',
      en: 'A TLS reverse proxy (Caddy with automatic TLS) terminates all domains and forwards only locally to the containers behind it, which open no port of their own to the outside.',
    },
    {
      de: 'Die Dienste laufen mit read-only Dateisystem und gedroppten Rechten; geschrieben wird nur in benannte Volumes. Für alle Sites auf dem Server gilt derselbe Zuschnitt.',
      en: 'The services run hardened: read-only file system, dropped rights, write paths only through clearly named volumes, uniform across every site.',
    },
    {
      de: 'Ein eigener Mailserver (mailcow) übernimmt Versand und Empfang für die eigenen Domänen.',
      en: 'A dedicated mail server (mailcow) takes over sending and receiving for the own domains.',
    },
    {
      de: 'Der Server dient zugleich als Off-Site-Position, räumlich getrennt vom Heim-Verbund.',
      en: 'The server doubles as an off-site position, physically separated from the home network.',
    },
    {
      de: 'Der Edge-Standort wird zum unabhängigen Außenposten: von außerhalb des Heimnetzes prüft ein externer Wächter (Gatus) laufend die öffentliche Erreichbarkeit aller Sites, verifiziert die Off-Site-Backups von einem dritten Ort und hält einen Totmann-Schalter, der über einen heim-unabhängigen Kanal Alarm gibt, falls der Heim-Verbund verstummt.',
      en: 'The edge location doubles as an independent outpost: from outside the home network an external watcher (Gatus) continuously checks the public reachability of all sites, verifies the off-site backups from a third location, and holds a dead-man switch that alerts over a home-independent channel if the home cluster goes quiet.',
    },
  ],
  architecture: {
    summary: {
      de: 'Domänen treffen am öffentlichen Server auf einen TLS-Reverse-Proxy, der sie terminiert und nur lokal an read-only betriebene Container weiterreicht; ein eigener Mailserver trägt Versand und Empfang für die eigenen Domänen. Die ganze Zone steht getrennt vom privaten Heim-Segment und dient zugleich als Off-Site-Position.',
      en: 'At the public server, domains meet a TLS reverse proxy that terminates them and forwards only locally to hardened, read-only containers; a dedicated mail server carries sending and receiving for the own domains, and the whole zone stands deliberately separated from the private home segment as an off-site position.',
    },
    tiers: [
      {
        label: { de: 'Öffentlich', en: 'Public' },
        nodes: [
          {
            id: 'dns',
            kind: 'edge',
            label: { de: 'Domänen', en: 'Domains' },
          },
          {
            id: 'proxy',
            kind: 'edge',
            label: { de: 'TLS-Reverse-Proxy', en: 'TLS reverse proxy' },
            note: { de: 'Caddy · Auto-TLS', en: 'Caddy · auto-TLS' },
          },
        ],
      },
      {
        label: { de: 'Edge-Zone', en: 'Edge zone' },
        nodes: [
          {
            id: 'sites',
            kind: 'core',
            label: { de: 'Site-Container', en: 'Site containers' },
            note: { de: 'read-only · gedroppte Rechte', en: 'read-only · dropped rights' },
          },
          {
            id: 'mail',
            kind: 'core',
            label: { de: 'Eigener Mailserver', en: 'Own mail server' },
            note: { de: 'mailcow · Versand + Empfang', en: 'mailcow · sending + receiving' },
          },
        ],
      },
      {
        label: { de: 'Daten', en: 'Data' },
        nodes: [
          {
            id: 'vol',
            kind: 'data',
            label: { de: 'Volumes', en: 'Volumes' },
            note: { de: 'klar benannte Schreibpfade', en: 'clearly named write paths' },
          },
          {
            id: 'mbox',
            kind: 'data',
            label: { de: 'Postfächer', en: 'Mailboxes' },
          },
        ],
      },
      {
        label: { de: 'Trennung', en: 'Separation' },
        nodes: [
          {
            id: 'isolation',
            kind: 'consumer',
            label: { de: 'Getrennt vom Heim-Segment', en: 'Separated from the home segment' },
            note: { de: 'Off-Site', en: 'off-site' },
          },
        ],
      },
    ],
    flows: [
      {
        from: 'dns',
        to: 'proxy',
        label: { de: 'alle Domänen', en: 'all domains' },
      },
      {
        from: 'proxy',
        to: 'sites',
        label: { de: 'nur lokal', en: 'local only' },
      },
      {
        from: 'sites',
        to: 'vol',
      },
      {
        from: 'mail',
        to: 'mbox',
      },
      {
        from: 'sites',
        to: 'isolation',
        label: { de: 'außerhalb des Heimnetzes', en: 'outside the home network' },
      },
    ],
  },
  result: [
    {
      de: 'Öffentlich erreichbare Dienste laufen in einer getrennten Edge-Zone, nicht im selben Segment wie die private Infrastruktur.',
      en: 'Publicly reachable services run in a deliberately separated edge zone, not in the same segment as the private infrastructure.',
    },
    {
      de: 'Ein TLS-Reverse-Proxy terminiert alle Domänen und reicht nur lokal weiter, die Container öffnen nach außen keinen eigenen Port.',
      en: 'A TLS reverse proxy terminates all domains and forwards only locally; the containers open no port of their own to the outside.',
    },
    {
      de: 'Ein eigener Mailserver trägt Versand und Empfang für die eigenen Domänen.',
      en: 'A dedicated mail server carries sending and receiving for the own domains.',
    },
    {
      de: 'Mehrere Sites teilen denselben gehärteten Unterbau; der Server ist zugleich eine Off-Site-Position abseits des Heim-Verbunds.',
      en: 'Several sites share the same, uniformly hardened substrate; the server also serves as an off-site position away from the home network.',
    },
    {
      de: 'Der Edge-Standort dient zugleich als unabhängiger Außenposten: er überwacht die öffentliche Erreichbarkeit der Sites von außen, verifiziert Backups von einem dritten Ort und meldet über einen heim-unabhängigen Kanal, wenn der Heim-Verbund ausfällt.',
      en: 'The edge location also serves as an independent outpost: it watches the public reachability of the sites from outside, verifies backups from a third location, and reports over a home-independent channel when the home network goes down.',
    },
  ],
  decisions: [
    {
      title: { de: 'Von außen prüfen', en: 'Checking from outside' },
      body: {
        de: 'Eine Überwachung, die im selben Verbund läuft wie das Überwachte, schweigt genau dann, wenn der Verbund ausfällt. Der Edge-Standort steht ohnehin getrennt vom Heimnetz, also übernimmt er die Gegenprobe von außen: Erreichbarkeit der öffentlichen Sites, unabhängige Verifikation der Off-Site-Backups und ein Totmann-Schalter, der über einen heim-unabhängigen Kanal Alarm gibt, wenn von zuhause nichts mehr kommt.',
        en: 'Monitoring that runs inside the same cluster it watches goes silent exactly when that cluster fails. The edge location already stands separate from the home network, so it takes on the counter-check from outside: reachability of the public sites, independent verification of the off-site backups, and a dead-man switch that alerts over a home-independent channel when nothing comes from home anymore.',
      },
    },
    {
      title: { de: 'Warum eine getrennte Zone', en: 'Why a separate zone' },
      body: {
        de: 'Öffentliche Dienste ins Heimnetz zu hängen, hätte einen kompromittierten Webdienst direkt neben die private Infrastruktur gestellt. Ein eigener Server als getrennte Zone zieht diese Grenze in die Topologie, wo eine Firewall-Regel allein sie nur behauptet hätte.',
        en: 'Hanging public services into the home network would have placed a compromised web service right next to the private infrastructure. A dedicated server as a separate zone draws that boundary into the topology, where a firewall rule would only have asserted it.',
      },
    },
    {
      title: {
        de: 'Reverse-Proxy als einziger öffentlicher Punkt',
        en: 'Reverse proxy as the only public point',
      },
      body: {
        de: 'Nur der Proxy terminiert TLS und ist erreichbar, die Container dahinter öffnen keinen eigenen Port nach außen. Es gibt genau eine kontrollierte Eintrittsstelle.',
        en: 'Only the proxy terminates TLS and is reachable; the containers behind it open no port of their own to the outside. There is exactly one controlled entry point.',
      },
    },
    {
      title: {
        de: 'Eigener Mailserver für die eigenen Domänen',
        en: 'Own mail server for the own domains',
      },
      body: {
        de: 'Mail dauerhaft einem Fremd-Postfach zu überlassen, gibt Kontrolle und Daten aus der Hand. Ein eigener Mailserver (mailcow) auf dem Edge-Host hält Versand und Empfang der eigenen Domänen im eigenen Betrieb.',
        en: 'Leaving mail permanently to a third-party mailbox gives control and data out of your hands. A dedicated mail server (mailcow) on the edge host keeps sending and receiving of the own domains under my own operation.',
      },
    },
  ],
  metrics: [
    {
      label: { de: 'Zone', en: 'Zone' },
      value: { de: 'getrennt vom Heim-Segment', en: 'separated from the home segment' },
    },
    {
      label: { de: 'Öffentlicher Eintritt', en: 'Public entry' },
      value: { de: 'nur TLS-Reverse-Proxy', en: 'TLS reverse proxy only' },
    },
    {
      label: { de: 'Mail', en: 'Mail' },
      value: { de: 'eigener Server, eigene Domänen', en: 'own server, own domains' },
    },
    {
      label: { de: 'Container', en: 'Containers' },
      value: { de: 'read-only, gedroppte Rechte', en: 'read-only, dropped rights' },
    },
  ],
  timeline: [
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Öffentlicher Server als getrennte Edge-Zone provisioniert, TLS-Reverse-Proxy davor',
        en: 'Public server provisioned as a separate edge zone, TLS reverse proxy in front',
      },
    },
    {
      when: { de: '2026 H1', en: '2026 H1' },
      what: {
        de: 'Erste Sites gehärtet umgezogen, eigener Mailserver für die eigenen Domänen',
        en: 'First sites migrated hardened, own mail server for the own domains',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Weitere Sites auf denselben Unterbau, Off-Site-Rolle gefestigt',
        en: 'Further sites onto the same substrate, off-site role solidified',
      },
    },
    {
      when: { de: '2026 H2', en: '2026 H2' },
      what: {
        de: 'Edge-Standort zum unabhängigen Außenposten ausgebaut: externer Erreichbarkeits-Wächter, Backup-Verifikation von außen und Totmann-Schalter',
        en: 'Edge location built out into an independent outpost: external reachability watcher, backup verification from outside, and a dead-man switch',
      },
    },
  ],
};

export default edgeHosting;
