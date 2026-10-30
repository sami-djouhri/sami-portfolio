import type { FallstudieAlt } from './typ';

// UEBERGANG (Umbau 2026-10-30): die englische Fassung beschreibt eine andere
// Arbeit als die deutsche und laesst sich nicht Eintrag fuer Eintrag zuordnen.
// Sie bleibt deshalb unveraendert als eigener Block stehen, bis die Arbeit neu
// erhoben ist. Dann wird diese Datei in die gepaarte Form umgeschrieben.
// Gemessen beim Umbau: approach 5/4; Ebene 0: map/core/true,drift/core/true <> tunnel/edge/true,vpn/edge/true; Ebene 1: proxy/edge/false,core/core/false,apps/consumer/false,mgmt/core/true <> map/core/true,spine/core/true,kg/core/true,rules/core/true; Ebene 2: spine/core/true,rules/core/true <> apps/consumer/false,ai/consumer/true,edge/consumer/false; Ebene 3: backup/data/false,drill/data/true <> mon/data/true,backup/data/true,vault/data/false; Pfeile: map>drift/true,drift>core/true,proxy>apps/true,core>spine/false,spine>rules/true,backup>drill/true <> tunnel>apps/true,map>apps/true,spine>rules/true,ai>mon/true
const homelab: FallstudieAlt = {
  form: 'uebergang',
  de: {
    problem: 'In einem Heimlabor sammeln sich schnell dreißig Container an, jeder mit eigener Compose-Datei, ohne gemeinsame Liste, ohne Härtung, ohne Sicherung. Danach kann niemand mehr sagen, was gerade läuft. Hier ist deshalb eine Dienst-Liste die einzige Quelle, dazu kommen getrennte Netze, Härtung in Etappen und eine Sicherung, die regelmässig zurückgespielt wird.',
    approach: [
      'Eine Dienst-Liste ist die einzige Quelle. Jeder neue Dienst geht zuerst dort hinein. Stündlich wird geprüft, ob die Wirte noch dazu passen.',
      'Härtung in Etappen, jede dokumentiert. Dateisystem nur lesbar, Rechte entzogen, keine Rechteerhöhung, eigene Benutzer je Dienst. Ausnahmen stehen mit Begründung in der Liste.',
      'Vier Netzzonen mit klaren Regeln, wer wen sieht. Kein Dienst greift direkt auf den Docker-Socket zu, dazwischen steht immer ein Vermittler.',
      'Meldungen laufen alle über denselben Weg. Mehrere Dienste schreiben auf einen gemeinsamen Nachrichtenbus, ein Regelwerk entscheidet, was mich erreicht, und unterdrückt Wiederholungen.',
      'Gesichert wird verschlüsselt ausser Haus. Zehn Wirte spielen jede Woche eine Sicherung testweise zurück, an verteilten Tagen, damit sich die Läufe nicht in die Quere kommen.',
    ],
    architecture: {
      summary: 'Eine versionierte Dienst-Liste ist die Quelle für alles: daraus werden Wirte, Zonen und Erwartungen abgeleitet und stündlich gegengeprüft. Die Dienste liegen in vier Netzzonen und erreichen den Docker-Socket nur über Vermittler. Meldungen laufen über einen gemeinsamen Nachrichtenbus an ein Regelwerk, das entscheidet, was ans Telefon geht. Gesichert wird verschlüsselt ausser Haus, mit wöchentlicher Rückspielprobe.',
      tiers: [
        {
          label: 'Quelle',
          nodes: [
            {
              id: 'map',
              label: 'Dienst-Liste',
              note: 'versioniert, einzige Quelle',
              kind: 'core',
            },
            {
              id: 'drift',
              label: 'Abgleich',
              note: 'stündlich gegen die Wirte',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Netzzonen',
          nodes: [
            {
              id: 'proxy',
              label: 'Eingang',
              kind: 'edge',
            },
            {
              id: 'core',
              label: 'Kern',
              kind: 'core',
            },
            {
              id: 'apps',
              label: 'Anwendungen & Shops',
              kind: 'consumer',
            },
            {
              id: 'mgmt',
              label: 'Verwaltung',
              note: 'nur über Vermittler',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Meldewege',
          nodes: [
            {
              id: 'spine',
              label: 'Nachrichtenbus',
              note: 'mehrere Absender',
              kind: 'core',
            },
            {
              id: 'rules',
              label: 'Regelwerk',
              note: 'entscheidet, was ankommt',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Sicherung',
          nodes: [
            {
              id: 'backup',
              label: 'Verschlüsselt ausser Haus',
              kind: 'data',
            },
            {
              id: 'drill',
              label: 'Rückspielprobe',
              note: 'wöchentlich je Wirt',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'map',
          to: 'drift',
          label: 'Soll',
        },
        {
          from: 'drift',
          to: 'core',
          label: 'gemessen',
        },
        {
          from: 'proxy',
          to: 'apps',
          label: 'von außen',
        },
        {
          from: 'core',
          to: 'spine',
        },
        {
          from: 'spine',
          to: 'rules',
          label: 'Absender → Regel',
        },
        {
          from: 'backup',
          to: 'drill',
          label: 'wird zurückgespielt',
        },
      ],
    },
    result: [
      'Die Dienste laufen über mehrere Wirte und werden gegen die Liste gemessen. Die dritte Härtungs-Etappe ist durch.',
      'Neben den kleinen Einplatinen-Rechnern steht inzwischen ein kleiner x86-Cluster. Mehrere KI-Dienste sind dorthin umgezogen, und die Liste blieb dabei die Quelle, gegen die gemessen wird.',
      'Eine Suche greift auf sieben Wissensquellen im Haus zu. Eine aktive Probe meldet öffentliche Adressen, die ausfallen, bevor es jemand merkt.',
      'Die Sicherung liegt verschlüsselt ausser Haus. Zehn Wirte spielen sie jede Woche testweise zurück, der Wiederanlauf steht schriftlich mit Zeitvorgaben.',
    ],
    decisions: [
      {
        title: 'Kein Service-Mesh',
        body: 'Für ein Heimnetz ist das zu viel Maschinerie. Reverse-Proxy, Tunnel, VPN und getrennte Netze reichen aus, und ich kann jedes davon einzeln erklären.',
      },
      {
        title: 'Härtung in Etappen statt auf einmal',
        body: 'Jede Etappe nimmt sich eine klar abgegrenzte Gruppe von Diensten vor. Dauerhafte Ausnahmen, etwa bei Images, die sich nicht anders betreiben lassen, stehen dokumentiert in der Liste.',
      },
      {
        title: 'Ein Weg für alle Meldungen',
        body: 'Jedem Dienst eigene Benachrichtigungen beizubringen, hätte sich nicht gelohnt. Alles läuft über denselben Bus an ein Regelwerk. Wiederholungen und Ruhezeiten sind damit an einer Stelle einstellbar.',
      },
    ],
    metrics: [
      {
        label: 'Rückspielprobe',
        value: '10 Wirte, jede Woche',
      },
      {
        label: 'Härtungs-Etappen',
        value: '3 abgeschlossen',
      },
      {
        label: 'Wirte',
        value: 'Steuerung · Öffentlich · KI · Edge · 3 x86',
      },
    ],
    timeline: [
      {
        when: '2024',
        what: 'Erste Rechner, erste Container',
      },
      {
        when: '2025',
        what: 'Dienst-Liste, Härtung Etappe 1 und 2, Netzzonen',
      },
      {
        when: '2026 H1',
        what: 'Etappe 3, gemeinsamer Meldeweg, Wissenssuche, aktive Probe von außen',
      },
      {
        when: '2026 H1',
        what: 'x86-Cluster dazu, KI-Dienste verlagert',
      },
      {
        when: '2026 H2',
        what: 'Lokale KI ausgebaut, eigener Knoten für Sprache',
      },
    ],
    // „Der Betrieb hängt an einer Person …" ist am 2026-10-21 entfallen,
    // siehe Begründung bei `saganta`.
    limits: [
      'Alles steht an einem Ort an einem Hausanschluss. Es gibt keinen zweiten Standort und keine automatische Umschaltung. Fällt der Anschluss aus, greift der schriftliche Wiederanlauf.',
      'Die Last ist echt, aber überschaubar: ein Haushalt, keine hunderten gleichzeitigen Nutzer. Gebaut ist das auf Wartbarkeit und Härtung, nicht auf Lastspitzen.',
    ],
  },
  enAlt: {
    problem: 'Home labs drift into tinkering debt: 30 containers, each with its own compose, no shared map, no hardening, no backups. The moment someone asks "what is actually running right now", a hole opens up. I wanted the opposite: inventory, network segmentation, hardening waves and a provable DR plan.',
    approach: [
      'A service map as the single source of truth. Every compose definition goes in there first and nowhere else, and cross-host drift is pulled hourly against Gitea.',
      'Container hardening in documented waves: read_only, dropped capabilities, no-new-privileges, separate user IDs. Exceptions get justified, not hidden.',
      'Four network zones (proxy, core, apps, mgmt) with clear rules about who sees whom. No direct Docker socket access for consumers; everything goes through socket proxies.',
      'An event spine of its own: several producers (search, alerts, deals, mail, mailbox) write into one central MQTT bus, and brain-bus rules triage the alerts with dedup and cooldown.',
    ],
    architecture: {
      summary: 'Access comes in over tunnel and VPN to the control plane, which as the single source of truth drives the runtime hosts. An event spine gathers every producer, and an ops layer of monitoring, off-site backup and secret vault runs crosswise underneath.',
      tiers: [
        {
          label: 'Access',
          nodes: [
            {
              id: 'tunnel',
              label: 'Reverse tunnel',
              note: 'public ingress',
              kind: 'edge',
            },
            {
              id: 'vpn',
              label: 'VPN',
              note: 'admin-only',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Control plane',
          nodes: [
            {
              id: 'map',
              label: 'Service map',
              note: 'single source of truth',
              kind: 'core',
            },
            {
              id: 'spine',
              label: 'Event spine',
              note: 'MQTT bus',
              kind: 'core',
            },
            {
              id: 'kg',
              label: 'Knowledge gateway',
              note: 'adapters',
              kind: 'core',
            },
            {
              id: 'rules',
              label: 'Alert rules',
              note: 'dedup · cooldown',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Runtime',
          nodes: [
            {
              id: 'apps',
              label: 'Public apps & shops',
              kind: 'consumer',
            },
            {
              id: 'ai',
              label: 'AI compute',
              note: 'local models · 4-tier router',
              kind: 'consumer',
            },
            {
              id: 'edge',
              label: 'Edge inference',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Ops layer',
          nodes: [
            {
              id: 'mon',
              label: 'Monitoring',
              note: 'Prometheus · Grafana · Blackbox',
              kind: 'data',
            },
            {
              id: 'backup',
              label: 'Off-site backup',
              note: 'encrypted, DR runbook',
              kind: 'data',
            },
            {
              id: 'vault',
              label: 'Secret vault',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'tunnel',
          to: 'apps',
          label: 'public apps only',
        },
        {
          from: 'map',
          to: 'apps',
          label: 'compose definition',
        },
        {
          from: 'spine',
          to: 'rules',
          label: 'producer → triage',
        },
        {
          from: 'ai',
          to: 'mon',
          label: 'scrape',
        },
      ],
    },
    result: [
      'The services run across the host fleet and are measured against the canonical source. Hardening wave 3 is complete.',
      'The cluster now includes a small x86 virtualization cluster alongside the original single-board nodes; several AI services, among them a larger local language model as a quality lane, were relocated there, and the service map stayed the source everything is measured against.',
      'The knowledge gateway is searchable across seven curated knowledge sources, and an active route probe flags public domains about to tip over before anyone notices.',
      'A DR runbook with an RTO/RPO matrix, encrypted off-site backup live, and a restore drill that runs automatically on a schedule.',
    ],
    decisions: [
      {
        title: 'Why there is no service mesh',
        body: 'Linkerd or Istio are overkill for a home setup. A reverse proxy, tunnels, VPN and segmented compose networks do exactly what is needed.',
      },
      {
        title: 'Hardening in waves, not one big bang',
        body: 'Each wave takes on one clearly bounded class of container. Exceptions like s6-overlay images or Tecnativa socket proxies are written down as permanent exceptions.',
      },
      {
        title: 'Brain-bus for alerts',
        body: 'Teaching each service its own push channel would not have paid off. Everything flows through MQTT → brain-bus rules → ntfy/Discord. Dedup and cooldown live in one place.',
      },
    ],
    metrics: [
      {
        label: 'Restore',
        value: 'drilled quarterly, compared byte for byte',
      },
      {
        label: 'Hardening waves',
        value: '3 complete',
      },
      {
        label: 'Hosts',
        value: 'control plane · public · AI · edge · 3× x86',
      },
    ],
    timeline: [
      {
        when: '2024',
        what: 'Cluster bring-up, first containers',
      },
      {
        when: '2025',
        what: 'Service map, hardening waves 1 and 2, network zones',
      },
      {
        when: '2026 H1',
        what: 'Wave 3, event spine, knowledge gateway, active route probe',
      },
      {
        when: '2026 H1',
        what: 'x86 virtualization cluster integrated, AI services relocated without drift',
      },
      {
        when: '2026 H2',
        what: 'Local AI layer deepened: larger language model as a quality lane, dedicated voice node',
      },
    ],
    // „Operations rest on one person …" was dropped on 2026-10-21, see the
    // note in the German file under `saganta`.
    limits: [
      'Everything sits at a single site on one home connection. There is no geo-redundancy and no automatic failover, if the line goes down the documented recovery kicks in, not a second site.',
      'The load is real but modest: one household, not hundreds of concurrent users. The architecture is built for maintainability and hardening, not for the load spikes that would justify a cluster scheduler like Kubernetes.',
    ],
  },
};

export default homelab;
