import type { ProjectDetail } from './projects';
import type { Locale } from './i18n/config';
import { PROJECT_DETAILS_EN_1 } from './project-details.en.1';
import { PROJECT_DETAILS_EN_2 } from './project-details.en.2';

/**
 * Detail-Texte pro Projekt-ID. Bewusst hier getrennt, damit projects.ts
 * als kompakte Übersicht lesbar bleibt.
 *
 * Privacy-Regel weiterhin: keine IPs, Container-Namen, internen Hostnames.
 */
export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  saganta: {
    modules: ['Mail', 'Kalender', 'Wertsachen', 'Vorrat', 'Essensplanung', 'Post', 'Projekt-Deck'],
    problem:
      'Productivity-Tools liegen verstreut bei Drittanbietern, Mail bei einem, Kalender bei einem zweiten, Aufgaben bei einem dritten. Jeder verfolgt eigene Ziele, jeder zwingt mich in sein UI, und kaum eines bietet eine native App, die dieselben Daten teilt wie der Browser. Ich wollte eine Suite, die wie ein zusammenhängendes Produkt wirkt, mir gehört, in der ich Daten wirklich kontrolliere und in der dieselbe Anmeldung Web und Mobile trägt.',
    approach: [
      'Eine SvelteKit-Shell als zentrales Launchpad mit Theme, Locale und Pinning, alle Sub-Apps teilen Auth, Look und Settings.',
      'Alles Geteilte lebt als eigenes Paket in einem pnpm-Monorepo, das Turborepo entlang des Abhängigkeitsgraphen baut: UI-Komponenten samt Befehlspalette (⌘K), Design-Tokens, eine Auth-Bibliothek und ein SDK, einmal gebaut und von jeder App konsumiert statt kopiert. Genau das trägt den einheitlichen Look und das „eine Marke"-Gefühl.',
      'Pro Domäne ein Backend-for-Frontend (BFF in FastAPI) statt direkt vom Browser auf ein Backend durchzuschlagen: das Frontend spricht nur mit dem BFF seiner Domäne, das die Session prüft, sie in den eigentlichen Backend-Aufruf übersetzt und nur die freigegebenen Felder zurückreicht. Auth-Bridging, Logging und ein einheitliches Interface leben genau hier, das echte Backend sieht nie das offene Netz.',
      'Identität läuft über einen eigenen, schlanken Auth-Dienst auf better-auth statt über einen fremden Identity-Provider: ein früher Anlauf über einen externen OIDC-Stack wurde bewusst verworfen, weil eine eigene, verständliche Session-Schicht besser zur Suite passt.',
      'Derselbe Auth-Dienst stellt für die nativen Kotlin-Apps ein kurzlebiges Backend-Token aus, sodass Android dieselbe Identität nutzt wie das Web, ohne einen zweiten Login-Pfad.',
      'Container hängen segmentiert in getrennten Netz-Zonen, der Browser sieht nur die Shell und die Frontends, die BFFs reden nie öffentlich mit der Welt.',
    ],
    architecture: {
      summary:
        'Browser und native Kotlin-Apps sprechen über dieselbe Session mit der SvelteKit-Shell und den Sub-App-Frontends; ein eigener Auth-Dienst auf better-auth stellt die Web-Session und ein kurzlebiges Mobile-Token aus. Pro Domäne kapselt ein Backend-for-Frontend das echte Backend, prüft die Identität und reicht nur Erlaubtes durch, native Backends und Datenbanken bleiben hinter der BFF-Schicht.',
      tiers: [
        {
          label: 'Clients',
          nodes: [
            { id: 'shell', label: 'Web-Shell', note: 'SvelteKit · Launchpad', kind: 'edge' },
            { id: 'subapps', label: 'Sub-App-Frontends', kind: 'edge' },
            { id: 'native', label: 'Native Android-Apps', note: 'Kotlin · pro Sub-App', kind: 'edge' },
          ],
        },
        {
          label: 'Identität',
          nodes: [
            { id: 'auth', label: 'Eigener Auth-Dienst', note: 'better-auth · Session + Mobile-Token', kind: 'core' },
          ],
        },
        {
          label: 'BFF-Schicht',
          nodes: [
            { id: 'mailbff', label: 'Mail-BFF', kind: 'core' },
            { id: 'calbff', label: 'Kalender-BFF', kind: 'core' },
            { id: 'assetbff', label: 'Assets-BFF', kind: 'core' },
            { id: 'deckbff', label: 'Projekt-Deck-BFF', kind: 'core' },
          ],
        },
        {
          label: 'Backends & Daten',
          nodes: [
            { id: 'mailagg', label: 'Mail-Aggregator', note: 'externe Konten gebündelt', kind: 'consumer' },
            { id: 'calnative', label: 'Kalender · Assets', note: 'FastAPI-Eigen-Backend', kind: 'consumer' },
            { id: 'db', label: 'Domänen-Datenbanken', note: 'SQLite pro Domäne', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'shell', to: 'auth', label: 'Web-Session' },
        { from: 'native', to: 'auth', label: 'Mobile-Token' },
        { from: 'shell', to: 'mailbff', label: 'authentifiziert' },
        { from: 'mailbff', to: 'mailagg', label: 'gebündelt' },
        { from: 'calbff', to: 'calnative', label: 'gekapselt' },
        { from: 'deckbff', to: 'db' },
      ],
    },
    result: [
      'Die Suite ist live und tritt nach außen als eine Marke auf, Shell, Sub-Apps, Settings und Branding stimmen überein.',
      'Mail, News, Kalender, Assets und ein Projekt-Deck laufen produktiv; der Mail-Teil bündelt externe Konten, statt einen eigenen Mailserver zu doppeln.',
      'Für die ersten Sub-Apps gibt es native Android-Begleiter, die über ein kurzlebiges Backend-Token dieselbe Identität nutzen wie das Web, eine Anmeldung, zwei Oberflächen.',
      'Theme- und Locale-Settings sind in der Shell zentral, Sub-Apps erben sie. Neue Domänen kommen mit eigenem BFF dazu, ohne dass Bestehendes umgebaut wird.',
    ],
    decisions: [
      {
        title: 'Eigener Auth-Dienst statt fremdem OIDC-Stack',
        body: 'Ein früher Anlauf, die Identität über einen schwergewichtigen externen Identity-Provider zu lösen, wurde bewusst verworfen. Eine eigene, schlanke Session-Schicht ist verständlich, passt genau zur Suite und stellt ohne Zusatz-Komplexität ein Mobile-Token für die nativen Apps aus.',
      },
      {
        title: 'Mail bündeln statt Mailserver nachbauen',
        body: 'Der Mail-Teil aggregiert bestehende externe Konten und sendet über deren Wege, statt einen eigenen Mailserver mitzuschleppen. Das gibt eine vereinheitlichte Sicht ohne den Betriebsaufwand eines zweiten Mailstacks.',
      },
      {
        title: 'Eigen-Backend für Assets und Projekt-Deck',
        body: 'Wo es kein reifes Fremd-Backend gibt, das passt, entsteht ein eigenes: eigene DB, eigene Logik, saubere Kopplung an die übrigen Domänen statt eines aufgesetzten Fremd-Tools.',
      },
      {
        title: 'Geteiltes als Paket, nicht als Copy-Paste',
        body: 'Was mehrere Apps brauchen (UI-Komponenten, Design-Tokens, eine Auth-Bibliothek), liegt in versionierten Monorepo-Paketen, die jede App konsumiert. So sieht die Suite aus einem Guss aus, und eine Korrektur wirkt überall, statt in jedem Frontend einzeln nachgezogen zu werden.',
      },
    ],
    timeline: [
      { when: 'Q1 2026', what: 'Shell, eigener Auth-Dienst und erste Sub-Apps live' },
      { when: 'Q2 2026', what: 'Mail-Aggregator, Kalender, Assets und Projekt-Deck produktiv' },
      { when: 'Q2 2026', what: 'Native Android-Begleiter über ein gemeinsames Mobile-Token' },
      { when: 'danach', what: 'Doku, Wiki, weitere Sub-Apps nach Bedarf, keine Roadmap-Inflation' },
    ],
    lessons: [
      'BFFs sind die richtige Schnittstelle, sie tragen die Fremdkomplexität, ohne dass das Frontend sie sieht.',
      'Ein eigener, schlanker Auth-Dienst kann mehr leisten als ein schwergewichtiger Fremd-Provider, wenn er genau auf die Suite zugeschnitten ist, inklusive eines Tokens für die nativen Apps.',
      'Web und Mobile auf einer Identität spart den ganzen zweiten Login-Pfad, das Mobile-Token leitet sich aus derselben Session ab.',
      'Eine Suite wächst Domäne für Domäne, nicht im Big-Bang.',
    ],
    metrics: [
      { label: 'Sub-Apps', value: 'Shell · Mail · News · Kalender · Assets · Projekt-Deck' },
      { label: 'Geteilte Pakete', value: 'UI · Design-Tokens · Auth · SDK' },
      { label: 'Clients', value: 'Web und native Android' },
      { label: 'Auth-Backend', value: 'eigener Auth-Dienst' },
    ],
  },

  homelab: {
    problem:
      'Heimlabore tendieren zur Bastelschuld: 30 Container, jeder mit eigenem Compose, keine gemeinsame Karte, keine Härtung, keine Backups. Sobald jemand fragt "was läuft eigentlich gerade", öffnet sich ein Loch. Ich wollte das Gegenteil, Inventar, Netzsegmentierung, Härtungs-Wellen und ein nachweisbarer DR-Plan.',
    approach: [
      'Service-Map als Single Source of Truth, jede Compose-Definition geht erst hinein, dann nirgendwo anders hin. Cross-Host-Drift wird stündlich gegen Gitea gezogen.',
      'Container-Härtung in dokumentierten Wellen: read_only, dropped capabilities, no-new-privileges, getrennte User-IDs. Ausnahmen werden begründet, nicht versteckt.',
      'Vier Netz-Zonen, proxy, core, apps, mgmt, mit klaren Regeln, wer wen sieht. Kein direkter Docker-Socket-Zugriff für Konsumenten; alles über Socket-Proxies.',
      'Eigener Event-Spine: mehrere Producer (Search, Alerts, Deals, Mail, Postfach) schreiben in einen zentralen MQTT-Bus, ein Regel-Dienst (brain-bus) triagiert die Alerts mit Dedup und Cooldown.',
    ],
    architecture: {
      summary:
        'Der Zugang läuft über Tunnel und VPN auf die Control-Plane, die als Single Source of Truth die Runtime-Hosts steuert; ein Event-Spine bündelt alle Producer, und eine Ops-Schicht aus Monitoring, Off-Site-Backup und Secret-Vault liegt quer darunter.',
      tiers: [
        {
          label: 'Zugang',
          nodes: [
            { id: 'tunnel', label: 'Reverse-Tunnel', note: 'public ingress', kind: 'edge' },
            { id: 'vpn', label: 'VPN', note: 'admin-only', kind: 'edge' },
          ],
        },
        {
          label: 'Control-Plane',
          nodes: [
            { id: 'map', label: 'Service-Map', note: 'single source of truth', kind: 'core' },
            { id: 'spine', label: 'Event-Spine', note: 'MQTT-Bus', kind: 'core' },
            { id: 'kg', label: 'Knowledge-Gateway', note: 'Adapter', kind: 'core' },
            { id: 'rules', label: 'Alert-Regeln', note: 'Dedup · Cooldown', kind: 'core' },
          ],
        },
        {
          label: 'Runtime',
          nodes: [
            { id: 'apps', label: 'Public-Apps & Shops', kind: 'consumer' },
            { id: 'ai', label: 'AI-Compute', note: 'lokale Modelle · 4-Tier-Router', kind: 'consumer' },
            { id: 'edge', label: 'Edge-Inferenz', kind: 'consumer' },
          ],
        },
        {
          label: 'Ops-Schicht',
          nodes: [
            { id: 'mon', label: 'Monitoring', note: 'Prometheus · Grafana · Blackbox', kind: 'data' },
            { id: 'backup', label: 'Off-Site-Backup', note: 'restic, DR-Runbook', kind: 'data' },
            { id: 'vault', label: 'Secret-Vault', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'tunnel', to: 'apps', label: 'nur öffentliche Apps' },
        { from: 'map', to: 'apps', label: 'Compose-Definition' },
        { from: 'spine', to: 'rules', label: 'Producer → Triage' },
        { from: 'ai', to: 'mon', label: 'scrape' },
      ],
    },
    result: [
      'Über 160 Dienste laufen live über die Host-Flotte, null Drift gegen die kanonische Quelle, Hardening Welle 3 abgeschlossen.',
      'Der Verbund umfasst inzwischen einen kleinen x86-Virtualisierungs-Cluster neben den ursprünglichen Einplatinen-Knoten; mehrere AI-Dienste, darunter ein größeres lokales Sprachmodell als Qualitäts-Lane, wurden sauber dorthin verlagert, ohne dass die Map driftete.',
      'Knowledge-Gateway über zehn Adapter durchsuchbar, eine aktive Routen-Probe meldet öffentliche Domänen, die kippen, bevor es jemand bemerkt.',
      'DR-Runbook mit RTO/RPO-Matrix, verschlüsseltes Off-Site-Backup live, Restore-Drill wiederkehrend automatisiert.',
    ],
    decisions: [
      {
        title: 'Eigen-Routing statt Service-Mesh',
        body: 'Linkerd/Istio sind für Heimsetups Overkill. nginx + cloudflared + WireGuard + segmentierte Compose-Netze leisten das Nötige.',
      },
      {
        title: 'Hardening in Wellen, nicht als Big-Bang',
        body: 'Jede Welle adressiert eine klar abgegrenzte Container-Klasse. Ausnahmen wie s6-overlay-Images oder Tecnativa-Socket-Proxies werden als Dauerausnahmen dokumentiert.',
      },
      {
        title: 'Ein Bus für alle Alerts',
        body: 'Statt jedem Service einen eigenen Push-Kanal zu geben, läuft alles über MQTT → brain-bus-Regeln → ntfy/Discord. Dedup und Cooldown an einer Stelle.',
      },
    ],
    timeline: [
      { when: '2024', what: 'Cluster-Bring-up, erste Container' },
      { when: '2025', what: 'Service-Map, Hardening Welle 1+2, Netz-Zonen' },
      { when: '2026 H1', what: 'Welle 3, Event-Spine, Knowledge-Gateway, aktive Routen-Probe' },
      { when: '2026 H1', what: 'x86-Virtualisierungs-Cluster integriert, AI-Dienste verlagert ohne Drift' },
      { when: '2026 H2', what: 'Lokale KI-Schicht vertieft: größeres Sprachmodell als Qualitäts-Lane, dedizierter Voice-Knoten' },
    ],
    metrics: [
      { label: 'Dienste live', value: '163 über die Flotte' },
      { label: 'Drift', value: '0 gegen die Quelle' },
      { label: 'Härtungs-Wellen', value: '3 abgeschlossen' },
      { label: 'Hosts', value: 'Control-Plane · Public · AI · Edge · 3× x86' },
    ],
    lessons: [
      'Eine Service-Map zu führen lohnt sich schon ab 20 Containern. Davor reicht ein Notizbuch.',
      'Härtung scheitert oft an wenigen Images, die als Dauerausnahmen anerkennen und dafür den Rest sauber halten.',
      'Drift ist keine Momentaufnahme, sondern ein Dauer-Check. Stündlich gegen die kanonische Quelle zu diffen findet die Lücke, bevor sie zum Vorfall wird.',
      'Alerts gehören zentralisiert, nicht pro Service. Ein Bus mit Dedup und Cooldown verhindert die Alert-Flut, an der Solo-On-Call sonst abstumpft.',
    ],
  },

  lernen: {
    problem:
      'Lernplattformen am Markt sind generisch, entweder LMS-Schwergewichte oder Karteikarten-Apps. Beides passt nicht für jemanden, der über mehrere Domänen gleichzeitig lernt: IT-Zertifikate, Fahrschule, Schulstoff, Allgemeinbildung. Jede Domäne hat eigene Logik, eigene Visualisierungen, eigenes Tempo.',
    approach: [
      'Sechs eigenständige Next.js-Apps statt einer Monolith-Plattform. Jede mit eigener, in die App eingebetteter SQLite-Datenbank (better-sqlite3), eigenem Theme, eigenem Auth, was nicht zusammen gehört, wird nicht zusammen gebaut.',
      'Geteilte Web-Bausteine über ein Design-System (`claude-design`), Tailwind-Tokens + Compose-Tokens werden in alle Apps synchronisiert, nicht copy-pasted.',
      'Drei Pilot-Apps nativ für Android über Compose Multiplatform mit Hilt-Dependency-Injection und Custom-Tab-Login.',
      'Ein Hub als Karten-Dashboard, der die Apps bündelt, auch das ein eigener Stack, kein Wrapper.',
    ],
    architecture: {
      summary:
        'Hub, sechs Web-Apps und die Android-Piloten teilen sich ein Design-System und die Lernlogik über Sync-Skripte, laufen aber je App vollständig isoliert mit eigener Datenbank, eigenem Auth und eigenem Theme, geteilt wird, was geteilt gehört, getrennt der Rest.',
      tiers: [
        {
          label: 'Zugänge',
          nodes: [
            { id: 'hub', label: 'Hub', note: 'Karten-Dashboard', kind: 'edge' },
            { id: 'web', label: 'Sechs Web-Apps', kind: 'edge' },
            { id: 'android', label: 'Android-Piloten', kind: 'edge' },
          ],
        },
        {
          label: 'Geteilte Bausteine',
          nodes: [
            { id: 'design', label: 'Design-System', note: 'Web- + Compose-Tokens', kind: 'core' },
            { id: 'logic', label: 'Lernlogik', kind: 'core' },
            { id: 'sync', label: 'Sync-Skripte', note: 'kein copy-paste', kind: 'core' },
          ],
        },
        {
          label: 'Pro App isoliert',
          nodes: [
            { id: 'db', label: 'Eigene Datenbank', note: 'SQLite, pro App', kind: 'data' },
            { id: 'auth', label: 'Eigenes Auth', kind: 'data' },
            { id: 'theme', label: 'Eigenes Theme', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'design', to: 'web', label: 'synchronisiert' },
        { from: 'design', to: 'android', label: 'Compose-Tokens' },
        { from: 'web', to: 'db', label: 'pro App getrennt' },
      ],
    },
    result: [
      'Sechs Apps live auf einem geteilten Kern, Empty-States überall ehrlich statt Mock-Default; ein früherer Monolith wurde zugunsten der Split-Apps stillgelegt.',
      'Ein Prüfungssimulator zieht aus domänen-spezifischen Fragen-Pools echte Mock-Prüfungen mit Auswertung nach Themengebiet, statt eine starre Fragenliste abzuspulen.',
      'Eine Abo- und Freischalt-Logik trennt Gratis von Premium pro App, inklusive Ablauf-Downgrade und Schutz gegen doppelte Freischaltung.',
      'Native Android-Builds für die Apps, mit eigenem Passwort-Login im geteilten Kern statt einer reinen Fremd-Anmeldung.',
    ],
    decisions: [
      {
        title: 'Sechs Apps statt eine',
        body: 'Plugins, Module und Rollen in einer Monolith-Plattform tragen ihren eigenen Overhead. Sechs schlanke Apps mit geteiltem Design-System sind langfristig billiger als ein gemeinsames Datenmodell, das jede Domäne stört, der ursprüngliche Monolith wurde dafür bewusst aufgegeben.',
      },
      {
        title: 'Prüfungssimulator aus Pools statt fester Liste',
        body: 'Eine echte Prüfungssimulation braucht wechselnde Fragen, nach Themengebiet gewichtet. Die Fragen liegen in domänen-spezifischen Pools, aus denen pro Durchlauf eine frische Auswahl gezogen und am Ende nach Gebieten ausgewertet wird.',
      },
      {
        title: 'Freischaltung als geprüfter Anspruch',
        body: 'Premium wird nicht als Flag gesetzt, sondern als überprüfter Anspruch mit Ablauf und Schutz gegen doppelte oder fremde Freischaltung modelliert, damit der Zugang sauber bleibt, auch wenn ein Abo endet.',
      },
    ],
    timeline: [
      { when: '2025', what: 'Erste Web-Apps, Design-System aufgesetzt' },
      { when: '2026 H1', what: 'Sechs Apps live, Monolith abgelöst, native Android-Builds' },
      { when: '2026 H1', what: 'Prüfungssimulator und Abo-/Freischalt-Logik über die Apps gezogen' },
    ],
    metrics: [
      { label: 'Web-Apps', value: '6 live auf einem Kern' },
      { label: 'Android', value: 'native Builds mit Passwort-Login' },
      { label: 'Prüfungssimulator', value: 'aus Pools, nach Gebiet ausgewertet' },
    ],
    lessons: [
      'Mehrere kleine Apps mit geteiltem Design-System schlagen einen Monolith mit Modulsystem fast immer, der tote Monolith ist der beste Beleg dafür.',
      'Empty-States zu erfinden ist immer falsch. Ein leerer Zustand mit klarer Aussage ist die richtige Antwort.',
      'Eine Freischaltung gehört als geprüfter Anspruch modelliert, nicht als gesetztes Flag, sonst überlebt der Zugang das Ende des Abos.',
    ],
  },

  marktwatch: {
    problem:
      'Ein Deal-Beobachter für den Gebrauchtmarkt lebt oder stirbt an zwei Gefahren: Fehlalarme, die das echte Signal unter Rauschen begraben und Aufmerksamkeit verbrennen, und jede unumkehrbare Aktion (eine Watchlist leerräumen, ein externes Modell abrechnen), die versehentlich feuert. Ich wollte transparentes Scoring mit echter Wahrscheinlichkeit hinter einem „kaufen", eine mehrstufige Fehlalarm-Abwehr, und harte Gates an allem, was die Engine tut und was sich nicht zurücknehmen lässt.',
    approach: [
      'Async-Crawler über mehrere Quellen hinter einem gemeinsamen Interface, ein Circuit-Breaker je Quelle, damit eine tote Quelle den Lauf nicht blockiert und neue Quellen ein Klassen-Patch bleiben.',
      'Fehlalarm-Abwehr in Schichten statt eines einzigen Filters: zuerst ein kostenloser, regelbasierter Muster-Check (Zubehör, Ersatzteile, Schäden, Bundles, Varianten-Listings), dann ein kleines Sprachmodell als billige Vor-Triage nur für Grenzfälle, beides hinter einem gemeinsamen Gate, durch das der Echtzeit-Alarm und der Tages-Digest gleichermaßen müssen.',
      'Quantitative Deal-Mathematik statt pauschalem Rabatt: Markt-Statistik aus einem zeitgewichteten 30-Tage-Fenster (realisierte Auktionspreise gegen offene Forderungen, robuste Streuung über den Median-Abstand), darüber ein Lognormal-t-Modell, das nicht nur eine erwartete Marge liefert, sondern den schlechten Fall (ein 5%-Quantil des Gewinns und den erwarteten Verlust darunter), dazu ein Kelly-artiges Einsatz-Maß und ein wahrscheinlichkeits-basiertes Sicher-Maximal-Gebot.',
      'Ein Downside-Gate: ein Kandidat wird erst zu „kaufen", wenn sein 5%-Quantil-Gewinn über einer Schwelle liegt. Ein Deal, der nur im Schnitt gut aussieht, im schlechten Fall aber verliert, wird zurückgehalten.',
      'Alles Unumkehrbare liegt hinter einem expliziten Zwei-Flag-Gate; beobachtend als Default, kein Schreib-Call nach außen ohne bewusste Konfiguration.',
    ],
    architecture: {
      summary:
        'Mehrere Quellen-Crawler hinter einem gemeinsamen Interface liefern in eine geschichtete Fehlalarm-Abwehr: erst ein kostenloser Regel-Filter, dann ein kleines Sprachmodell als Vor-Triage für Grenzfälle, dann ein gemeinsames Gate, durch das Echtzeit-Alarm und Tages-Digest beide müssen. Was durchkommt, bewertet ein Scorer mit zeitgewichteter Markt-Statistik und einem Lognormal-t-Modell, das auch den schlechten Fall beziffert; ein Downside-Gate hält Deals zurück, deren 5%-Quantil verliert. Alles Unumkehrbare passiert zwingend durch ein Zwei-Flag-Gate, beobachtend als Default.',
      tiers: [
        {
          label: 'Quellen',
          nodes: [
            { id: 'crawl', label: 'Async-Crawler', note: 'gemeinsames Interface', kind: 'edge' },
            { id: 'breaker', label: 'Circuit-Breaker', note: 'je Quelle', kind: 'edge' },
          ],
        },
        {
          label: 'Fehlalarm-Abwehr',
          nodes: [
            { id: 'rules', label: 'Regel-Muster', note: 'kostenlos', kind: 'core' },
            { id: 'triage', label: 'Kleines Sprachmodell', note: 'Vor-Triage, budgetiert', kind: 'core' },
            { id: 'fpgate', label: 'Gemeinsames Gate', note: 'Echtzeit + Digest', kind: 'core' },
          ],
        },
        {
          label: 'Bewertung',
          nodes: [
            { id: 'stats', label: 'Markt-Statistik', note: 'zeitgewichtet, robust', kind: 'core' },
            { id: 'dealmath', label: 'Lognormal-t Deal-Math', note: 'P05 · CVaR · Kelly', kind: 'core' },
            { id: 'downside', label: 'Downside-Gate', note: 'schlechter Fall tragbar', kind: 'core' },
          ],
        },
        {
          label: 'Ausgabe & Sicherheit',
          nodes: [
            { id: 'alert', label: 'Gedrosselte Alerts', kind: 'consumer' },
            { id: 'digest', label: 'Tages-Digest', kind: 'consumer' },
            { id: 'twoflag', label: 'Zwei-Flag-Gate', note: 'für Unumkehrbares', kind: 'core' },
          ],
        },
      ],
      flows: [
        { from: 'crawl', to: 'rules', label: 'Rohtreffer' },
        { from: 'rules', to: 'triage', label: 'nur Grenzfälle' },
        { from: 'triage', to: 'fpgate' },
        { from: 'fpgate', to: 'stats', label: 'was durchkommt' },
        { from: 'stats', to: 'dealmath' },
        { from: 'dealmath', to: 'downside', label: 'schlechter Fall' },
        { from: 'downside', to: 'alert', label: 'nur „kaufen"' },
        { from: 'downside', to: 'digest' },
      ],
    },
    result: [
      'Live auf einem öffentlichen Host mit Tunnel-Callback; unumkehrbare Aktionen liegen hinter zwei Flags, beobachtend als Default.',
      'Ein „kaufen" trägt eine nachvollziehbare Wahrscheinlichkeit: erwartete Marge samt schlechtem Fall (5%-Quantil und erwarteter Verlust darunter), nicht nur eine Prozent-unter-Median-Zahl.',
      'Nach einem Fehlalarm-Ausbruch fließen Echtzeit-Alarm und Tages-Digest durch dasselbe Filter-Gate; das echte Signal steht wieder frei, Rauschen bleibt draußen.',
      'Der Regelbetrieb bleibt günstig: die teure Modell-Triage läuft nur für Grenzfälle und gegen ein Tagesbudget, der Rest ist deterministische Regel-Logik.',
      'Der Scorer ist unabhängig vom Live-Crawler testbar; die Quant-Mathematik ist durch eine eigene Testschicht abgesichert, schnelle Regression bleibt möglich.',
    ],
    decisions: [
      {
        title: 'Wahrscheinlichkeit statt Punktschätzung',
        body: 'Ein einzelner „fairer Preis" verschweigt das Risiko. Ein Lognormal-t-Modell mit kleinem Stichprobenumfang liefert das 5%-Quantil des Gewinns und den erwarteten Verlust darunter, dazu ein Kelly-artiges Einsatz-Maß. So steht hinter „kaufen" eine Downside, nicht nur ein Mittelwert.',
      },
      {
        title: 'Ein gemeinsames Gate nach dem Fehlalarm-Ausbruch',
        body: 'Verstreute Einzelfilter ließen einmal eine Welle von Fehlalarmen durch, während die Referenzdaten still weggebrochen waren. Die Antwort war ein einziges Gate, durch das Echtzeit und Digest beide müssen, plus Anker-Schranken gegen „zu gut, um wahr zu sein" ohne Verkaufsbelege.',
      },
      {
        title: 'Kleines Modell nur für Grenzfälle',
        body: 'Ein Sprachmodell auf jeden Treffer wäre teuer und träge. Der kostenlose Regel-Filter entscheidet die klaren Fälle, das Modell wird nur bei Unsicherheit und gegen ein Tagesbudget gezogen, und fällt bei Ausfall offen, statt den Lauf zu stoppen.',
      },
      {
        title: 'Unumkehrbares hinter zwei Flags',
        body: 'Eine Regel im Wiki schützt nicht. Watchlist-Aufräumen und jeder Schreib-Call nach außen verlangen ein Mode-Flag UND ein explizites Apply-Flag; alles andere bleibt Dry-Run, beobachtend als Default.',
      },
    ],
    timeline: [
      { when: '2025', what: 'Crawler-Basis, erste Quelle, gewichteter Scorer' },
      { when: '2026 H1', what: 'Zeitgewichtete Markt-Statistik, Lognormal-t Deal-Math mit Downside und Kelly, Sicherheits-Layer' },
      { when: '2026 H1', what: 'Zentrales Fehlalarm-Gate nach einem Alarm-Ausbruch, Regel- plus Modell-Triage, Anker-Schranken' },
      { when: '2026 H2', what: 'Mehr Quellen, Tages-Digest, Invite-Multiuser mit Budget und Rate-Limit je Nutzer' },
    ],
    metrics: [
      { label: 'Bewertung', value: 'erwartete Marge + Downside (P05 · CVaR)' },
      { label: 'Fehlalarm-Abwehr', value: 'Regeln → kleines Modell → Gate' },
      { label: 'Unumkehrbares', value: 'Zwei-Flag-Gate · beobachtend als Default' },
      { label: 'Zugang', value: 'Invite-only · Budget je Nutzer' },
    ],
    lessons: [
      'Ein Deal ist erst gut, wenn auch sein schlechter Fall tragbar ist. Der Erwartungswert allein verschweigt das Risiko; das 5%-Quantil und der erwartete Verlust darunter machen es sichtbar und lassen sich als hartes Gate durchsetzen.',
      'Ein Fehlalarm-Ausbruch lehrt schnell, dass verstreute Filter nicht reichen. Erst ein gemeinsames Gate, durch das Echtzeit- und Digest-Pfad beide müssen, hält Signal und Rauschen dauerhaft getrennt.',
      'Ein teures Modell gehört nur an die Grenzfälle: die klaren Fälle entscheidet kostenlose Regel-Logik, das Modell wird budgetiert und fällt offen aus, statt den ganzen Lauf mitzureißen.',
      'Mock-als-Default dreht die Beweislast um: nicht „vergiss den Live-Schalter nicht", sondern „schalte bewusst scharf". Das ist der Unterschied zwischen sicher und meistens sicher.',
    ],
  },


  shops: {
    problem:
      'Wer mehrere Shops betreiben will, braucht verlässliche, wartungsarme Umgebungen. WordPress out-of-the-box ist nicht gehärtet, Updates können kippen, Sicherheits-Header fehlen meist, und je mehr Shops dazukommen, desto eher driftet jeder in seinen eigenen Sonderzustand.',
    approach: [
      'Kanonische Härtungs-Templates auf der Control-Plane, pro Shop versioniert deployed, eine Quelle, viele Instanzen.',
      'Security-Header, Cache-Strategie und Härtungsregeln als Standard im Template, nicht als manuelles Add-on pro Shop.',
      'Container-Härtung pro Instanz: read-only Root mit tmpfs für Schreibpfade, segmentierte Netz-Zone, Port-Binding nur lokal hinter dem Reverse-Proxy.',
      'Einheitlicher Deploy-Pfad ins Daten-Volume, kein Shop pflegt seinen eigenen Sonderweg, neue Instanzen erben das komplette Bundle.',
    ],
    architecture: {
      summary:
        'Eine kanonische Härtungs-Quelle auf der Control-Plane versorgt alle Shop-Instanzen mit demselben Template-Bundle; jede Instanz läuft isoliert mit eigenem Daten-Volume hinter einem gemeinsamen Reverse-Proxy, sodass neue Instanzen das Hardening erben statt es neu zusammenzubauen.',
      tiers: [
        {
          label: 'Zugang',
          nodes: [{ id: 'proxy', label: 'Reverse-Proxy / Tunnel', kind: 'edge' }],
        },
        {
          label: 'Härtungs-Quelle',
          nodes: [
            { id: 'tpl', label: 'Härtungs-Templates', note: 'kanonisch · versioniert', kind: 'core' },
            { id: 'hdr', label: 'Security-Header', kind: 'core' },
            { id: 'cache', label: 'Cache-Regeln', kind: 'core' },
          ],
        },
        {
          label: 'Shop-Instanzen',
          nodes: [
            { id: 'shop', label: 'WooCommerce-Instanzen', note: 'read-only · tmpfs', kind: 'consumer' },
          ],
        },
        {
          label: 'Daten',
          nodes: [{ id: 'vol', label: 'Daten-Volume', note: 'pro Shop getrennt', kind: 'data' }],
        },
      ],
      flows: [
        { from: 'tpl', to: 'shop', label: 'Deploy ins Volume' },
        { from: 'proxy', to: 'shop', label: 'public' },
        { from: 'shop', to: 'vol' },
      ],
    },
    result: [
      'Mehrere Shop-Instanzen laufen auf demselben gehärteten Unterbau, klare Update- und Restore-Pfade.',
      'Neue Instanzen starten mit dem fertigen Hardening-Bundle statt mit einer nackten WordPress-Installation.',
      'Drift-Risiko minimiert: die Shops lesen, was die Control-Plane schreibt, Korrekturen wirken überall gleich.',
    ],
    decisions: [
      {
        title: 'Templates auf der Control-Plane',
        body: 'Pro-Shop-Drift war das Hauptproblem. Templates kanonisch zu halten löst es, der Shop liest, was die Control-Plane schreibt, statt seine eigene Kopie zu pflegen.',
      },
      {
        title: 'Hardening im Template, nicht pro Shop',
        body: 'Härtung, die man pro Shop manuell setzt, vergisst man irgendwann bei einem. Im Template ist sie Default, jede neue Instanz bekommt sie automatisch.',
      },
    ],
    timeline: [
      { when: '2024', what: 'Erste Shops, Härtungs-Templates kanonisiert' },
      { when: '2025', what: 'Einheitlicher Deploy-Pfad, Security-Header + Cache als Standard' },
      { when: '2026', what: 'Container-Härtung (read-only, tmpfs, Netz-Zonen) über alle Shops gezogen' },
    ],
    metrics: [
      { label: 'Shops', value: 'mehrere, gehärtet' },
      { label: 'Template-Quelle', value: 'kanonisch · versioniert' },
      { label: 'Härtung', value: 'read-only · tmpfs · Header' },
    ],
    lessons: [
      'Multi-Shop-Hosting skaliert nur, wenn das Hardening kanonisch ist. Pro-Shop-Pflege wird mit jeder Instanz teurer und unsicherer.',
      'Ein einheitlicher Deploy-Pfad ist mehr wert als jede einzelne Optimierung, er verhindert, dass aus drei Shops drei Sonderfälle werden.',
    ],
  },




  'wissens-foederation': {
    problem: 'Wissen liegt im Eigen-Stack über viele Services verstreut: Dokumente in einem Archiv, Notizen in einem Vault, Inventar im Lager, Marktdaten in der Deal-Engine, Briefe im Postfach, Termine im Kalender. Jeder dieser Dienste hat eine eigene Persistenz, eine eigene Such-Logik und eine eigene Auth. Wer etwas wiederfinden will, muss wissen, in welchem System es steckt, und sich dort einzeln anmelden. Ich wollte eine einzige Frage stellen können und eine vereinheitlichte Antwort über alle Quellen bekommen, ohne dass die fragende Seite je erfahren muss, welcher Dienst sie geliefert hat.',
    approach: [
      'Ein Adapter pro Quelle, alle gegen dasselbe schmale Interface. Eine neue Quelle anzubinden ist ein neuer Adapter, kein Umbau am Kern.',
      'Aggregation bewusst zur Abfragezeit statt über einen eigenen Crawler. Kein zweiter Index, kein Scheduler, der einen separaten Wahrheitsstand pflegen und synchron halten müsste: jede Quelle bleibt für ihre Daten allein zuständig.',
      'Token-Auth pro Backend. Jeder Adapter spricht seine Quelle über eine abgesicherte interne Such-Schnittstelle an, die fragende Seite sieht keine der Roh-Schnittstellen.',
      'Jede Abfrage meldet sich als Ereignis auf dem eigenen Event-Bus, sodass andere Dienste die Nutzung des Wissens-Layers mitlesen und auswerten können.',
      'Die vereinheitlichten Treffer lassen sich optional per Embedding-Modell neu ranken (dense Reranking), standardmäßig aus wegen der Latenz, pro Anfrage zuschaltbar dort, wo Antwortqualität vor Tempo geht.',
      'Bewusste Ehrlichkeit über die Grenzen: geführt werden genau die Adapter, die real angebunden sind. Behauptete Mehr-Quellen aus Doku-Drift wurden aktiv geprüft und entfernt, statt sie als Feature zu zeigen.',
    ],
    architecture: {
      summary: 'Ein Konsument stellt eine Frage gegen einen einzigen Such-Endpunkt; die Föderations-Schicht fächert sie über je einen Adapter pro Quelle auf, jeder Adapter spricht seine Quelle token-authentifiziert über deren interne Such-Schnittstelle an, und das Ergebnis kommt vereinheitlicht zurück. Aggregiert wird zur Abfragezeit ohne eigenen Index, und jede Suche wird als Ereignis auf den Event-Bus geschrieben, ohne dass der Konsument je eine der dahinterliegenden Quellen kennt.',
      tiers: [
        {
          label: 'Konsumenten',
          nodes: [
            {
              id: 'consumer',
              label: 'Eigen-Dienste',
              note: 'ein Backend',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Föderations-Schicht',
          nodes: [
            {
              id: 'search',
              label: 'Such-Endpunkt',
              note: 'eine Frage',
              kind: 'core',
            },
            {
              id: 'fanout',
              label: 'Fan-out',
              note: 'zur Abfragezeit',
              kind: 'core',
            },
            {
              id: 'merge',
              label: 'Vereinheitlichung',
              note: 'ein Ergebnis',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Adapter',
          nodes: [
            {
              id: 'adapters',
              label: 'Adapter pro Quelle',
              note: 'gemeinsames Interface',
              kind: 'core',
            },
            {
              id: 'auth',
              label: 'Token-Auth',
              note: 'pro Backend',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Quellen',
          nodes: [
            {
              id: 'docs',
              label: 'Dokumente · Notizen',
              kind: 'data',
            },
            {
              id: 'ops',
              label: 'Inventar · Marktdaten',
              kind: 'data',
            },
            {
              id: 'corr',
              label: 'Briefe · Kalender',
              kind: 'data',
            },
          ],
        },
        {
          label: 'Beobachtung',
          nodes: [
            {
              id: 'bus',
              label: 'Event-Bus',
              note: 'Suche als Ereignis',
              kind: 'consumer',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'consumer',
          to: 'search',
          label: 'eine Frage',
        },
        {
          from: 'search',
          to: 'fanout',
        },
        {
          from: 'fanout',
          to: 'adapters',
          label: 'auf alle Quellen',
        },
        {
          from: 'adapters',
          to: 'auth',
          label: 'token-authentifiziert',
        },
        {
          from: 'auth',
          to: 'docs',
          label: 'interne Such-Schnittstelle',
        },
        {
          from: 'adapters',
          to: 'merge',
        },
        {
          from: 'merge',
          to: 'consumer',
          label: 'ein Ergebnis',
        },
        {
          from: 'search',
          to: 'bus',
          label: 'Suche als Ereignis',
        },
      ],
    },
    result: [
      'Zehn reale Quellen sind über eine einzige Such-API durchsuchbar, jeder Backend-Zugriff token-abgesichert.',
      'Andere Eigen-Dienste sprechen den Wissens-Layer als ein einziges Backend an, ohne die Quellen dahinter zu kennen: das Frontend bleibt von den Rohsystemen getrennt.',
      'Eine neue Quelle anzubinden ist ein neuer Adapter gegen ein bestehendes Interface, kein Eingriff in den Kern.',
      'Jede Suche läuft als Ereignis über den eigenen Event-Bus, der Wissens-Layer ist damit selbst beobachtbar statt blinder Fleck.',
    ],
    decisions: [
      {
        title: 'On-Query-Aggregation statt eigenem Index',
        body: 'Ein eigener Crawler mit eigenem Index hätte einen zweiten Wahrheitsstand erzeugt, der ständig nachsynchronisiert werden muss und zwischen zwei Aktualisierungen lügt. Stattdessen fragt die Föderation zur Abfragezeit direkt bei den Quellen: jede Quelle bleibt für ihre Daten allein zuständig, der Layer hält keine Kopie.',
      },
      {
        title: 'Adapter-Pattern mit Auth pro Backend',
        body: 'Jede Quelle bekommt einen Adapter gegen dasselbe Interface, jeder Adapter trägt seine eigene token-authentifizierte Verbindung. Das hält die Quellen sauber gekapselt, lässt neue Quellen ohne Kern-Umbau andocken und gibt jedem Backend eine eigene, abgrenzbare Vertrauensgrenze statt eines gemeinsamen Generalschlüssels.',
      },
      {
        title: 'Dokumentierte Grenzen statt aufgehübschtem Umfang',
        body: 'Geführt wird nur, was real angebunden ist. Als Doku-Drift einmal mehr Quellen behauptete, als tatsächlich existierten, wurde das geprüft und korrigiert statt als Feature stehen gelassen. Eine ehrliche Quellen-Liste ist mehr wert als eine beeindruckende, die nicht trägt.',
      },
    ],
    metrics: [
      {
        label: 'Angebundene Quellen',
        value: '10, heterogen',
      },
      {
        label: 'Aggregation',
        value: 'zur Abfragezeit, kein eigener Index',
      },
      {
        label: 'Auth',
        value: 'token-basiert pro Backend',
      },
      {
        label: 'Event-Integration',
        value: 'Suche als Ereignis auf dem Bus',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Föderations-Kern, erste Adapter, Token-Auth pro Backend',
      },
      {
        when: '2026 H1',
        what: 'Erste Quellen angebunden, vereinheitlichtes Ergebnis, On-Query-Aggregation',
      },
      {
        when: '2026 H2',
        what: 'Anbindung an den Event-Bus, auf zehn Quellen gewachsen',
      },
    ],
    lessons: [
      'Föderation zur Abfragezeit erspart die teuerste Klasse von Bugs: einen zweiten Index, der zwischen zwei Synchronisationen falsche Antworten gibt.',
      'Ein gemeinsames Adapter-Interface macht aus dem Anbinden einer Quelle eine Modul-Frage statt einer Kern-Frage.',
      'Eine Quellen-Liste muss man gegen die Realität prüfen, nicht gegen die eigene Dokumentation: gefühlter Umfang und tatsächlicher Umfang driften sonst auseinander.',
    ],
  },
  postfach: {
    problem: 'Papierpost zu digitalisieren ist ein alltäglicher Schmerz, gerade im Mittelstand: Briefe stapeln sich, sind nicht durchsuchbar, und die naheliegende Lösung wandert in ein Cloud-DMS oder ein Drittanbieter-Postfach, dem man Vertrauen und Daten gleichzeitig überlässt. Ein abfotografierter Brief ist schräg, schlecht beleuchtet und voll Hintergrund, also weit weg von einem sauberen Datensatz. Ich wollte den ganzen Weg vom flüchtigen Handy-Foto bis zum abgelegten, durchsuchbaren Eintrag im eigenen Netz abbilden, ohne dass ein Dokument je das Haus verlässt.',
    approach: [
      'Bildaufbereitung als eigener, vorgelagerter Schritt: Bevor überhaupt Text gelesen wird, sorgt eine klassische Computer-Vision-Stufe dafür, dass aus dem schrägen Foto ein begradigter, lesbarer Scan wird. Dieser Schritt ist als eigenständiger Dienst gekapselt und einzeln nachjustierbar.',
      'Klassische Computer-Vision für das, was sie deterministisch und günstig kann (Dokument im Bild finden, Perspektive begradigen, für OCR aufbereiten), und ein Sprachmodell erst danach für das, was Verständnis braucht: Titel und Absender aus dem Volltext extrahieren.',
      'Robuster Fallback statt harter Fehler: bleibt die Bildaufbereitung aus oder scheitert sie an einem schlechten Foto, wird das Original abgelegt, der Nutzer sieht nie einen Abbruch.',
      'Saubere System-Integration nach innen: jeder fertige Scan meldet sich als Ereignis auf dem eigenen Event-Bus, und eine token-gesicherte interne Such-Schnittstelle macht den Bestand für den übergreifenden Wissens-Layer auffindbar, ohne dass Konsumenten das rohe Backend kennen.',
    ],
    architecture: {
      summary: 'Ein Foto kommt über die Oberfläche herein. Ist es ein Bild, wird es an eine eigene Bildaufbereitung übergeben, die das Dokument findet und begradigt und einen sauberen Scan zurückgibt. Ein OCR-Schritt liest daraus den Text, ein Sprachmodell extrahiert Titel und Absender. Der fertige Datensatz wird abgelegt, meldet sich als Ereignis auf dem Event-Bus und steht über eine token-gesicherte interne Such-Schnittstelle dem Wissens-Layer zur Verfügung. Schlägt die Aufbereitung fehl, wird das Original abgelegt.',
      tiers: [
        {
          label: 'Eingang',
          nodes: [
            {
              id: 'upload',
              label: 'Foto-Upload',
              note: 'Browser',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Aufbereitung & Extraktion',
          nodes: [
            {
              id: 'vision',
              label: 'Bildaufbereitung',
              note: 'eigener Dienst, begradigter Scan',
              kind: 'core',
            },
            {
              id: 'ocr',
              label: 'OCR',
              note: 'Volltext aus dem Scan',
              kind: 'core',
            },
            {
              id: 'llm',
              label: 'LLM-Extraktion',
              note: 'Titel und Absender',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Ablage',
          nodes: [
            {
              id: 'store',
              label: 'Datensatz-Ablage',
              note: 'durchsuchbar',
              kind: 'data',
            },
          ],
        },
        {
          label: 'Abnehmer',
          nodes: [
            {
              id: 'bus',
              label: 'Event-Bus',
              note: 'Scan fertig',
              kind: 'consumer',
            },
            {
              id: 'search',
              label: 'Interne Such-Schnittstelle',
              note: 'token-gesichert',
              kind: 'consumer',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'upload',
          to: 'vision',
          label: 'nur bei Bild',
        },
        {
          from: 'vision',
          to: 'ocr',
          label: 'begradigter Scan',
        },
        {
          from: 'ocr',
          to: 'llm',
          label: 'Volltext',
        },
        {
          from: 'llm',
          to: 'store',
        },
        {
          from: 'store',
          to: 'bus',
          label: 'Ereignis',
        },
        {
          from: 'store',
          to: 'search',
          label: 'für Wissens-Layer',
        },
      ],
    },
    result: [
      'Ein schräg fotografierter Brief wird zu einem abgelegten Eintrag mit erkanntem Titel, Absender und brauchbarem Volltext, ohne manuelle Nacharbeit.',
      'Bildaufbereitung, OCR und Ablage laufen vollständig im eigenen Netz, ohne Cloud-DMS und ohne Drittanbieter-Postfach.',
      'Jeder fertige Scan ist über die token-gesicherte interne Schnittstelle Teil des übergreifenden Wissens-Layers und damit zusammen mit anderen Quellen durchsuchbar.',
      'Der Pfad ist fehlertolerant: greift die Bildaufbereitung nicht, landet das Original im System statt eines Abbruchs.',
    ],
    decisions: [
      {
        title: 'Klassische Bildaufbereitung vor dem Sprachmodell',
        body: 'Dokument finden und begradigen erledigt deterministische Computer-Vision verlässlicher und günstiger als ein Modell, und das in einem eigenen, separat tunebaren Dienst. Das Sprachmodell kommt erst, wenn es um Verständnis geht: Titel und Absender aus dem Volltext. So bezahlt man Modell-Leistung nur dort, wo sie wirklich zählt.',
      },
      {
        title: 'Fallback statt Fehlermeldung',
        body: 'Eine Bild-Pipeline kann an einem schlechten Foto scheitern. Statt den Upload abzuweisen, legt das System dann das Original ab. Der Nutzer bekommt immer ein Ergebnis, die Aufbereitung ist eine Verbesserung, keine Hürde.',
      },
      {
        title: 'Integration über Event-Bus und interne Such-Schnittstelle',
        body: 'Statt das Postfach als Insel zu betreiben, meldet es jeden Scan als Ereignis und stellt eine token-gesicherte interne Suche bereit. So wird der Bestand Teil des übergreifenden Wissens-Layers, ohne dass andere Dienste das rohe Backend kennen müssen.',
      },
    ],
    metrics: [
      {
        label: 'Bildaufbereitung',
        value: 'eigener Dienst, vorgelagert',
      },
      {
        label: 'Datenhaltung',
        value: 'vollständig auf eigener Hardware',
      },
      {
        label: 'Integration',
        value: 'Event-Bus und interne Suche',
      },
    ],
    lessons: [
      'Die Bildaufbereitung als eigenen Dienst zu schneiden zahlt sich aus: man sieht sofort, ob die Begradigung oder erst das OCR die Qualität kostet, und kann den Schritt isoliert tunen.',
      'Klassische Computer-Vision und ein Sprachmodell sind keine Konkurrenten, sondern teilen sich die Arbeit nach Stärke: das Modell muss nicht begradigen, die Bildaufbereitung muss nichts verstehen.',
      'Ein robuster Fallback entscheidet darüber, ob so eine Pipeline im Alltag benutzt wird oder nicht: wer einmal vor einem Abbruch steht, fotografiert nicht weiter.',
    ],
    timeline: [
      { when: '2026 H1', what: 'Bildaufbereitung als eigener vorgelagerter Dienst, dann OCR und LLM-Extraktion' },
      { when: '2026 H1', what: 'Event-Bus-Meldung je Scan und token-gesicherte interne Suche für den Wissens-Layer' },
      { when: 'danach', what: 'Aufbereitung und Extraktion Foto für Foto nachjustiert, robuster Fallback als Default' },
    ],
  },
  'news-engine': {
    problem: 'Wer mehrere Nachrichtenquellen ernst nimmt, ertrinkt in Dubletten: dasselbe Ereignis erscheint zehnfach, in mehreren Sprachen, mit unterschiedlichem Spin. Ein Aggregator, der nur Artikel zählt, belohnt den lautesten Einzelbeitrag statt den am breitesten belegten Sachverhalt. Die naheliegende Abhilfe, jeden Schritt von einem starken Sprachmodell erledigen zu lassen, ist für einen Dauerbetrieb unbezahlbar und macht die laufenden Kosten unkalkulierbar. Ich wollte das Gegenteil: eine Engine, die Storys statt Artikel versteht und deren Cloud-Rechnung im Normalbetrieb bei null liegt.',
    approach: [
      'Jeder Beitrag wird zunächst lokal und deterministisch angereichert: Sprache, Entitäten, Ort und ein Relevanzsignal, das überregionale Bedeutung von rein lokalem Rauschen trennt, bevor überhaupt Geld ausgegeben wird.',
      'Eigene Embeddings bilden die semantische Basis für ein inkrementelles Clustering: ähnliche Beiträge werden über Sprachgrenzen hinweg derselben Story zugeordnet, mit Kategorie- und Zeitfenster-Grenzen gegen falsche Verschmelzung.',
      'Ein mehrsignaliger Story-Scorer gewichtet nach Quellenzahl, Trend und Quellenqualität, sodass Mehrquellen-Belege einen einzelnen Hochscore schlagen.',
      'Ein expliziter Cost-Layer trennt billige Masse von teurer Spitze: ein Router entscheidet pro Schritt lokal oder Cloud, ein Budget-Wächter setzt harte Tages- und Monats-Caps, ein Aufruf-Logbuch hält jeden externen Aufruf fest, ein deterministischer Fallback übernimmt, sobald das starke Modell aus oder am Limit ist.',
      'Die Datenebene wurde additiv neben den Bestand gelegt und gegen eine Live-Kopie getestet, damit der Umbau zur Story-Ebene den laufenden Betrieb nicht anfasst.',
    ],
    architecture: {
      summary: 'Eingehende Beiträge laufen zuerst durch eine lokale Anreicherungs- und Filterstufe, dann über eigene Embeddings in ein inkrementelles Clustering, das sie sprach- und quellenübergreifend zu Storys bündelt; ein mehrsignaliger Scorer verdichtet jede Story, und nur die wenigen anspruchsvollen Schritte gehen über einen Cost-Layer aus Router, Budget-Wächter und Aufruf-Logbuch an ein Cloud-Modell, während ein deterministischer Fallback den Standardbetrieb ohne externe Kosten trägt.',
      tiers: [
        {
          label: 'Eingang',
          nodes: [
            {
              id: 'feeds',
              label: 'Quellen-Feeds',
              note: 'viele Herkünfte',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Lokale Vorstufe',
          nodes: [
            {
              id: 'enrich',
              label: 'Anreicherung',
              note: 'Sprache · Entitäten · Ort',
              kind: 'core',
            },
            {
              id: 'filter',
              label: 'Relevanzfilter',
              note: 'überregional vs. Rauschen',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Story-Bildung',
          nodes: [
            {
              id: 'embed',
              label: 'Eigene Embeddings',
              note: 'lokal · cross-lingual',
              kind: 'core',
            },
            {
              id: 'cluster',
              label: 'Inkrementelles Clustering',
              note: 'Story-Zuordnung',
              kind: 'core',
            },
            {
              id: 'scorer',
              label: 'Story-Scorer',
              note: 'Mehrquellen schlägt Einzel',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Cost-Layer',
          nodes: [
            {
              id: 'router',
              label: 'Modell-Router',
              note: 'lokal oder Cloud',
              kind: 'core',
            },
            {
              id: 'guard',
              label: 'Budget-Wächter',
              note: 'harte Caps',
              kind: 'core',
            },
            {
              id: 'log',
              label: 'Aufruf-Logbuch',
              kind: 'core',
            },
            {
              id: 'fallback',
              label: 'Lokaler Fallback',
              note: 'deterministisch',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Modelle & Speicher',
          nodes: [
            {
              id: 'cloud',
              label: 'Cloud-Chefredakteur',
              note: 'nur Spitze',
              kind: 'data',
            },
            {
              id: 'store',
              label: 'Story-Speicher',
              note: 'Provenienz · Kosten pro Story',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'feeds',
          to: 'enrich',
        },
        {
          from: 'enrich',
          to: 'filter',
          label: 'vor Cloud-Kosten',
        },
        {
          from: 'filter',
          to: 'embed',
        },
        {
          from: 'embed',
          to: 'cluster',
          label: 'semantisch',
        },
        {
          from: 'cluster',
          to: 'scorer',
          label: 'je Story',
        },
        {
          from: 'scorer',
          to: 'router',
          label: 'nur anspruchsvolle Schritte',
        },
        {
          from: 'router',
          to: 'cloud',
          label: 'unter Budget',
        },
        {
          from: 'router',
          to: 'fallback',
          label: 'Standard · 0 Kosten',
        },
        {
          from: 'guard',
          to: 'router',
          label: 'Cap erreicht',
        },
        {
          from: 'scorer',
          to: 'store',
          label: 'mit Provenienz',
        },
      ],
    },
    result: [
      'Die Story-Ebene ist als erste Ausbaustufe live: ähnliche Beiträge aus verschiedenen Quellen finden in einer Story zusammen, lokal Belangloses bleibt getrennt.',
      'Im Standardbetrieb fallen null externe Kosten an, weil der deterministische Fallback die Masse trägt und das Cloud-Modell nur hinter harten Caps zugeschaltet wird.',
      'Jede Story trägt ihre Herkunft und ihre Kosten mit: nachvollziehbar, welche Quellen sie stützen und ob überhaupt extern verdichtet wurde.',
      'Die Datenebene wurde additiv neben den Bestand gelegt, der laufende Betrieb blieb beim Umbau unangetastet.',
    ],
    decisions: [
      {
        title: 'Lokal als Default, Cloud als Ausnahme',
        body: 'Die teure Cloud nicht als Standard, sondern als letzte Instanz hinter Router, Budget-Wächter und Logbuch. So bleibt die Qualität dort verfügbar, wo sie zählt, ohne dass die laufende Rechnung mit der Artikelmenge skaliert.',
      },
      {
        title: 'Relevanzfilter vor jeder Ausgabe',
        body: 'Erst trennt eine lokale Stufe überregionale Bedeutung von lokalem Rauschen, dann erst entscheidet die Engine über Aufwand. Geld wird nicht für Beiträge ausgegeben, die ohnehin aussortiert werden.',
      },
      {
        title: 'Storys statt Artikel als Einheit',
        body: 'Die Verdichtung gewichtet nach Quellenzahl, Trend und Quellenqualität, damit ein breit belegter Sachverhalt vor einem einzelnen Hochscore steht. Das ist die Eigenschaft, die ein Aggregator von einer Engine unterscheidet.',
      },
    ],
    metrics: [
      {
        label: 'Externe Kosten im Standardbetrieb',
        value: '0 €',
      },
      {
        label: 'Cloud-Aufrufe',
        value: 'hinter harten Tages- und Monats-Caps',
      },
      {
        label: 'Clustering',
        value: 'cross-lingual über eigene Embeddings',
      },
      {
        label: 'Ausbaustufe',
        value: 'Story-Ebene live, weitere folgen',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Story-Ebene live: lokale Anreicherung, Clustering, mehrsignaliger Scorer, Cost-Layer',
      },
      {
        when: '2026 H1',
        what: 'Additive Datenebene gegen Live-Kopie getestet, deterministischer Fallback als Default',
      },
      {
        when: '2026 H2',
        what: 'Schärferes Story-Scoring, Stapel-Verarbeitung der Verdichtungen, Anschluss weiterer Konsumenten',
      },
    ],
    lessons: [
      'Ein Cost-Layer gehört in die Architektur, nicht in die Betriebsanleitung. Router, Budget-Wächter und Aufruf-Logbuch im Pfad zwingen die teure Cloud in die Ausnahme, statt auf Disziplin zur Laufzeit zu hoffen.',
      'Ein deterministischer Fallback ist mehr als eine Sparmaßnahme: er hält die Engine vollständig funktionsfähig, auch wenn das starke Modell aus oder am Limit ist.',
      'Wer die Datenebene additiv neben den Bestand legt und gegen eine Live-Kopie testet, baut die Story-Ebene um, ohne den laufenden Betrieb zu riskieren.',
    ],
  },
  concierge: {
    problem: 'Ein fertiger Assistent von der Stange bedeutet, jede Anfrage in die Cloud zu schicken: laufende Kosten für Triviales, Sprache und persönliches Wissen in fremder Hand, und kein verlässlicher Riegel gegen Aktionen, die etwas am System verändern. Ich wollte den Assistenten-Kern selbst besitzen: lokal betrieben, kostenbewusst nach Modell-Stufe geroutet, und so gebaut, dass eine riskante Aktion wie ein Neustart nie ohne ausdrückliche Freigabe passiert.',
    approach: [
      'Ein einheitliches Eingangs-Gateway führt Text, Sprachtranskript und API-Anfragen zusammen, ein schneller Klassifikator bestimmt die Absicht, ohne dabei selbst eine Aktion auszuführen.',
      'Ein Orchestrator entscheidet pro Anfrage über Modell-Rolle, Wissensraum und Tool-Freigabe: Alltag und Tagesbriefing laufen auf einem kleinen lokalen Modell ohne externe Kosten, anspruchsvolle Schritte gehen gezielt an ein starkes Modell.',
      'Jede Aktion läuft über genau einen Tool-Bus mit Schema-Prüfung, Inhaltsvalidierung, Timeout, Risk-Tier und einem nachvollziehbaren Audit-Log: es gibt keinen zweiten Weg, eine Aktion auszulösen.',
      'Riskante Eingriffe erzeugen statt einer Ausführung eine persistente Freigabe-Anfrage mit Ablaufzeit, die erst über einen separaten Bestätigungs-Schritt scharf wird: ein vorgetäuschtes Schon-bestätigt im Aufruf wird bewusst abgelehnt.',
      'Ein Wissens-Layer wählt pro Frage den passenden Wissensraum mit dokumentierter Begründung, ein inkrementeller Briefing-Pool hält Kandidaten nach Frische, Quelle und Feedback aktuell.',
    ],
    architecture: {
      summary: 'Eingaben aus Sprache, Text und API treffen auf ein gemeinsames Gateway, ein Intent-Schritt klassifiziert ohne auszuführen, ein Orchestrator wählt Modell-Stufe und Wissensraum, und jede Aktion läuft ausschließlich über einen Tool-Bus mit Risk-Tier und Audit: riskante Aktionen erzeugen eine persistente Freigabe statt einer sofortigen Ausführung, der Wissens-Layer und der Briefing-Pool liefern Kontext.',
      tiers: [
        {
          label: 'Eingang',
          nodes: [
            {
              id: 'voice',
              label: 'Sprach-Eingang',
              note: 'Transkript',
              kind: 'edge',
            },
            {
              id: 'text',
              label: 'Text- und API-Eingang',
              kind: 'edge',
            },
            {
              id: 'gateway',
              label: 'Eingangs-Gateway',
              note: 'vereinheitlicht',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Entscheidung',
          nodes: [
            {
              id: 'intent',
              label: 'Intent-Klassifikation',
              note: 'führt nichts aus',
              kind: 'core',
            },
            {
              id: 'orchestrator',
              label: 'Orchestrator',
              note: 'Modell-Rolle und Wissensraum',
              kind: 'core',
            },
            {
              id: 'toolbus',
              label: 'Tool-Bus',
              note: 'Schema, Risk-Tier, Audit',
              kind: 'core',
            },
            {
              id: 'approval',
              label: 'Freigabe-Stelle',
              note: 'persistent, mit Ablauf',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Modell-Stufen',
          nodes: [
            {
              id: 'small',
              label: 'Lokales Modell',
              note: 'Alltag, Briefing',
              kind: 'consumer',
            },
            {
              id: 'large',
              label: 'Starkes Modell',
              note: 'Anspruchsvolles',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Wissen und Kontext',
          nodes: [
            {
              id: 'rag',
              label: 'Wissens-Layer',
              note: 'Raum pro Frage',
              kind: 'data',
            },
            {
              id: 'briefing',
              label: 'Briefing-Pool',
              note: 'Scoring, Verdrängung',
              kind: 'data',
            },
            {
              id: 'audit',
              label: 'Audit-Log',
              note: 'jede Aktion',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'voice',
          to: 'gateway',
          label: 'Transkript',
        },
        {
          from: 'text',
          to: 'gateway',
        },
        {
          from: 'gateway',
          to: 'intent',
          label: 'klassifiziert',
        },
        {
          from: 'intent',
          to: 'orchestrator',
          label: 'Absicht',
        },
        {
          from: 'orchestrator',
          to: 'small',
          label: 'Alltag, lokal',
        },
        {
          from: 'orchestrator',
          to: 'large',
          label: 'gezielt extern',
        },
        {
          from: 'orchestrator',
          to: 'rag',
          label: 'Wissensraum',
        },
        {
          from: 'orchestrator',
          to: 'toolbus',
          label: 'Aktion',
        },
        {
          from: 'toolbus',
          to: 'approval',
          label: 'wenn riskant',
        },
        {
          from: 'toolbus',
          to: 'audit',
          label: 'protokolliert',
        },
      ],
    },
    result: [
      'Triviales und das Tagesbriefing laufen auf dem lokalen Modell ohne externe Kosten, das starke Modell wird nur für die wenigen anspruchsvollen Schritte gezogen.',
      'Riskante Aktionen wie ein Host-Neustart können ohne ausdrückliche, separate Freigabe nicht ausgeführt werden, auch nicht durch einen Client, der eine Bestätigung vortäuscht.',
      'Jede ausgeführte Aktion liegt nachvollziehbar im Audit-Log, der Wissens-Layer wählt den Raum pro Frage mit dokumentierter Begründung.',
      'Der Gesundheits-Check trennt ehrlich zwischen Pflicht-Bausteinen und optionalen Upstreams: fällt ein optionaler Dienst aus, gilt der lokale Sprachkern weiter als gesund statt fälschlich als defekt.',
    ],
    decisions: [
      {
        title: 'Genau ein Weg für Aktionen',
        body: 'Aktionen laufen ausschließlich über den Tool-Bus mit Schema, Validierung, Timeout, Risk-Tier und Audit. Der Klassifikator führt bewusst nichts aus. So gibt es keine zweite, ungeprüfte Tür, durch die eine Aktion schlüpfen könnte.',
      },
      {
        title: 'Freigabe statt Vertrauen',
        body: 'Riskante Tools liefern statt einer Ausführung eine persistente Freigabe-Anfrage mit Ablaufzeit, scharf erst über einen getrennten Bestätigungs-Schritt. Ein im Aufruf vorgetäuschtes Schon-bestätigt wird abgelehnt, damit der Freigabe-Pfad nicht umgangen werden kann.',
      },
      {
        title: 'Kosten über Modell-Stufen, nicht über Sparmodus',
        body: 'Statt pauschal alles in die Cloud zu schicken, entscheidet der Orchestrator pro Anfrage: lokales Modell für Alltag und Briefing, starkes Modell nur dort, wo Qualität zählt. Kostenkontrolle entsteht aus der Architektur, nicht aus einem nachgelagerten Limit.',
      },
    ],
    lessons: [
      'Ein einziger Ausführungs-Pfad für Aktionen ist mehr wert als viele einzelne Sicherheitsabfragen: was nur durch eine Tür kann, lässt sich an einer Stelle prüfen und protokollieren.',
      'Health-Checks müssen Pflicht- und Kann-Abhängigkeiten trennen, sonst meldet ein optionaler Ausfall fälschlich den ganzen Kern als kaputt.',
      'Wenn vor dem Modell-Aufruf bereits lokal und deterministisch entschieden wird, was teuer beantwortet werden muss, bleiben die Kosten von selbst niedrig.',
    ],
    metrics: [
      { label: 'Modell-Stufen', value: 'lokal für Alltag · stark nur gezielt' },
      { label: 'Aktions-Pfad', value: 'ein Tool-Bus · Schema · Risk-Tier · Audit' },
      { label: 'Riskante Aktion', value: 'persistente Freigabe mit Ablauf' },
      { label: 'Eingänge', value: 'Sprache · Text · API vereinheitlicht' },
    ],
    timeline: [
      { when: '2026 H1', what: 'Eingangs-Gateway, Intent-Klassifikation und Tool-Bus mit Audit stehen' },
      { when: '2026 H1', what: 'Modell-Stufen lokal/stark, riskante Aktionen nur über persistente Freigabe' },
      { when: '2026 H2', what: 'Wissens-Layer pro Frage und inkrementeller Briefing-Pool angebunden' },
      { when: 'danach', what: 'Weitere Tools und Wissensräume hängen sich an denselben geprüften Pfad' },
    ],
  },
  'defense-in-depth': {
    problem: 'Eine selbstbetriebene Infrastruktur ist nur so sicher wie ihre schwächste Schicht. Wer nur ein paar Header setzt oder eine Firewall davorstellt, hat einen Layer gehärtet und alle anderen offen gelassen: privilegierte Container, flache Netze, geteilte Identität, ungetestete Backups. Ich wollte das Gegenteil, eine Verteidigung, die über Container, Netz, Edge, Identität und Wiederanlauf zusammenhängt, dokumentiert pro Ausnahme statt punktuell, und betriebsreif statt einmalig konfiguriert.',
    approach: [
      'Container minimal-privilegiert als Standard: read-only Root, gedroppte Capabilities, kein Root, keine neuen Privilegien. Docker-Zugriff nur über eingeschränkte Proxies, jede Ausnahme begründet und in einem Inventar geführt statt versteckt.',
      'Netz in Zonen geschnitten (Ingress, Brain, Apps, Ops) mit einer Regel pro Container. Ein eigener Wächter streamt Verbindungsaufbauten gegen eine genehmigte Whitelist und meldet jeden nicht autorisierten Join in Echtzeit; sensible Dienst-zu-Dienst-Pfade sind zusätzlich beidseitig per mTLS-Sidecar authentifiziert.',
      'Identität zentral über Authelia (SSO/OIDC), Anmeldeschutz mit Sperrzeiten und ein Real-IP-Fix, damit hinter dem Edge die echte Client-Adresse protokolliert wird statt der Tunnel-Adresse.',
      'Angriffserkennung am Rand mit Crowdsec, bewusst detection-only: Auffälligkeiten laufen über den eigenen Event-Bus als Push, automatisches Sperren bleibt an eine manuelle Freigabe gebunden, um Selbstschaden an produktiver Infrastruktur auszuschließen.',
      'Verschlüsseltes Off-Site-Backup (restic) pro Host mit getrennten Repos und einem wiederkehrenden Restore-Drill, damit Wiederherstellung erprobt ist statt nur dokumentiert.',
    ],
    architecture: {
      summary: 'Identität und Zugang werden am Edge terminiert und über SSO geprüft, bevor Anfragen die in Zonen geschnittenen Dienste erreichen; jeder Dienst läuft minimal-privilegiert mit Docker-Zugriff nur über einen Proxy, während eine Detektions-Schicht aus Netz-Wächter und Angriffserkennung Auffälligkeiten über den Event-Bus als Push meldet und eine Resilienz-Schicht aus verschlüsseltem Off-Site-Backup und Restore-Drill quer darunter liegt.',
      tiers: [
        {
          label: 'Edge & Identität',
          nodes: [
            {
              id: 'edge',
              label: 'Edge-Terminierung',
              note: 'Real-Client-IP',
              kind: 'edge',
            },
            {
              id: 'sso',
              label: 'SSO / OIDC',
              note: 'Authelia · Anmeldeschutz',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Gehärtete Dienste',
          nodes: [
            {
              id: 'zones',
              label: 'Netz-Zonen',
              note: 'eine Regel pro Container',
              kind: 'core',
            },
            {
              id: 'minpriv',
              label: 'Minimal-Privileg',
              note: 'read-only · kein Root',
              kind: 'core',
            },
            {
              id: 'socket',
              label: 'Socket-Proxy',
              note: 'Ausnahmen-Inventar',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Detektion',
          nodes: [
            {
              id: 'watcher',
              label: 'Netz-Wächter',
              note: 'Whitelist · Echtzeit',
              kind: 'core',
            },
            {
              id: 'ids',
              label: 'Angriffserkennung',
              note: 'Crowdsec · detection-only',
              kind: 'core',
            },
            {
              id: 'bus',
              label: 'Event-Bus',
              note: 'Push bei Freigabe',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Resilienz',
          nodes: [
            {
              id: 'backup',
              label: 'Off-Site-Backup',
              note: 'restic · verschlüsselt',
              kind: 'data',
            },
            {
              id: 'drill',
              label: 'Restore-Drill',
              note: 'wiederkehrend',
              kind: 'data',
            },
            {
              id: 'audit',
              label: 'Audit-Stream',
              note: 'Langzeit-Retention',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'edge',
          to: 'sso',
          label: 'Auth vor Zugriff',
        },
        {
          from: 'sso',
          to: 'zones',
          label: 'nur Erlaubtes',
        },
        {
          from: 'watcher',
          to: 'bus',
          label: 'nicht autorisierter Join',
        },
        {
          from: 'ids',
          to: 'bus',
          label: 'Erkennung ohne Auto-Bann',
        },
        {
          from: 'backup',
          to: 'drill',
          label: 'getestete Wiederherstellung',
        },
      ],
    },
    result: [
      'Container-Härtung über die gesamte Flotte effektiv abgeschlossen, verbleibende Ausnahmen als Dauerausnahmen begründet und in einem Inventar geführt statt stillschweigend toleriert.',
      'Netz in vier Zonen segmentiert mit einer Regel pro Container, Drift-Erkennung über mehrere Hosts live, nicht autorisierte Verbindungen melden sich in Echtzeit auf dem Event-Bus.',
      'Zentrales SSO mit verschärftem Anmeldeschutz und echtem Client-IP-Logging hinter dem Edge, Audit-relevante Dienste mit Langzeit-Retention im Audit-Stream.',
      'Verschlüsseltes Off-Site-Backup pro Host mit getrennten Repos und automatisiertem Restore-Drill, Wiederherstellung erprobt statt nur geplant.',
    ],
    decisions: [
      {
        title: 'Detection-only statt automatischem Sperren',
        body: 'Angriffserkennung am Rand läuft bewusst ohne aktiven Sperr-Mechanismus. Ein scharfer Auto-Bann hinter dem Edge hätte bei falsch protokollierter Quell-Adresse den eigenen Tunnel oder produktive Dienste lahmlegen können. Erkennung und Push-Meldung sind live, das aktive Bannen bleibt an eine bewusste Freigabe gebunden, Erkennung ohne Selbstschaden.',
      },
      {
        title: 'Härtung in Wellen mit Ausnahmen-Inventar',
        body: 'Statt eines Big-Bang adressiert jede Welle eine klar abgegrenzte Container-Klasse. Images, die sich nicht read-only betreiben lassen, werden als Dauerausnahmen mit Begründung geführt statt die Härtung daran scheitern zu lassen. Eine dokumentierte Ausnahme ist ehrlicher als eine stille.',
      },
      {
        title: 'mTLS-Sidecar deployed, Scharfschaltung als eigener Schritt',
        body: 'Der Edge-Sidecar für gegenseitige TLS-Authentifizierung steht bereit, der Pflicht-Modus wird aber erst nach kontrolliertem Zertifikats-Rollout an die Geräte aktiviert. Eine Authentifizierungsschicht scharf zu schalten, bevor alle legitimen Clients ein Zertifikat haben, sperrt zuerst sich selbst aus, deshalb ist der Cutover bewusst ein separater, geplanter Schritt.',
      },
    ],
    metrics: [
      {
        label: 'Härtungs-Wellen',
        value: '3 Wellen, abgeschlossen',
      },
      {
        label: 'Netz-Zonen',
        value: '4, je eine Regel pro Container',
      },
      {
        label: 'Angriffserkennung',
        value: 'detection-only, Push bei Freigabe',
      },
      {
        label: 'Off-Site-Backup',
        value: 'verschlüsselt, mit Restore-Drill',
      },
    ],
    timeline: [
      {
        when: '2025',
        what: 'Container-Härtung in Wellen, Netz-Segmentierung, Ausnahmen-Inventar',
      },
      {
        when: '2026 H1',
        what: 'SSO-Verschärfung, Real-IP-Fix, Audit-Stream, Drift-Wächter über mehrere Hosts',
      },
      {
        when: '2026 H1',
        what: 'Angriffserkennung am Edge (detection-only) auf den Event-Bus, verschlüsseltes Off-Site-Backup mit Restore-Drill',
      },
      {
        when: 'als Nächstes',
        what: 'mTLS-Pflicht nach Zertifikats-Rollout, aktiver Sperr-Mechanismus nach Beobachtungsphase und Freigabe',
      },
    ],
    lessons: [
      'Sicherheit ist kein Feature, sondern eine Eigenschaft jeder Schicht. Eine einzige gehärtete Stelle bei offenem Rest ist ein falsches Gefühl von Sicherheit.',
      'Erkennung darf nichts kaputt machen. Detection-only mit Mensch in der Schleife schützt produktive Infrastruktur vor dem Eigentor eines übereifrigen Auto-Banns.',
      'Ein Backup, das nie zurückgespielt wurde, ist eine Vermutung. Erst der wiederkehrende Restore-Drill macht aus gehofft erprobt.',
      'Auch die Wiederherstellung braucht eine zweite Meinung: ein unabhängiger Außenposten, der Backups und Erreichbarkeit von außerhalb des Verbunds gegenprüft, fängt den Fall, in dem der Verbund selbst nicht mehr Bescheid geben kann.',
    ],
  },
  'ops-cockpit': {
    problem: 'Eine wachsende Flotte aus mehreren Hosts steuert man irgendwann nicht mehr per SSH und Dashboard-Hopping. Wer wissen will, was gerade läuft, müsste sich auf jeden Host einzeln einloggen, Auslastung und Temperatur einzeln ablesen, Container einzeln neu starten. Genau dieser Reflex, für Bequemlichkeit eine Host-Shell freizugeben, ist auch das größte Sicherheitsrisiko. Ich wollte eine zentrale Betreiber-Sicht über die ganze Flotte, bei der Härtung konsequent vor Komfort steht.',
    approach: [
      'Eine eigene Oberfläche als Kontrollebene über die Flotte: Live-Metriken aller Hosts via Prometheus (Auslastung, Temperatur, Speicher, Platte), Service-Steuerung und Container-Logs an einer Stelle.',
      'Zugriff auf jeden Host nie direkt, sondern über einen gehärteten Docker-Socket-Proxy mit minimalen Rechten und abgeschaltetem Container-Exec, sodass aus der Steuerung kein Einstiegspunkt wird.',
      'Den Zugriff auf genau eine Steuerebene firewall-sperren, auf der Kette, die veröffentlichte Container-Ports tatsächlich greift, und die Sperre setzen, bevor die Zwischenschicht überhaupt erreichbar ist.',
      'Die Sperre als systemd-verankerten Dienst an den Container-Stack koppeln, damit sie Reboot und Neustart übersteht, statt nach jedem Hochfahren ein Expositionsfenster zu öffnen.',
      'Drift zwischen erwartetem und tatsächlichem Service-Zustand erkennen, aber bewusst stillgelegte Dienste als solche respektieren statt als Alarm zu werten.',
    ],
    architecture: {
      summary: 'Der Browser spricht nur mit der eigenen Oberfläche, die serverseitig Metriken und Service-Status zusammenträgt; jeder Zugriff auf einen Host läuft über eine gehärtete Zwischenschicht ohne Container-Exec, die auf genau eine Steuerebene firewall-gesperrt und reboot-fest verankert ist, während eine Metrik-Quelle pro Host die Live-Werte liefert und eine Service-Map als Soll-Zustand den Drift-Abgleich speist.',
      tiers: [
        {
          label: 'Browser',
          nodes: [
            {
              id: 'ui',
              label: 'Kontroll-Oberfläche',
              note: 'Next.js · Metriken · Logs',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Steuerebene',
          nodes: [
            {
              id: 'control',
              label: 'Steuer-Backend',
              note: 'serverseitiger Zugriff',
              kind: 'core',
            },
            {
              id: 'drift',
              label: 'Drift-Abgleich',
              note: 'Soll gegen Ist',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Gehärteter Zugriff',
          nodes: [
            {
              id: 'proxy',
              label: 'Socket-Zwischenschicht',
              note: 'Docker-Socket-Proxy · kein Exec',
              kind: 'core',
            },
            {
              id: 'fw',
              label: 'Firewall-Lockdown',
              note: 'eine Quelle, reboot-fest',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Pro Host',
          nodes: [
            {
              id: 'metrics',
              label: 'Metrik-Quelle',
              note: 'Prometheus · Auslastung · Temp',
              kind: 'data',
            },
            {
              id: 'services',
              label: 'Container-Dienste',
              kind: 'consumer',
            },
            {
              id: 'map',
              label: 'Service-Map',
              note: 'erwarteter Zustand',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'ui',
          to: 'control',
          label: 'nur eigene Oberfläche',
        },
        {
          from: 'control',
          to: 'proxy',
          label: 'hinter Lockdown',
        },
        {
          from: 'fw',
          to: 'proxy',
          label: 'eine Quelle erlaubt',
        },
        {
          from: 'proxy',
          to: 'services',
          label: 'Steuerung ohne Exec',
        },
        {
          from: 'metrics',
          to: 'control',
          label: 'Live-Werte',
        },
        {
          from: 'map',
          to: 'drift',
          label: 'Soll-Abgleich',
        },
      ],
    },
    result: [
      'Eine zentrale Betreiber-Sicht über die ganze Flotte: Live-Metriken, Service-Steuerung und Container-Logs aller Hosts an einer Stelle, ohne Einzel-Login.',
      'Remote-Steuerung ausschließlich über die gehärtete Zwischenschicht: Exec abgeschaltet, Zugriff firewall-gesperrt auf eine Steuerebene, Fremdzugriff blockiert.',
      'Der Lockdown übersteht Reboot und Neustart, weil er an den Container-Stack gekoppelt ist und vor der Zwischenschicht greift, statt erst danach.',
      'Drift-Erkennung, die bewusst stillgelegte Dienste respektiert: die Zahl der Fehlalarme aus erwarteten Stilllegungen wurde auf null gebracht.',
    ],
    decisions: [
      {
        title: 'Härtung vor Komfort: keine Host-Shell',
        body: 'Ein Remote-Terminal wäre bequem und ist genau deshalb gefährlich. Die Oberfläche steuert Dienste und liest Logs, aber sie öffnet bewusst keine Shell und schaltet Container-Exec ab. Komfort, der die Angriffsfläche aufmacht, bleibt draußen.',
      },
      {
        title: 'Lockdown auf der richtigen Kette, reboot-fest',
        body: 'Veröffentlichte Container-Ports umgehen die übliche Host-Firewall, deshalb sitzt die Sperre auf der Kette, die für Container-Verkehr wirklich greift, und lässt nur eine Steuerebene durch. Als systemd-verankerter Dienst an den Container-Stack gekoppelt übersteht sie Reboot und Neustart, statt nach jedem Hochfahren ein Fenster zu öffnen.',
      },
      {
        title: 'Drift respektiert erwarteten Zustand',
        body: 'Ein gestoppter Dienst ist nicht automatisch ein Fehler. Die Service-Map trägt den Soll-Zustand inklusive bewusster Stilllegungen, der Abgleich wertet nur echte Abweichungen als Drift. So bleibt die Anzeige ehrlich statt verrauscht.',
      },
    ],
    metrics: [
      {
        label: 'Steuerung',
        value: 'Multi-Host, eine Oberfläche',
      },
      {
        label: 'Remote-Zugriff',
        value: 'ohne Container-Exec',
      },
      {
        label: 'Lockdown',
        value: 'reboot-fest, eine Quelle',
      },
      {
        label: 'Fehlalarme',
        value: '0, dauerhaft',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Kontroll-Oberfläche mit Live-Metriken aller Hosts, server-seitiger Zugriff',
      },
      {
        when: '2026 H1',
        what: 'Remote-Steuerung und Logs über gehärtete Zwischenschicht, Firewall-Lockdown reboot-fest verankert',
      },
      {
        when: '2026 H2',
        what: 'Drift- und Ghost-Erkennung mit Respekt vor erwartetem Zustand, weiter wachsende Flotte angebunden',
      },
    ],
    lessons: [
      'Veröffentlichte Container-Ports umgehen die übliche Host-Firewall. Wer sie für sicher hält, hat eine Lücke offen, die kein klassisches Firewall-Kommando schließt.',
      'Eine Sperre, die einen Reboot nicht übersteht, ist keine Sperre. Persistenz gehört an den Container-Stack gekoppelt, nicht von Hand nachgezogen.',
      'Drift-Erkennung ist nur so viel wert wie ihr Soll-Zustand. Ohne Respekt vor bewussten Stilllegungen produziert sie Rauschen, an dem man irgendwann vorbeischaut.',
    ],
  },
  gartiko: {
    problem: 'Pflanzen-Pflege-Wissen lebte verstreut: in einem Community-Bot, in Notizen, in Köpfen. Wer eine Pflanze pflegt, braucht Bestand, Pflegephasen und Wissen an einer Stelle, und zwar als öffentlich erreichbares Produkt, nicht als internes Werkzeug. Gleichzeitig darf ein öffentliches Portal auf eigener Infrastruktur keine Verwaltungsfläche nach außen zeigen: der Betrieb muss exponierbar sein, ohne die Pflege-Oberfläche mit zu exponieren.',
    approach: [
      'Web-Portal (PHP hinter Apache) und Community-Bot teilen sich denselben Unterbau: eine gemeinsame SQLite-Datenbank als Wissensbasis, sodass Inhalte einmal gepflegt werden und an beiden Oberflächen ankommen.',
      'Ein Arten-Atlas als Pflege-Rückgrat: pro Pflanzenart liegen Pflege-Vorgaben (Höhenbereich, Wachstumskurve, Phasen) hinterlegt, aus denen ein Arten-Picker beim Anlegen sinnvolle Voreinstellungen zieht statt leerer Felder. Der Atlas ist von einer Handvoll auf dutzende Arten gewachsen.',
      'Derselbe Atlas speist die Community-Auskunft: Fragen werden artgenau aus den hinterlegten Daten beantwortet statt pauschal, und für Arten ohne eigenen Eintrag wird das ehrlich als solches ausgewiesen.',
      'Der öffentliche Teil läuft hinter einem Tunnel-Edge auf eigener Infrastruktur: keine offenen Ports am Heim-Anschluss, TLS und Schutzschicht am Rand, und in der PHP-Runtime selbst sind gefährliche Funktionen (exec, shell_exec und Co.) hart abgeschaltet.',
      'Der Admin-Pfad wird bereits am öffentlichen Rand hart abgewiesen und ist nur aus dem eigenen Netz erreichbar: die Trennung sitzt in der Route, nicht in einem Login-Formular.',
      'Bestände, Pflegephasen und Erinnerungen sind als eigenes Datenmodell geschnitten, damit das Portal generisch für Pflanzen aller Art trägt statt an einer Nische zu kleben.',
    ],
    architecture: {
      summary:
        'Besucher erreichen das Portal über einen Tunnel-Edge, der TLS terminiert und den Admin-Pfad abweist. Dahinter liegt die Web-Anwendung, die sich Datenbank und Wissensbasis mit dem Community-Bot teilt. Die Pflege-Oberfläche ist nur aus dem eigenen Netz erreichbar.',
      tiers: [
        {
          label: 'Öffentlich',
          nodes: [
            { id: 'visitor', label: 'Besucher', kind: 'edge' },
            { id: 'edge', label: 'Tunnel-Edge', note: 'TLS · Admin-Pfad geblockt', kind: 'edge' },
          ],
        },
        {
          label: 'Anwendung',
          nodes: [
            { id: 'web', label: 'Web-Portal', note: 'PHP · Apache', kind: 'core' },
            { id: 'bot', label: 'Community-Bot', note: 'gleiche Wissensbasis', kind: 'core' },
          ],
        },
        {
          label: 'Daten',
          nodes: [
            { id: 'db', label: 'Datenbank', note: 'SQLite · Bestände + Phasen', kind: 'data' },
            { id: 'wissen', label: 'Wissensbasis', note: 'kuratiert', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'visitor', to: 'edge', label: 'HTTPS' },
        { from: 'edge', to: 'web', label: 'nur öffentliche Routen' },
        { from: 'web', to: 'db' },
        { from: 'web', to: 'wissen', label: 'liest kuratiert' },
        { from: 'bot', to: 'wissen', label: 'gleiche Quelle' },
      ],
    },
    result: [
      'Das Portal ist öffentlich unter eigener Domain erreichbar und läuft vollständig auf eigener Infrastruktur.',
      'Web-Oberfläche und Community-Bot schöpfen aus derselben Wissensbasis, Inhalte werden einmal gepflegt statt doppelt.',
      'Der Arten-Atlas trägt inzwischen dutzende Pflanzenarten mit hinterlegten Pflege-Vorgaben; der Arten-Picker macht daraus beim Anlegen sinnvolle Voreinstellungen statt leerer Felder.',
      'Der Admin-Bereich ist von außen nicht erreichbar: die Grenze sitzt am Edge, nicht im Anmeldeformular.',
    ],
    decisions: [
      {
        title: 'Generisch statt Nische',
        body: 'Das Datenmodell ist bewusst für Pflanzen aller Art geschnitten. Ein generisches Modell trägt jede künftige Ausrichtung, ein Nischen-Modell hätte beim ersten Pivot einen Umbau erzwungen.',
      },
      {
        title: 'Arten-Atlas als Pflege-Rückgrat',
        body: 'Statt Pflege-Werte pro Pflanze frei eintippen zu lassen, liegen sie pro Art im Atlas: Höhe, Wachstumskurve, Phasen. Der Arten-Picker zieht daraus Voreinstellungen, und dieselben Daten machen die Community-Auskunft artgenau statt pauschal. Eine Quelle, zwei Nutzungen.',
      },
      {
        title: 'Admin-Sperre am Rand statt in der App',
        body: 'Der Verwaltungs-Pfad wird schon am öffentlichen Edge abgewiesen. Ein Login-Formular wäre eine Angriffsfläche gewesen; eine Route, die von außen nicht existiert, ist keine.',
      },
      {
        title: 'Ein Unterbau für zwei Oberflächen',
        body: 'Bot und Portal teilen sich Wissensbasis und Betrieb. Zwei getrennte Systeme hätten doppelte Pflege bedeutet und wären inhaltlich auseinandergelaufen.',
      },
    ],
    timeline: [
      { when: 'H1 2026', what: 'Portal öffentlich unter eigener Domain, Edge-Härtung' },
      { when: 'Q2 2026', what: 'Generisches Pflanzen-Datenmodell, Community-Anschluss' },
      { when: 'Q2 2026', what: 'Arten-Atlas mit Pflege-Vorgaben, Arten-Picker, artgenaue Auskunft' },
      { when: 'danach', what: 'weitere Pflege-Domänen und Arten auf demselben Unterbau' },
    ],
    metrics: [
      { label: 'Erreichbarkeit', value: 'öffentlich · eigene Domain · eigene Infrastruktur' },
      { label: 'Arten-Atlas', value: 'dutzende Arten mit Pflege-Vorgaben' },
      { label: 'Wissensbasis', value: 'eine Quelle · Portal + Bot' },
      { label: 'Admin', value: 'am Edge geblockt · nur eigenes Netz' },
    ],
    lessons: [
      'Ein öffentliches Produkt auf eigener Infrastruktur ist machbar, wenn die Verwaltungsfläche von Anfang an nicht mit exponiert wird.',
      'Zwei Oberflächen auf einer Wissensbasis halten Inhalte ehrlich: was der Bot weiß, zeigt auch das Portal, und umgekehrt.',
      'Pflege-Vorgaben pro Art zu hinterlegen schlägt freie Eingabefelder: der Nutzer startet mit sinnvollen Werten, und dieselben Daten tragen zugleich die artgenaue Auskunft.',
    ],
  },
  'home-digital-twin': {
    problem: 'Home Assistant trägt eine starke Datenbasis, aber das mitgelieferte Frontend bleibt eine endlose Karten-Wand: Schalter, Sensoren und Verläufe stapeln sich in Listen, während das eigentliche Objekt, das Haus, nirgends vorkommt. Ein Haus ist räumlich gedacht: Wohnzimmer, Küche, Büro, Etagen, und die Bedienung sollte dieser Geografie folgen statt einer Entity-Tabelle. Ich wollte das eigene Zuhause wirklich sehen, nicht abtippen: in 2D zum schnellen Bedienen im Alltag, in 3D für den räumlichen Überblick über Räume und Etagen, und beides auf demselben Live-Status, nicht auf zwei auseinanderlaufenden Wahrheiten. Die Schwierigkeit liegt weniger im Rendern als in der Trennung: Layout-Wissen (welcher Raum, welche Etage, wo steht das Gerät) gehört der Oberfläche, Geräte-Wahrheit (an, aus, Temperatur) gehört der Heimautomation. Wer beides vermischt, baut ein Frontend, das bei jedem neuen Gerät umgebaut werden muss.',
    approach: [
      'Ein eigenständiges Web-Frontend mit zwei austauschbaren Raum-Modi auf einer gemeinsamen Datenschicht: 2D-Grundriss für die schnelle Alltags-Bedienung, 3D-Szene für Raum- und Etagenwechsel. Kein Modus ist eine Insel, beide zeigen denselben Live-Status.',
      'Ein Backend als Auth-Kapsel: Der Zugriffs-Token zur Heimautomation bleibt serverseitig, der Browser sieht ihn nie. Das Backend fängt Snapshots in eigener Persistenz ab und liefert Klima- und Status-Verläufe pro Raum, vergleichbar über mehrere Räume.',
      'Live-Brücke per WebSocket statt Polling: Statuswechsel werden in dem Moment sichtbar, in dem sie passieren. Smart Home soll sich smart anfühlen, Lichter springen sofort um, nicht in Sekunden-Sprüngen.',
      'Dynamisches Entity-Mapping zur Laufzeit: Neue Geräte tauchen von selbst auf und lassen sich per Drag-and-Drop in den Raum stellen. Das Layout ist Daten, kein Code, neue Räume und neue Geräte fügen sich an, ohne dass Bestehendes angefasst wird.',
      'Bewusste Schichtgrenze: Layout-Wissen lebt im Twin, Geräte-Wahrheit bleibt in der Heimautomation. Der Twin erfindet keinen zweiten Geräte-Zustand, er stellt den vorhandenen räumlich dar.',
    ],
    architecture: {
      summary: 'Das Frontend zeigt Haus und Geräte in 2D und 3D auf derselben Datenschicht. Ein Twin-Backend hält den Zugriffs-Token serverseitig, persistiert Snapshots für Klima-Verläufe und trägt allein das Layout-Wissen über Räume und Etagen, während eine WebSocket-Brücke Statuswechsel aus der Heimautomation ohne Polling sofort sichtbar macht. Steuerbefehle laufen denselben Weg zurück, der Browser berührt nie direkt die Geräte-Quelle.',
      tiers: [
        {
          label: 'Frontend',
          nodes: [
            {
              id: 'plan',
              label: '2D-Grundriss',
              note: 'Alltags-Bedienung',
              kind: 'edge',
            },
            {
              id: 'scene',
              label: '3D-Szene',
              note: 'räumlicher Überblick',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Twin-Backend',
          nodes: [
            {
              id: 'authcap',
              label: 'Auth-Kapsel',
              note: 'Token serverseitig',
              kind: 'core',
            },
            {
              id: 'snap',
              label: 'Snapshot-Persistenz',
              note: 'Klima-Verläufe',
              kind: 'core',
            },
            {
              id: 'layout',
              label: 'Layout-Modell',
              note: 'Räume, Etagen, Drag-and-Drop',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Live-Brücke',
          nodes: [
            {
              id: 'ws',
              label: 'WebSocket-Brücke',
              note: 'kein Polling',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Geräte-Wahrheit',
          nodes: [
            {
              id: 'ha',
              label: 'Heimautomation',
              note: 'Single Source der Geräte',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'plan',
          to: 'authcap',
          label: 'Steuerbefehl',
        },
        {
          from: 'authcap',
          to: 'ws',
        },
        {
          from: 'ws',
          to: 'ha',
          label: 'Token gekapselt',
        },
        {
          from: 'ha',
          to: 'scene',
          label: 'Live-Status',
        },
        {
          from: 'snap',
          to: 'plan',
          label: 'Klima-Verlauf',
        },
      ],
    },
    result: [
      'Räumliche Sicht aufs Haus in 2D und 3D, beide Modi auf demselben Live-Status statt zwei getrennter Wahrheiten.',
      'Klima-Verläufe pro Raum, vergleichbar über mehrere Räume, weil die Snapshots serverseitig liegen und das Frontend kein eigenes Caching erfinden muss.',
      'Direkte Geräte-Steuerung im Grundriss, ohne Wechsel in Subseiten: kein erst suchen, dann bedienen.',
      'Saubere Trennung zwischen Layout-Wissen im Twin und Geräte-Wahrheit in der Heimautomation, sodass neue Räume und neue Geräte sich anfügen, ohne dass Bestehendes umgebaut wird.',
      'Der Zugriffs-Token verlässt nie den Server: das Frontend steuert über die Auth-Kapsel, statt selbst Anmeldedaten zu tragen.',
    ],
    decisions: [
      {
        title: 'Eigenes Frontend statt Custom-Card im Heimautomations-Stack',
        body: 'Eingebettete Custom-Cards bleiben innerhalb der Schranken ihrer Plattform: begrenzte Layout-Engine, kein echtes 3D, eingeschränkte Interaktion. Ein eigenständiges Frontend gibt volle Kontrolle über Layout-Modell, Szenen-Rendering und Bedienlogik. Die Mehr-Investition zahlt sich in Spielraum aus, der später nicht nachverhandelt werden muss.',
      },
      {
        title: '2D und 3D im selben System statt entweder-oder',
        body: '2D ist das Alltags-Werkzeug, schnell und nah an der Hand. 3D ist der Überblick und der Aha-Moment für Besucher. Beides ist sinnvoll, und weil beide Modi auf derselben Datenschicht sitzen, kostet die zweite Darstellung kein zweites Datenmodell, nur eine zweite Ansicht.',
      },
      {
        title: 'Backend als Auth-Kapsel statt Token im Browser',
        body: 'Der Zugriffs-Token zur Heimautomation gehört nicht in den Client. Serverseitig gekapselt sieht ihn der Browser nie, und dasselbe Backend persistiert nebenbei die Snapshots: Verläufe sind verfügbar, ohne dass das Frontend Zustandshaltung und Caching neu erfinden muss.',
      },
      {
        title: 'WebSocket statt Polling',
        body: 'Ein periodischer Abruf fühlt sich träge an und produziert Last für Stillstand. Über eine ereignisgetriebene Live-Brücke wechselt ein Licht im Grundriss in dem Moment, in dem es real schaltet. Genau diese Unmittelbarkeit ist der Unterschied zwischen Dashboard und Bedienfläche.',
      },
      {
        title: 'Layout als Daten, nicht als Code',
        body: 'Geräte-Platzierung und Raumzuschnitt sind Konfiguration zur Laufzeit, kein Quelltext. Neue Geräte erscheinen automatisch und werden per Drag-and-Drop verortet. Das hält die Grenze sauber: was sich oft ändert (Layout) ist editierbar, was stabil ist (Pipeline) bleibt Code.',
      },
    ],
    metrics: [
      {
        label: 'Darstellung',
        value: '2D-Grundriss und 3D-Szene',
      },
      {
        label: 'Live-Brücke',
        value: 'WebSocket, ereignisgetrieben',
      },
      {
        label: 'Layout',
        value: 'Drag-and-Drop, Auto-Import zur Laufzeit',
      },
      {
        label: 'Verläufe',
        value: 'Klima pro Raum, serverseitig persistiert',
      },
    ],
    timeline: [
      {
        when: 'Q1 2026',
        what: '2D-Grundriss, Backend als Auth-Kapsel, Live-Brücke über WebSocket',
      },
      {
        when: 'Q2 2026',
        what: '3D-Szene auf derselben Datenschicht, Klima-Verläufe pro Raum',
      },
      {
        when: 'H2 2026',
        what: 'Mehr Räume, Geräte-Auto-Import verfeinert, Layout-Editor ausgebaut',
      },
    ],
    lessons: [
      'Räumliches Layout schlägt jede Karten-Konfiguration: Menschen denken in Räumen und Etagen, nicht in Entity-IDs.',
      '2D und 3D parallel zu pflegen lohnt sich genau dann, wenn die gemeinsame Datenschicht das ohne Doppelarbeit hergibt. Zwei Ansichten auf einer Wahrheit kosten wenig, zwei Wahrheiten viel.',
      'Die Grenze zwischen Layout-Wissen und Geräte-Wahrheit von Anfang an zu ziehen erspart später den Umbau: neue Geräte sind dann eine Konfigurations-Frage, keine Code-Frage.',
      'Ein Token gehört serverseitig gekapselt, nicht in den Browser. Die Auth-Kapsel kostet einmal Aufwand und nimmt danach jeder neuen Ansicht das Sicherheitsproblem ab.',
    ],
  },
  'homelab-app': {
    problem: 'Ein Homelab im Dauerbetrieb will bedient werden, auch wenn ich nicht am Rechner sitze: einen klemmenden Dienst neu starten, kurz auf die Host-Metriken schauen, einen Log-Ausschnitt lesen, einen offenen Punkt sichten. Eine mobile Weboberfläche fühlt sich dafür fremd an, und ein roher Fernzugriff aufs Heimnetz ist weder sicher noch alltagstauglich. Gesucht war ein nativer Begleiter, der sich wie ein eigenes Produkt anfühlt, den Zugang bis auf Geräte-Ebene absichert und trotzdem in Sekunden zur Hand ist.',
    approach: [
      'Native Android-App mit Jetpack Compose und einem MVVM-Schnitt statt Hybrid-Wrapper, weil sie im Alltag genutzt wird und sich in Systemfunktionen wie Biometrie und Kamera einfügen soll, nicht nur gelegentlich aufgerufen wird.',
      'Ein Repository zwischen Oberfläche und Netz entscheidet pro Aufruf zwischen dem echten Gateway und einem statischen Demo-Datensatz, sodass die App auch ganz ohne Gateway vollständig erlebbar bleibt.',
      'Die Kopplung ist der Sicherheitskern: ein QR-Code trägt Gateway-Adresse und CA-Fingerprint, ein gerätegebundener EC-Schlüssel entsteht im Android-KeyStore und wird als CSR gegen JWT und Client-Zertifikat getauscht, der private Schlüssel verlässt das Gerät nie.',
      'Laufende Aufrufe authentifizieren sich per Bearer-JWT und zusätzlich per mTLS, sobald das Gateway über TLS antwortet; Token und Zertifikate liegen AES-GCM-verschlüsselt im lokalen Store und sind vom Geräte-Backup ausgeschlossen.',
      'Der Zugang läuft ausschließlich übers eigene VPN, im Release-Build ist Klartext-HTTP verboten, und jede verändernde Aktion sitzt zusätzlich hinter einer lokalen Bestätigung per Biometrie oder Geräte-PIN.',
      'Bewusst ehrlich gebaut: die eigentliche Autorisierung, Rate-Limits und Authentifizierung setzt das Gateway serverseitig durch, die Prüfungen in der App sind zusätzliche Schichten, kein Ersatz.',
    ],
    architecture: {
      summary: 'Die Compose-Oberfläche spricht nie direkt mit dem Gateway, sondern mit einem Repository, das je nach Modus live über das private Gateway oder gegen statische Demo-Daten arbeitet. Gekoppelt wird einmalig per QR: ein gerätegebundener EC-Schlüssel entsteht im Android-KeyStore, ein CSR wird vom Gateway zu JWT und Client-Zertifikat signiert, beides landet AES-GCM-verschlüsselt im lokalen Store. Danach läuft jeder Aufruf über Retrofit mit Bearer-JWT und mTLS, ausschließlich durchs eigene VPN, und jede verändernde Aktion sitzt hinter einer lokalen Bestätigung.',
      tiers: [
        {
          label: 'Oberfläche',
          nodes: [
            {
              id: 'compose',
              label: 'Compose-UI',
              note: 'MVVM, ein Screen je Bereich',
              kind: 'edge',
            },
            {
              id: 'confirm',
              label: 'Lokale Bestätigung',
              note: 'Biometrie/PIN vor Mutation',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Pairing & Schlüssel',
          nodes: [
            {
              id: 'pairing',
              label: 'Pairing per QR',
              note: 'Fingerprint-Pinning',
              kind: 'core',
            },
            {
              id: 'keystore',
              label: 'Android-KeyStore',
              note: 'EC-P256, non-exportable',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Datenschicht',
          nodes: [
            {
              id: 'repo',
              label: 'Repository',
              note: 'live oder Demo',
              kind: 'core',
            },
            {
              id: 'store',
              label: 'Verschlüsselter Store',
              note: 'Token/Cert per AES-GCM',
              kind: 'core',
            },
            {
              id: 'demo',
              label: 'Demo-Modus',
              note: 'statische Daten, kein Gateway',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Zugang & Gateway',
          nodes: [
            {
              id: 'transport',
              label: 'Retrofit + mTLS',
              note: 'Bearer-JWT, TLS-Pflicht',
              kind: 'consumer',
            },
            {
              id: 'gateway',
              label: 'Privates Gateway',
              note: 'Metriken · Dienste · Inbox',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'compose',
          to: 'repo',
          label: 'liest nie direkt',
        },
        {
          from: 'compose',
          to: 'confirm',
          label: 'vor jeder Mutation',
        },
        {
          from: 'pairing',
          to: 'keystore',
          label: 'erzeugt Geräteschlüssel',
        },
        {
          from: 'keystore',
          to: 'transport',
          label: 'Client-Cert für mTLS',
        },
        {
          from: 'repo',
          to: 'demo',
          label: 'ohne Gateway',
        },
        {
          from: 'repo',
          to: 'transport',
          label: 'online-Aufrufe',
        },
        {
          from: 'transport',
          to: 'gateway',
          label: 'durchs VPN, gekapselt',
        },
      ],
    },
    result: [
      'Container starten, stoppen oder neu starten, Host-Metriken und Logs lesen, offene Punkte sichten, alles vom Handy und in Sekunden erreichbar.',
      'Ein öffentlicher Demo-Modus zeigt die App vollständig ohne Gateway, ohne dass reale Netzdetails das Repository verlassen.',
      'Der Zugang bleibt auf das eigene VPN beschränkt, der Geräteschlüssel ist non-exportable, und jede schreibende Aktion braucht eine lokale Bestätigung.',
      'Eine neue Fähigkeit ist ein weiterer Screen plus ein Gateway-Endpunkt, kein Umbau am Sicherheits- oder Datenpfad.',
    ],
    decisions: [
      {
        title: 'Nativ statt Cross-Platform',
        body: 'Für eine täglich genutzte Begleit-App ist Native-Compose schlanker und enger an Android-Systemfunktionen wie Biometrie, Kamera und KeyStore. Die Wahl folgt dem Nutzungsmuster, nicht der Mode.',
      },
      {
        title: 'Pairing statt Passwort-Eingabe',
        body: 'Statt eines Passworts im Formular erzeugt das Gerät bei der Kopplung selbst einen non-exportablen Schlüssel und tauscht ihn gegen ein Zertifikat. So gibt es kein Sekret, das abgetippt oder abgefangen werden könnte, und der Zugang ist an genau dieses Gerät gebunden.',
      },
      {
        title: 'Zugriff nur durchs eigene VPN',
        body: 'Kein Gateway ist öffentlich erreichbar. Die App kommt ausschließlich übers eigene VPN ins Heimnetz, im Release-Build ohne jedes Klartext-HTTP. Bequemlichkeit wird hier nicht gegen Angriffsfläche getauscht.',
      },
      {
        title: 'Sicherheit gehört auf den Server',
        body: 'Die App prüft lokal, aber die Wahrheit über Autorisierung und Rate-Limits liegt im Gateway. Client-Prüfungen sind zusätzliche Schichten, damit ein manipuliertes Gerät nicht zur offenen Tür wird.',
      },
    ],
    metrics: [
      {
        label: 'Plattform',
        value: 'Android nativ (minSdk 28)',
      },
      {
        label: 'Architektur',
        value: 'Compose · MVVM · Hilt',
      },
      {
        label: 'Bereiche',
        value: 'Overview · Dienste · Inbox',
      },
      {
        label: 'Zugang',
        value: 'VPN + mTLS + lokale Bestätigung',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Native Compose-App im MVVM-Schnitt, Overview mit Host-Metriken, Dienste-Liste mit Start/Stop/Neustart und Logs',
      },
      {
        when: '2026 H1',
        what: 'Pairing per QR: gerätegebundener KeyStore-Schlüssel, CSR gegen JWT und Client-Zertifikat, Fingerprint-Pinning, verschlüsselter lokaler Store',
      },
      {
        when: '2026 H2',
        what: 'Inbox-Triage, mTLS-Pflicht und Klartext-Sperre im Release, öffentlicher Demo-Modus, lokale Bestätigung vor jeder Mutation',
      },
    ],
    lessons: [
      'Ein mobiles Ops-Werkzeug lohnt sich erst, wenn der Zugang bis auf Geräte-Ebene sitzt, sonst baut man eine bequeme Tür in ein privates Netz.',
      'Ein gerätegebundener Schlüssel plus Zertifikat ist am Ende weniger Aufwand als ein weiteres Passwort korrekt zu handhaben, und deutlich schwerer zu missbrauchen.',
      'Ein ehrlicher Demo-Modus ist Gold wert: die App lässt sich öffentlich zeigen und testen, ohne dass ein einziges reales Netzdetail das Repository verlässt.',
    ],
  },
  'homelab-sentinel': {
    problem: 'Ein Homelab im Dauerbetrieb braucht eine On-Call-Person, und das bin ausschließlich ich. Ohne Push-Kanal heißt das, ständig in Dashboards zu schauen und trotzdem das eine Ereignis zu verpassen, das zählt. Ich wollte das Gegenteil: einen Wächter, der sich von selbst meldet, wenn etwas wackelt, der mir die Entscheidung in die Hand gibt statt sie heimlich selbst zu treffen, und der einen Neustart übersteht, ohne dass danach tote Knöpfe im Chat zurückbleiben.',
    approach: [
      'Push statt Pull als Grundsatz: ein Bot meldet sich aktiv, statt dass ich ihn abfrage, und nutzt den ohnehin vorhandenen mobilen Push des Chat-Kanals als Pager-Ersatz statt einer zweiten Benachrichtigungs-Infrastruktur.',
      'Cog-Architektur: jede Sorge bekommt ihr eigenes Modul, von Container-Gesundheit über Backups, Updates und Sicherheits-Audits bis zum VPN-Peer-Status, einzeln pausierbar und neu schreibbar, ohne den Kern anzufassen.',
      'Der Bot ist Abnehmer des eigenen Event-Bus, keine zweite Mess-Schicht. Signale werden zentral dedupliziert, mit Cooldown triagiert und gebündelt zugestellt, statt dass jeder Dienst seinen eigenen Push-Weg lernt.',
      'Jeder Eingriff läuft über einen Bestätigungs-Flow: Vorübergehendes fährt der Bus innerhalb eines Limits selbst nach, Folgenreiches landet als Freigabe-Knopf mit Diagnose bei mir.',
      'Knöpfe sind neustart-fest gebaut: ihre Bedeutung steckt in der Aktion selbst und wird über einen globalen Interaktions-Listener aufgelöst, nicht aus flüchtigem Speicher. Nach einem Neustart bleibt kein toter Knopf zurück.',
    ],
    architecture: {
      summary: 'Der Bot ist Abnehmer des Event-Bus, nicht eine eigene Mess-Schicht. Signale laufen vom zentralen Bus in den Bot-Kern, der sie auf themenscharfe Cogs verteilt, für eingreifende Schritte einen Freigabe-Knopf erzeugt und das Ergebnis als Push in den Chat schickt, mobil inklusive. Folgenreiches wird erst nach meiner Freigabe ausgeführt.',
      tiers: [
        {
          label: 'Quelle',
          nodes: [
            {
              id: 'spine',
              label: 'Event-Bus',
              note: 'dedupliziert',
              kind: 'edge',
            },
          ],
        },
        {
          label: 'Bot-Kern',
          nodes: [
            {
              id: 'loader',
              label: 'Cog-Loader',
              note: 'neustart-fest',
              kind: 'core',
            },
            {
              id: 'confirm',
              label: 'Bestätigungs-Flow',
              note: 'Freigabe-Knopf',
              kind: 'core',
            },
            {
              id: 'dispatch',
              label: 'Action-Dispatch',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Cogs',
          nodes: [
            {
              id: 'health',
              label: 'Health und Updates',
              kind: 'consumer',
            },
            {
              id: 'backup',
              label: 'Backups',
              kind: 'consumer',
            },
            {
              id: 'sec',
              label: 'Security und VPN-Peers',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Ausgabe',
          nodes: [
            {
              id: 'push',
              label: 'Chat-Push',
              note: 'mobil',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'spine',
          to: 'loader',
          label: 'Alert',
        },
        {
          from: 'health',
          to: 'confirm',
          label: 'Freigabe',
        },
        {
          from: 'dispatch',
          to: 'spine',
          label: 'Aktion aus dem Chat',
        },
      ],
    },
    result: [
      'Acht Cogs decken Monitoring, Backups, Updates, Sicherheit und Verbindungs-Status ab, jede Sorge ein eigenes, einzeln pausierbares Modul.',
      'Push-pflichtige Ereignisse von der Neustart-Schleife über das ablaufende Zertifikat bis zum Speicherdruck erreichen mich im Sekunden-Bereich, alles Wartbare bleibt leise im Hintergrund.',
      'Ein Freigabe-Knopf ersetzt die stille Automatik: Vorübergehendes fährt bis zu einem Limit von selbst nach, eine abgelaufene Freigabe führt bei echtem Klick noch aus statt in eine Sackgasse zu laufen.',
      'Knöpfe überstehen einen Bot-Neustart, ohne tot zu werden, was vorher angezeigt wurde bleibt klickbar.',
      'On-Call wird leise: der Wächter meldet sich, wenn etwas zu tun ist, sonst nicht.',
    ],
    decisions: [
      {
        title: 'Eigener Bot statt Fertig-Werkzeug',
        body: 'Ein reines Push-Werkzeug wäre schneller aufgesetzt. Ein eigener Bot bringt aber Befehlsschnittstelle, Action-Dispatch und integrierte Logik unter ein Dach, was sich lohnt, sobald der Wächter nicht nur melden, sondern auf Zuruf auch handeln soll.',
      },
      {
        title: 'Bus als Alert-Quelle, Bot als Abnehmer',
        body: 'Statt jedem Dienst eigenen Bot-Push beizubringen, läuft alles zuerst über den Event-Bus mit Dedup und Cooldown, der Bot ist nur einer von mehreren Abnehmern. Das verhindert die Alert-Flut, an der Solo-On-Call sonst abstumpft.',
      },
      {
        title: 'Freigabe vor Eingriff, nicht stille Automatik',
        body: 'Selbstheilung ist verführerisch, aber ein falscher Eingriff ohne Rückfrage ist schlimmer als ein verpasster. Vorübergehendes darf der Bus innerhalb eines harten Limits selbst nachfahren, Folgenreiches landet als Knopf bei mir, ein Versuchszähler schützt gegen Endlos-Schleifen.',
      },
      {
        title: 'Knöpfe ohne flüchtigen Zustand',
        body: 'Knöpfe, deren Bedeutung nur im Arbeitsspeicher lebt, sind nach jedem Neustart tot. Stattdessen tragen sie ihre Bedeutung in der Aktion selbst, aufgelöst über einen globalen Interaktions-Listener, so überlebt jeder Knopf einen Neustart ohne erneut ausgelöste Alerts.',
      },
    ],
    metrics: [
      {
        label: 'Cogs',
        value: '8 produktiv',
      },
      {
        label: 'Push-Kanal',
        value: 'Chat, mobil inklusive',
      },
      {
        label: 'Alert-Latenz',
        value: 'Sekunden statt Minuten',
      },
      {
        label: 'Eingriff',
        value: 'nur nach Freigabe',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Bot-Basis mit Cog-Architektur, Anbindung an den Event-Bus',
      },
      {
        when: '2026 H1',
        what: 'Cogs für Health, Backups, Updates, Security und VPN-Peers',
      },
      {
        when: '2026 H1',
        what: 'Bestätigungs-Flow mit Freigabe-Knopf, neustart-feste Knöpfe, Auto-Nachfahren mit Versuchs-Limit',
      },
      {
        when: '2026 H2',
        what: 'Action-Dispatch für Chat-Trigger, weitere Cogs nach Bedarf',
      },
    ],
    lessons: [
      'Push statt Pull macht Solo-On-Call überhaupt erst durchhaltbar. Wer aktiv abfragen muss, verpasst irgendwann das eine Ereignis, das zählt.',
      'Selbstheilung braucht eine Freigabe-Schwelle. Vorübergehendes darf still nachgefahren werden, Folgenreiches gehört vor meine Augen, sonst tauscht man einen Ausfall gegen einen Eingriff zur falschen Zeit.',
      'Ein Knopf, dessen Zustand nur im Speicher lebt, ist nach dem nächsten Neustart eine Lüge. Bedeutung gehört in die Aktion selbst, dann überlebt der Knopf den Bot.',
      'Bevor überhaupt etwas angezeigt wird, muss der Bot wissen, wohin. Eine fehlende Kanal-Bindung lässt jeden Alert still ins Leere laufen, das ist der erste Verdacht, wenn nichts ankommt.',
    ],
  },
  'ai-vision': {
    problem: 'Edge-Hardware der ersten Generation ist eigensinnig: knapper Speicher, eine ältere Betriebssystem- und Toolchain-Schicht, eine GPU-Architektur, für die fast nichts von der Stange passt. Standard-Installationswege brechen an Stellen, die man erst beim Aufprall sieht. Trotzdem ist die verbaute GPU brauchbar, sobald die Plattform-Eigenheiten einmal verstanden und umschifft sind. Das Ziel: belastbare Bilderkennung lokal im eigenen Netz statt als Cloud-Abhängigkeit, sodass andere Eigen-Services Bild-Tasks abrufen können, ohne dass Daten das Haus verlassen.',
    approach: [
      'Plattform-Inventur zuerst: ermitteln, welche Bibliotheken die Hardware tatsächlich mitbringt und für welche Architektur überhaupt lauffähige Pakete existieren, bevor eine einzige Zeile Inferenz-Code entsteht.',
      'Inferenz hinter eine schlanke HTTP-API legen, die nur lokal lauscht und in einen Compute-Router eingebunden ist: andere Eigen-Services rufen dieselbe Schnittstelle, ohne je die Hardware zu kennen.',
      'Jeden Plattform-Stolperstein genau einmal lösen, festhalten und abhaken: von Speicher-Eigenheiten über zerbrechliche Abhängigkeits-Ketten bis zu Berechtigungs-Quirks der GPU-Anbindung. Die Doku ist Teil des Ergebnisses, nicht Beiwerk.',
      'Schreibintensive Persistenz bewusst von der internen Karte auf robustere Datenträger verlagern, weil ML-Lasten Flash-Speicher der einfachen Klasse nicht lange überleben.',
      'Härtung als Default: minimale Capabilities, getrennte Datenpfade, kein direkter Außenzugang. Die Inferenz ist Konsum-Ziel im Heimnetz, keine offene Tür.',
    ],
    architecture: {
      summary: 'Andere Eigen-Services rufen nicht das Modell direkt, sondern einen Compute-Router an; der reicht an einen lokalen Inferenz-Server weiter, der das Modell auf der Edge-GPU ausführt und seine Gewichte von robustem Datenträger lädt. So bleibt die gesamte Hardware-Bindung an einer einzigen, austauschbaren Stelle gekapselt, und neue Erkennungs-Tasks ziehen über dieselbe Schnittstelle ein, ohne dass ein Konsument seinen Code an die GPU bindet.',
      tiers: [
        {
          label: 'Konsumenten',
          nodes: [
            {
              id: 'svc',
              label: 'Eigen-Services',
              note: 'Bild-Tasks',
              kind: 'consumer',
            },
          ],
        },
        {
          label: 'Zugriff',
          nodes: [
            {
              id: 'router',
              label: 'Compute-Router',
              note: 'eine API',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Inferenz',
          nodes: [
            {
              id: 'api',
              label: 'Inferenz-Server',
              note: 'nur lokal erreichbar',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Hardware',
          nodes: [
            {
              id: 'gpu',
              label: 'Edge-GPU',
              kind: 'data',
            },
            {
              id: 'store',
              label: 'Modell-Gewichte',
              note: 'robuster Datenträger',
              kind: 'data',
            },
          ],
        },
      ],
      flows: [
        {
          from: 'svc',
          to: 'router',
          label: 'Bild-Task',
        },
        {
          from: 'router',
          to: 'api',
        },
        {
          from: 'api',
          to: 'gpu',
          label: 'lokale Inferenz',
        },
        {
          from: 'api',
          to: 'store',
          label: 'lädt Gewichte',
        },
      ],
    },
    result: [
      'Erkennungsmodell live auf eigener Edge-Hardware, eingebunden in den restlichen Eigen-Stack, Warm-Inferenz im Bruchteil einer Sekunde.',
      'Cloud-Inferenz für diese Bild-Tasks vollständig entfallen: die Aufnahmen verlassen das Heimnetz nicht.',
      'Dokumentierter, reproduzierbarer Plattform-Pfad: künftige Modelle und neue Erkennungs-Tasks sitzen auf derselben Grundlage auf, statt das Bring-up jedes Mal neu zu durchleiden.',
      'Nach einem Hardware-Umbau am Datenträger ließ sich der Dienst aus gesichertem Stand wieder anfahren, ohne das Modell neu zu beschaffen: der dokumentierte Pfad hat sich im Ernstfall bewährt.',
    ],
    decisions: [
      {
        title: 'Mit der Plattform arbeiten, nicht gegen sie',
        body: 'Ein Hardware-Upgrade ist für die erste Generation oft schlicht keine Option. Statt dagegen anzurennen, entstand ein dokumentierter Pfad, der die Eigenheiten der Plattform akzeptiert und genau dadurch produktiv wird. Die Stolpersteine werden zum festgehaltenen Wissen, nicht zum wiederkehrenden Schmerz.',
      },
      {
        title: 'Inferenz hinter einer API entkoppeln',
        body: 'Direktzugriffe auf das Modell würden jeden Konsumenten an die konkrete Hardware koppeln. Eine lokale HTTP-Schnittstelle entkoppelt: neue Tasks und neue Modelle ziehen in dieselbe Architektur ein, ohne dass irgendein aufrufender Service umgeschrieben werden muss.',
      },
      {
        title: 'Persistenz auf robusten Datenträger',
        body: 'Flash-Speicher der einfachen Klasse überlebt schreibintensive ML-Lasten nicht lange. Die Gewichte und Caches auf einen widerstandsfähigeren Datenträger zu legen, löst das mit minimalem Aufwand dauerhaft und macht aus schleichendem Datenverlust ein erledigtes Thema.',
      },
      {
        title: 'Edge statt Cloud für Bild-Tasks',
        body: 'Lokale Inferenz hält die Aufnahmen im eigenen Netz und macht den Dienst unabhängig von Drittanbietern und deren Preis- und Verfügbarkeits-Politik. Der einmalige Bring-up-Aufwand kauft dauerhafte Datensouveränität.',
      },
    ],
    metrics: [
      {
        label: 'Inferenz-Ort',
        value: 'eigene Edge-GPU',
      },
      {
        label: 'Datenpfad',
        value: 'verlässt das Heimnetz nicht',
      },
      {
        label: 'Erweiterbarkeit',
        value: 'modular über eine API',
      },
      {
        label: 'Plattform-Pfad',
        value: 'dokumentiert, reproduzierbar',
      },
    ],
    timeline: [
      {
        when: '2026 H1',
        what: 'Plattform-Bring-up, lokaler Inferenz-Server, Einbindung in den Compute-Router',
      },
      {
        when: '2026 H1',
        what: 'Persistenz auf robusten Datenträger verlagert, Plattform-Stolpersteine dokumentiert und abgehakt',
      },
      {
        when: '2026 H2',
        what: 'Recovery nach Hardware-Umbau aus gesichertem Stand, Grundlage für weitere Erkennungs-Tasks gelegt',
      },
    ],
    lessons: [
      'Mit der Plattform zu arbeiten statt gegen sie ist bei Edge-Hardware der ersten Generation der einzig produktive Weg: ein Upgrade ist häufig keine Option, der dokumentierte Pfad schon.',
      'Eine API vor dem Modell entkoppelt die Konsumenten von der Hardware. Neue Tasks ziehen ein, ohne dass jemand seinen Code an die GPU bindet.',
      'Flash-Speicher der einfachen Klasse überlebt ML-Lasten nicht. Persistenz auf einen robusten Datenträger ist die billigste dauerhafte Versicherung gegen schleichenden Datenverlust.',
      'Die Plattform-Stolpersteine genau einmal zu dokumentieren zahlt sich beim ersten Hardware-Umbau aus: was festgehalten ist, lässt sich wieder anfahren, statt es neu zu erleiden.',
    ],
  },
  rackforge: {
    problem:
      'Für einen Shop, der 3D-gedruckte Teile verkauft, passt kein Standard-Shop-System sauber: dieselbe Form gibt es in vielen Farben, vieles wird erst auf Bestellung gedruckt, und der Bestand sind nicht fertige Artikel im Regal, sondern Filament-Rollen und ein paar vorproduzierte Stücke. Ein Baukasten-Shop zwingt dieses Modell in seine Artikel-Logik und kämpft danach gegen die Plattform statt mit ihr. Ich wollte den ganzen Shop selbst bauen: eigenes Datenmodell, eigene Kasse, eigene Bestands-Regeln, die zu Fertigung auf Bestellung passen.',
    approach: [
      'Ein eigener Produktkatalog mit aus den Stammdaten generierten Detailseiten, sodass eine Produktänderung an einer Stelle gepflegt wird und sich der Rest daraus ergibt.',
      'Ein farbbewusster Warenkorb: dieselbe Form in verschiedenen Farben ist ein eigener Posten, der Warenkorb-Schlüssel trägt Artikel und Farbe getrennt, damit nichts fälschlich zusammengefasst wird.',
      'Eine Bestands-Engine, die Filament-Rollen und fertig gedruckte Teile getrennt führt: nicht vorrätig heißt auf Bestellung, nicht ausverkauft, und ein erledigter Druck wird gegen den Bestand verbucht.',
      'Ein selbst geschriebener Upload-Pfad für hochgeladene Druckdateien mit eigenem Multipart-Parser, der erlaubte Formate und eine Größengrenze hart durchsetzt, statt sich auf eine Fremd-Bibliothek zu verlassen.',
      'Ein token-geschützter Admin, ein Honeypot gegen Bot-Bestellungen und ein Export ins gängige Shop-Format, damit der Eigenbau anschlussfähig bleibt.',
    ],
    architecture: {
      summary:
        'Der Browser spricht mit einem eigenen Shop-Backend, das Katalog, farbbewussten Warenkorb und Kasse trägt; ein selbst geschriebener Upload-Pfad prüft hochgeladene Dateien gegen Format- und Größengrenzen, eine Bestands-Engine führt Filament und Fertigteile getrennt und verbucht Drucke, und ein token-geschützter Admin sowie ein Export ins gängige Shop-Format liegen daneben.',
      tiers: [
        {
          label: 'Storefront',
          nodes: [
            { id: 'catalog', label: 'Produktkatalog', note: 'generierte Detailseiten', kind: 'edge' },
            { id: 'cart', label: 'Warenkorb', note: 'Schlüssel: Artikel + Farbe', kind: 'edge' },
            { id: 'upload', label: 'Datei-Upload', note: 'eigener Parser', kind: 'edge' },
          ],
        },
        {
          label: 'Shop-Backend',
          nodes: [
            { id: 'checkout', label: 'Kasse', note: 'eigenes Datenmodell', kind: 'core' },
            { id: 'validate', label: 'Upload-Prüfung', note: 'Format · Größe', kind: 'core' },
            { id: 'admin', label: 'Admin', note: 'token-geschützt · Honeypot', kind: 'core' },
          ],
        },
        {
          label: 'Bestand & Daten',
          nodes: [
            { id: 'filament', label: 'Filament-Bestand', kind: 'data' },
            { id: 'finished', label: 'Fertigteil-Bestand', note: 'auf Bestellung wenn leer', kind: 'data' },
            { id: 'orders', label: 'Bestellungen', kind: 'data' },
          ],
        },
        {
          label: 'Anschluss',
          nodes: [
            { id: 'export', label: 'Shop-Format-Export', kind: 'consumer' },
            { id: 'notify', label: 'Bestell-Benachrichtigung', kind: 'consumer' },
          ],
        },
      ],
      flows: [
        { from: 'catalog', to: 'cart', label: 'pro Farbe getrennt' },
        { from: 'cart', to: 'checkout' },
        { from: 'upload', to: 'validate', label: 'Format · Größe' },
        { from: 'checkout', to: 'orders' },
        { from: 'orders', to: 'finished', label: 'Druck verbucht' },
        { from: 'orders', to: 'notify' },
        { from: 'orders', to: 'export' },
      ],
    },
    result: [
      'Ein vollständiger Shop ohne Shop-Framework: Katalog, farbbewusster Warenkorb, Kasse und Bestands-Logik sind eigener Code, kein Plugin-Geflecht.',
      'Die Bestands-Engine bildet Fertigung auf Bestellung sauber ab: nicht vorrätig heißt bestellbar statt ausverkauft, ein erledigter Druck wird gegen den Bestand verbucht.',
      'Der eigene Upload-Pfad nimmt hochgeladene Druckdateien an und weist alles ab, was nicht ins erlaubte Format oder unter die Größengrenze passt.',
      'Der Shop steht im Pre-Launch, das Modell trägt: Token-Admin, Honeypot und ein Export ins gängige Shop-Format sind angelegt.',
    ],
    decisions: [
      {
        title: 'Eigenbau statt Shop-Baukasten',
        body: 'Ein Standard-Shop hätte das Modell aus Farben, Fertigung auf Bestellung und Filament-Bestand in seine Artikel-Logik gepresst. Ein eigenes, schlankes Datenmodell bildet genau diesen Fall ab, ohne gegen die Plattform zu arbeiten.',
      },
      {
        title: 'Farbe im Warenkorb-Schlüssel',
        body: 'Dieselbe Form in zwei Farben sind zwei Posten, keine Menge von zwei. Farbe und Artikel getrennt im Warenkorb-Schlüssel zu führen verhindert das stille Zusammenfassen, an dem ein generischer Shop scheitert.',
      },
      {
        title: 'Eigener Upload-Parser mit harten Grenzen',
        body: 'Hochgeladene Dateien sind eine Angriffsfläche. Ein selbst geschriebener Multipart-Parser, der nur erlaubte Formate und eine feste Größengrenze durchlässt, hält die Kontrolle im eigenen Code, statt sie an eine Fremd-Bibliothek abzugeben.',
      },
    ],
    metrics: [
      { label: 'Shop-Framework', value: 'keines, Eigenbau' },
      { label: 'Bestand', value: 'Filament und Fertigteile getrennt' },
      { label: 'Upload', value: 'eigener Parser, Format- und Größengrenze' },
      { label: 'Stand', value: 'Pre-Launch, Modell trägt' },
    ],
    timeline: [
      { when: '2026 H1', what: 'Eigenes Datenmodell, Katalog mit generierten Detailseiten, farbbewusster Warenkorb' },
      { when: '2026 H1', what: 'Bestands-Engine für Filament und Fertigteile, eigener Datei-Upload, Token-Admin' },
      { when: '2026 H2', what: 'Produktbilder, Kassen-Politur, Übergang in den produktiven Betrieb' },
    ],
    lessons: [
      'Wenn das Geschäftsmodell nicht in die Artikel-Logik eines Standard-Shops passt, ist der Eigenbau oft der kürzere Weg als der Dauer-Kampf gegen die Plattform.',
      'Variantenführung steht und fällt mit dem Schlüssel: Farbe und Artikel getrennt zu halten verhindert die stille Fehl-Aggregation im Warenkorb.',
      'Datei-Uploads sind eine Angriffsfläche, kein Komfort-Feature. Format und Größe gehören im eigenen Code hart durchgesetzt.',
    ],
  },
  'cms-baukasten': {
    problem:
      'Kleine Websites brauchen ein Content-Management, aber ein schwergewichtiges Fremd-CMS ist für eine simple Seite überdimensioniert: ständige Updates, große Angriffsfläche, mehr Plugin als Inhalt. Gleichzeitig will man nicht jede kleine Seite von Grund auf neu bauen. Ich wollte eine eigene, bewusst schlanke Grundlage, die genug kann, um Inhalte komfortabel zu pflegen, und so geschnitten ist, dass eine neue Seite daraus eine Konfigurations-Frage wird statt eines Neubaus.',
    approach: [
      'Ein eigenes, schlankes CMS (PHP hinter Apache, MySQL-Datenbank) als Vorlage statt eines Fremd-Systems: nur die Bausteine, die eine kleine Inhalts-Seite wirklich braucht, dafür verständlich und wartbar.',
      'Eine Pflege-Oberfläche, die ausschließlich aus dem eigenen Netz erreichbar ist; am öffentlichen Rand wird der Admin-Pfad hart abgewiesen, statt sich nur auf ein Passwort zu verlassen.',
      'Der öffentliche Teil liest aus einem eigenen Datenspeicher und wird schnell und statisch ausgeliefert, getrennt vom schreibenden Admin-Pfad.',
      'Feature-Module (Kontaktformular, Newsletter, Einwilligung, Impressum/Datenschutz) werden pro Seite nur aktiviert, wenn sie gebraucht werden; der Modul-Loader ist gegen Pfad-Tricks gehärtet, sodass jede Seite nur trägt, was sie wirklich braucht.',
      'Neben der händischen Pflege können Artikel über eine token-authentifizierte Ingest-Schnittstelle automatisch eingespielt werden, so speist etwa ein Blog-Generator Beiträge ein, ohne dass jemand den Admin öffnet.',
      'Abgesichert durch eine eigene, schlanke Test-Harness: schnelle Unit-Tests ohne Datenbank plus Integrationstests gegen eine Wegwerf-Datenbank, statt eines schweren Test-Frameworks.',
      'Eine erste Seite läuft bereits auf dieser Grundlage, eine zweite erbt inzwischen dasselbe Image; daraus wird die Vorlage so verallgemeinert, dass weitere Seiten dieselbe Basis erben.',
    ],
    architecture: {
      summary:
        'Besucher erreichen nur den öffentlichen, statisch ausgelieferten Teil, der aus einem eigenen Datenspeicher liest; die schreibende Pflege-Oberfläche ist ausschließlich aus dem eigenen Netz erreichbar und wird am öffentlichen Rand hart abgewiesen, sodass dieselbe Vorlage über mehrere Seiten getragen werden kann.',
      tiers: [
        {
          label: 'Öffentlich',
          nodes: [
            { id: 'edge', label: 'Reverse-Proxy', note: 'Admin-Pfad abgewiesen', kind: 'edge' },
            { id: 'public', label: 'Öffentliche Seite', note: 'statisch ausgeliefert', kind: 'edge' },
          ],
        },
        {
          label: 'CMS-Kern',
          nodes: [
            { id: 'render', label: 'Ausliefer-Schicht', note: 'liest Inhalte', kind: 'core' },
            { id: 'admin', label: 'Pflege-Oberfläche', note: 'nur eigenes Netz', kind: 'core' },
          ],
        },
        {
          label: 'Daten',
          nodes: [
            { id: 'store', label: 'Inhalts-Speicher', kind: 'data' },
            { id: 'media', label: 'Medien', kind: 'data' },
          ],
        },
        {
          label: 'Weitere Seiten',
          nodes: [
            { id: 'tenant', label: 'Weitere Seiten', note: 'erben die Vorlage', kind: 'consumer' },
          ],
        },
      ],
      flows: [
        { from: 'edge', to: 'public', label: 'nur öffentlich' },
        { from: 'public', to: 'render' },
        { from: 'render', to: 'store', label: 'lesend' },
        { from: 'admin', to: 'store', label: 'schreibend, intern' },
        { from: 'store', to: 'tenant', label: 'Vorlage geerbt' },
      ],
    },
    result: [
      'Eine eigene, schlanke CMS-Grundlage trägt bereits zwei eigene Seiten auf einem geteilten Image, statt sie auf ein schwergewichtiges Fremd-System zu setzen.',
      'Die Pflege-Oberfläche ist nur aus dem eigenen Netz erreichbar, der Admin-Pfad wird am öffentlichen Rand hart abgewiesen.',
      'Der öffentliche Teil bleibt schnell und statisch, der schreibende Pfad ist davon getrennt.',
      'Die Vorlage ist so geschnitten, dass eine neue Seite die Basis erbt, statt neu gebaut zu werden.',
    ],
    decisions: [
      {
        title: 'Eigenes schlankes CMS statt Fremd-Schwergewicht',
        body: 'Für eine kleine Inhalts-Seite ist ein großes Fremd-CMS mehr Angriffsfläche und Update-Last als Nutzen. Eine eigene, verständliche Grundlage kann genau das Nötige und bleibt wartbar.',
      },
      {
        title: 'Admin nur im eigenen Netz, nicht nur per Passwort',
        body: 'Eine öffentlich erreichbare Admin-Oberfläche ist ein Dauerziel. Den Pflege-Pfad am Rand komplett abzuweisen statt ihn nur hinter ein Passwort zu stellen, nimmt die Angriffsfläche von vornherein heraus.',
      },
      {
        title: 'Als Vorlage gebaut, nicht als Einzelstück',
        body: 'Die erste Seite ist zugleich die Blaupause: was sich verallgemeinern lässt, wird zur Vorlage, damit die nächste Seite dieselbe Basis erbt statt eine neue zu bekommen.',
      },
    ],
    metrics: [
      { label: 'Basis', value: 'eigenes CMS · PHP · Apache · MySQL' },
      { label: 'Admin-Zugang', value: 'nur eigenes Netz' },
      { label: 'Auslieferung', value: 'öffentlich statisch' },
      { label: 'Ziel', value: 'Vorlage für weitere Seiten' },
    ],
    timeline: [
      { when: '2026 H1', what: 'Schlankes Eigen-CMS gebaut, erste eigene Seite darauf umgestellt' },
      { when: '2026 H1', what: 'Admin auf das eigene Netz beschränkt, öffentlicher Teil statisch getrennt' },
      { when: '2026 H2', what: 'Verallgemeinerung zur wiederverwendbaren Vorlage' },
    ],
    lessons: [
      'Für eine kleine Seite ist ein eigenes schlankes CMS oft sicherer und wartbarer als ein großes Fremd-System mit ständiger Update-Last.',
      'Eine Admin-Oberfläche gehört nicht ins öffentliche Netz. Sie am Rand abzuweisen ist stärker als jedes Passwort davor.',
      'Wer die erste Seite schon als Vorlage denkt, spart sich bei der zweiten Seite den Neubau.',
    ],
  },
  'edge-hosting': {
    problem:
      'Öffentlich erreichbare Dienste und ein eigener Heim-Verbund gehören nicht ins selbe Netz-Segment: ein exponierter Webdienst, der kompromittiert wird, darf nicht im selben Raum stehen wie die private Infrastruktur. Gleichzeitig will man Mail für die eigenen Domänen nicht dauerhaft einem Drittanbieter-Postfach überlassen. Ich wollte einen öffentlichen Server, der bewusst als getrennte Zone neben dem Heimnetz steht, mehrere Seiten einheitlich abgesichert trägt und Mail für die eigenen Domänen selbst übernimmt.',
    approach: [
      'Einen eigenen öffentlichen Server (Debian) als getrennte Edge-Zone aufsetzen, bewusst abseits des privaten Heim-Segments, damit ein exponierter Dienst nie direkt neben der internen Infrastruktur sitzt.',
      'Ein TLS-Reverse-Proxy (Caddy mit automatischem TLS) terminiert alle Domänen und reicht nur lokal an die dahinterliegenden Container weiter, die nach außen keinen eigenen Port öffnen.',
      'Die Dienste laufen gehärtet: read-only Dateisystem, gedroppte Rechte, Schreibpfade nur über klar benannte Volumes, einheitlich über alle Sites.',
      'Ein eigener Mailserver (mailcow) übernimmt Versand und Empfang für die eigenen Domänen, statt das einem Fremd-Postfach zu überlassen.',
      'Der Server dient zugleich als Off-Site-Position, räumlich getrennt vom Heim-Verbund.',
      'Der Edge-Standort wird zum unabhängigen Außenposten: von außerhalb des Heimnetzes prüft ein externer Wächter (Gatus) laufend die öffentliche Erreichbarkeit aller Sites, verifiziert die Off-Site-Backups von einem dritten Ort und hält einen Totmann-Schalter, der über einen heim-unabhängigen Kanal Alarm gibt, falls der Heim-Verbund verstummt.',
    ],
    architecture: {
      summary:
        'Domänen treffen am öffentlichen Server auf einen TLS-Reverse-Proxy, der sie terminiert und nur lokal an gehärtete, read-only betriebene Container weiterreicht; ein eigener Mailserver trägt Versand und Empfang für die eigenen Domänen, und die ganze Zone steht bewusst getrennt vom privaten Heim-Segment als Off-Site-Position.',
      tiers: [
        {
          label: 'Öffentlich',
          nodes: [
            { id: 'dns', label: 'Domänen', kind: 'edge' },
            { id: 'proxy', label: 'TLS-Reverse-Proxy', note: 'Caddy · Auto-TLS', kind: 'edge' },
          ],
        },
        {
          label: 'Edge-Zone',
          nodes: [
            { id: 'sites', label: 'Site-Container', note: 'read-only · gedroppte Rechte', kind: 'core' },
            { id: 'mail', label: 'Eigener Mailserver', note: 'mailcow · Versand + Empfang', kind: 'core' },
          ],
        },
        {
          label: 'Daten',
          nodes: [
            { id: 'vol', label: 'Volumes', note: 'klar benannte Schreibpfade', kind: 'data' },
            { id: 'mbox', label: 'Postfächer', kind: 'data' },
          ],
        },
        {
          label: 'Trennung',
          nodes: [
            { id: 'isolation', label: 'Getrennt vom Heim-Segment', note: 'Off-Site', kind: 'consumer' },
          ],
        },
      ],
      flows: [
        { from: 'dns', to: 'proxy', label: 'alle Domänen' },
        { from: 'proxy', to: 'sites', label: 'nur lokal' },
        { from: 'sites', to: 'vol' },
        { from: 'mail', to: 'mbox' },
        { from: 'sites', to: 'isolation', label: 'außerhalb des Heimnetzes' },
      ],
    },
    result: [
      'Öffentlich erreichbare Dienste laufen in einer bewusst getrennten Edge-Zone, nicht im selben Segment wie die private Infrastruktur.',
      'Ein TLS-Reverse-Proxy terminiert alle Domänen und reicht nur lokal weiter, die Container öffnen nach außen keinen eigenen Port.',
      'Ein eigener Mailserver trägt Versand und Empfang für die eigenen Domänen, statt sie einem Drittanbieter zu überlassen.',
      'Mehrere Sites teilen denselben, einheitlich gehärteten Unterbau; der Server ist zugleich eine Off-Site-Position abseits des Heim-Verbunds.',
      'Der Edge-Standort dient zugleich als unabhängiger Außenposten: er überwacht die öffentliche Erreichbarkeit der Sites von außen, verifiziert Backups von einem dritten Ort und meldet über einen heim-unabhängigen Kanal, wenn der Heim-Verbund ausfällt.',
    ],
    decisions: [
      {
        title: 'Von außen prüfen, nicht nur von innen',
        body: 'Eine Überwachung, die im selben Verbund läuft wie das Überwachte, schweigt genau dann, wenn der Verbund ausfällt. Der Edge-Standort steht ohnehin getrennt vom Heimnetz, also übernimmt er die Gegenprobe von außen: Erreichbarkeit der öffentlichen Sites, unabhängige Verifikation der Off-Site-Backups und ein Totmann-Schalter, der über einen heim-unabhängigen Kanal Alarm gibt, wenn von zuhause nichts mehr kommt.',
      },
      {
        title: 'Getrennte Zone statt Heimnetz-Erweiterung',
        body: 'Öffentliche Dienste ins Heimnetz zu hängen, hätte einen kompromittierten Webdienst direkt neben die private Infrastruktur gestellt. Ein eigener Server als getrennte Zone zieht diese Grenze in die Topologie, nicht nur in eine Firewall-Regel.',
      },
      {
        title: 'Reverse-Proxy als einziger öffentlicher Punkt',
        body: 'Nur der Proxy terminiert TLS und ist erreichbar, die Container dahinter öffnen keinen eigenen Port nach außen. Eine einzige, kontrollierte Eintrittsstelle statt vieler offener Dienste.',
      },
      {
        title: 'Eigener Mailserver für die eigenen Domänen',
        body: 'Mail dauerhaft einem Fremd-Postfach zu überlassen, gibt Kontrolle und Daten aus der Hand. Ein eigener Mailserver (mailcow) auf dem Edge-Host hält Versand und Empfang der eigenen Domänen im eigenen Betrieb.',
      },
    ],
    metrics: [
      { label: 'Zone', value: 'getrennt vom Heim-Segment' },
      { label: 'Öffentlicher Eintritt', value: 'nur TLS-Reverse-Proxy' },
      { label: 'Mail', value: 'eigener Server, eigene Domänen' },
      { label: 'Container', value: 'read-only, gedroppte Rechte' },
    ],
    timeline: [
      { when: '2026 H1', what: 'Öffentlicher Server als getrennte Edge-Zone provisioniert, TLS-Reverse-Proxy davor' },
      { when: '2026 H1', what: 'Erste Sites gehärtet umgezogen, eigener Mailserver für die eigenen Domänen' },
      { when: '2026 H2', what: 'Weitere Sites auf denselben Unterbau, Off-Site-Rolle gefestigt' },
      { when: '2026 H2', what: 'Edge-Standort zum unabhängigen Außenposten ausgebaut: externer Erreichbarkeits-Wächter, Backup-Verifikation von außen und Totmann-Schalter' },
    ],
    lessons: [
      'Exponierte Dienste gehören topologisch getrennt vom privaten Netz, nicht nur durch eine Regel im selben Segment.',
      'Ein einziger öffentlicher Eintrittspunkt ist leichter abzusichern als viele offene Ports, die jeder für sich gepflegt werden müssten.',
      'Einen eigenen Mailserver zu betreiben ist Aufwand, aber es hält Versand und Empfang der eigenen Domänen unter eigener Kontrolle statt in fremder Hand.',
      'Eine Überwachung von außen fängt genau den Fall, den eine interne nie sieht: fällt der ganze Verbund aus, kann nur ein unabhängiger Standort noch Alarm geben.',
    ],
  },

  'modell-vermittlung': {
    problem:
      'Mit jedem Dienst, der ein Sprachmodell ruft, wuchs dasselbe Problem an mehreren Stellen zugleich: jeder trug seinen eigenen Schlüssel, jeder sein eigenes Modell fest verdrahtet, und niemand hatte ein Kostenbild über das Ganze. Ein einzelner Dienst mit einer Schleife im falschen Moment hätte still ein Monatsbudget leerlaufen lassen, ohne dass es vorher jemand gesehen hätte. Ich wollte weder je Dienst eine eigene Abrechnung führen noch überall denselben Umschalt- und Ausfall-Code kopieren. Es brauchte eine Stelle, durch die alle KI-Aufrufe laufen, mit einem Deckel pro Dienst und einem klaren Weg, wenn eine Seite wegbricht.',
    approach: [
      'Ein einziges Tor vor alle Sprachmodelle: ein Endpunkt, der sowohl das Anthropic- als auch das OpenAI-kompatible Anfrageformat spricht, sodass bestehende Dienste ohne Umbau darüber laufen: sie zeigen nur auf eine andere Adresse.',
      'Jeder Konsument bekommt einen eigenen Schlüssel mit eigenem Monatsbudget als Runaway-Schutz und eine Modell-Freigabeliste. Läuft ein Dienst heiß, trifft es seinen eigenen Deckel, nicht das Budget aller anderen.',
      'Hybrides Routing nach Aufgabe statt pauschal: kostensensible und häufige Aufrufe gehen an ein lokal betriebenes Modell, das ohne externe Kosten läuft; die wenigen Aufrufe, die echte Cloud-Qualität brauchen, gehen an ein Cloud-Modell. Die Entscheidung liegt in der Vermittlung, nicht im Dienst.',
      'Ein dokumentierter Ausweich-Pfad: fällt das lokale Modell unter Last aus, schaltet die Vermittlung selbsttätig auf ein kleines Cloud-Modell um, statt den Aufruf scheitern zu lassen. Der Dienst merkt nur, dass er eine Antwort bekommt.',
      'Das Container-Image ist per Prüfsumme festgenagelt, nicht auf ein bewegliches Tag gepinnt, damit „was gerade läuft" reproduzierbar bleibt und sich nicht unter der Hand ändert.',
    ],
    architecture: {
      summary:
        'Alle KI-nutzenden Dienste sprechen nicht mehr direkt mit einem Modellanbieter, sondern mit einer zentralen Vermittlung. Sie prüft den dienst-eigenen Schlüssel, bucht gegen dessen Monatsbudget, wählt nach Aufgabe zwischen einem lokal betriebenen Modell und einem Cloud-Modell und weicht bei Überlast selbsttätig auf ein kleines Cloud-Modell aus. Nach außen bietet sie einen Endpunkt in zwei geläufigen Anfrageformaten an, sodass Bestehendes ohne Umbau anschließt.',
      tiers: [
        {
          label: 'Konsumenten',
          nodes: [
            { id: 'chat', label: 'Community-Bot', kind: 'edge' },
            { id: 'watch', label: 'Marktbeobachter', kind: 'edge' },
            { id: 'blog', label: 'Blog-Generator', kind: 'edge' },
            { id: 'brief', label: 'Tägliches Briefing · Alltag', kind: 'edge' },
          ],
        },
        {
          label: 'Vermittlung',
          nodes: [
            {
              id: 'gw',
              label: 'Zentrales Tor',
              note: 'Schlüssel · Budget · Freigabeliste · Router',
              kind: 'core',
            },
          ],
        },
        {
          label: 'Modelle',
          nodes: [
            { id: 'local', label: 'Lokales Modell', note: 'ohne externe Kosten', kind: 'consumer' },
            { id: 'cloud', label: 'Cloud-Modell', note: 'nur wo nötig', kind: 'consumer' },
            { id: 'fallback', label: 'Kleines Cloud-Modell', note: 'Ausweich bei Überlast', kind: 'consumer' },
          ],
        },
      ],
      flows: [
        { from: 'chat', to: 'gw', label: 'eigener Schlüssel' },
        { from: 'watch', to: 'gw', label: 'eigenes Budget' },
        { from: 'blog', to: 'gw' },
        { from: 'brief', to: 'gw' },
        { from: 'gw', to: 'cloud', label: 'Qualitäts-Aufrufe' },
        { from: 'gw', to: 'local', label: 'häufige Aufrufe' },
        { from: 'gw', to: 'fallback', label: 'bei Überlast' },
      ],
    },
    result: [
      'Alle KI-Aufrufe im Haus laufen über ein Tor: ein Kostenbild statt verstreuter Abrechnung, ein Deckel pro Dienst statt böser Überraschung am Monatsende.',
      'Bestehende Dienste wurden ohne Code-Umbau umgehängt: sie zeigen nur auf die Vermittlung, weil diese beide gängigen Anfrageformate spricht.',
      'Der Regelbetrieb kostet extern nichts, weil das Gros der Aufrufe lokal läuft; Cloud-Qualität wird gezielt nur dort gekauft, wo eine Aufgabe sie wirklich braucht.',
      'Fällt das lokale Modell unter Last aus, bekommt der Dienst trotzdem eine Antwort: der Ausweich-Pfad ist dokumentiert und greift selbsttätig, statt den Aufruf scheitern zu lassen.',
    ],
    decisions: [
      {
        title: 'Ein Tor statt Bibliothek in jedem Dienst',
        body: 'Umschaltung, Budget und Ausfall-Logik einmal in einer Vermittlung zu lösen ist wartbarer, als denselben Code in jeden Dienst zu kopieren. Ein Dienst, der das Format schon kann, braucht nur eine neue Adresse und einen Schlüssel.',
      },
      {
        title: 'Zwei Anfrageformate an einem Endpunkt',
        body: 'Weil das Tor sowohl das Anthropic- als auch das OpenAI-kompatible Format annimmt, mussten bestehende Dienste nicht auf eine gemeinsame Bibliothek umgeschrieben werden. Das senkte die Umzugs-Kosten auf einen Adress- und Schlüsseltausch.',
      },
      {
        title: 'Budget pro Konsument, nicht global',
        body: 'Ein globaler Deckel hätte einen Ausreißer alle anderen aushungern lassen. Ein eigenes Monatsbudget je Schlüssel begrenzt den Schaden auf den Verursacher und macht sichtbar, welcher Dienst wie viel kostet.',
      },
      {
        title: 'Lokal zuerst, Cloud gezielt',
        body: 'Die Vermittlung schickt häufige, kostensensible Aufrufe an ein lokal betriebenes Modell und hebt sich das Cloud-Modell für die wenigen Aufgaben auf, die dessen Qualität rechtfertigen. Kosten entstehen als bewusste Wahl, nicht als Standardweg.',
      },
    ],
    timeline: [
      { when: '2026 H2', what: 'Zentrale Vermittlung als schmales Tor vor alle Sprachmodelle gestellt' },
      { when: '2026 H2', what: 'Per-Konsument-Schlüssel mit Monatsbudget und Modell-Freigabeliste' },
      { when: '2026 H2', what: 'Hybrides Routing lokal/Cloud plus dokumentierter Ausweich-Pfad bei Überlast' },
      { when: 'danach', what: 'Weitere Konsumenten hängen sich ohne Umbau an, Budgets wachsen mit dem Bedarf' },
    ],
    lessons: [
      'Eine Vermittlung vor eine Fremd-Abhängigkeit zu setzen kostet wenig und gibt viel: ein Kostenbild, einen Umschalt-Punkt und einen Ausfall-Pfad an einer Stelle statt in jedem Dienst.',
      'Zwei geläufige Anfrageformate am selben Endpunkt anzubieten macht einen Umzug billig: Bestehendes zeigt nur woanders hin.',
      'Ein Budget je Verursacher schützt besser als ein globaler Deckel, weil es den Schaden lokal hält und die Kosten sichtbar macht.',
      'Lokal als Standard, Cloud als bewusste Ausnahme, hält die laufenden Kosten nahe null, ohne auf Qualität zu verzichten, wo sie zählt.',
    ],
    metrics: [
      { label: 'Zugang', value: 'ein Endpunkt · zwei Anfrageformate' },
      { label: 'Steuerung', value: 'Schlüssel + Monatsbudget je Konsument' },
      { label: 'Routing', value: 'lokal zuerst · Cloud gezielt' },
      { label: 'Ausfall', value: 'selbsttätiger Ausweich-Pfad' },
    ],
  },
  'windows-ad-lab': {
    problem:
      'Linux betreibe ich täglich, Windows Server und Active Directory kannte ich bisher vor allem aus der Theorie. Für klassische Administrations-Rollen ist beides Alltag: Domäne, Benutzerverwaltung, Gruppenrichtlinien. Diese Lücke schließe ich praktisch, mit einem eigenen Lab statt nur mit Lektüre.',
    approach: [
      'Ein abgeschottetes Lab auf dem eigenen x86-Virtualisierungs-Cluster: ein Windows Server als Domänencontroller und ein Windows-Client als getrennte virtuelle Maschinen.',
      'Bewusst UEFI mit Secure Boot statt Legacy-BIOS, dazu ein virtuelles TPM; die Maschinen laufen on-demand statt im Dauerbetrieb, um Arbeitsspeicher für die produktiven Dienste frei zu halten.',
      'Der Domänen-Aufbau steht: die Active-Directory-Rolle, DNS und eine eigene Domäne sind eingerichtet, dazu erste Organisationseinheiten, ein Testbenutzer und eine Sicherheitsgruppe; als Nächstes die Gruppenrichtlinien in der Tiefe und der Domänen-Beitritt des Clients.',
      'Sauber dokumentierter Aufbau statt Klick-für-Klick-Anleitung, damit der Weg nachvollziehbar und wiederholbar bleibt.',
    ],
    architecture: {
      summary:
        'Auf einem Knoten des eigenen x86-Virtualisierungs-Clusters laufen zwei Windows-Maschinen als getrennte virtuelle Maschinen, beide mit UEFI, Secure Boot und virtuellem TPM: ein Server in der Rolle des Domänencontrollers, der die Active-Directory-Domäne mit integriertem DNS trägt, und ein Client, dessen Domänen-Beitritt noch aussteht. Im Verzeichnis liegen erste Organisationseinheiten, ein Testbenutzer und eine Sicherheitsgruppe; die Gruppenrichtlinien folgen. Das Lab läuft on-demand und weicht der produktiven Last.',
      tiers: [
        {
          label: 'Virtualisierung',
          nodes: [
            { id: 'node', label: 'Cluster-Knoten', note: 'on-demand, weicht produktiver Last', kind: 'edge' },
          ],
        },
        {
          label: 'Maschinen',
          nodes: [
            { id: 'dc', label: 'Domänencontroller', note: 'UEFI · Secure Boot · virtuelles TPM', kind: 'core' },
            { id: 'client', label: 'Client', note: 'Domänen-Beitritt steht aus', kind: 'consumer' },
          ],
        },
        {
          label: 'Verzeichnisdienst',
          nodes: [
            { id: 'ad', label: 'Active-Directory-Domäne', kind: 'core' },
            { id: 'dns', label: 'Integriertes DNS', kind: 'core' },
          ],
        },
        {
          label: 'Verzeichnis-Inhalt',
          nodes: [
            { id: 'ou', label: 'Organisationseinheiten', kind: 'data' },
            { id: 'users', label: 'Benutzer + Gruppen', kind: 'data' },
            { id: 'gpo', label: 'Gruppenrichtlinien', note: 'als Nächstes', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'node', to: 'dc', label: 'nur bei Bedarf' },
        { from: 'node', to: 'client' },
        { from: 'dc', to: 'ad' },
        { from: 'dc', to: 'dns', label: 'in der Domäne integriert' },
        { from: 'ad', to: 'ou' },
        { from: 'ad', to: 'users' },
        { from: 'ad', to: 'gpo', label: 'folgt' },
        { from: 'client', to: 'ad', label: 'Beitritt folgt' },
      ],
    },
    result: [
      'Der Domänencontroller läuft, die Active-Directory-Domäne steht mit eigenem, integriertem DNS; erste Organisationseinheiten, ein Testbenutzer und eine Sicherheitsgruppe sind angelegt.',
      'Der Client tritt als Nächstes der Domäne bei, und die Gruppenrichtlinien folgen in der Tiefe; der Stand bleibt bewusst ehrlich als im Aufbau ausgewiesen, ohne mehr zu behaupten, als schon läuft.',
    ],
    decisions: [
      {
        title: 'On-demand statt Dauerbetrieb',
        body: 'Das Lab läuft nur, wenn ich daran arbeite. Das hält Arbeitsspeicher für die produktiven Dienste frei und passt zum Lern-Charakter.',
      },
      {
        title: 'UEFI und Secure Boot von Anfang an',
        body: 'Näher an einer realen, aktuellen Windows-Umgebung als Legacy-BIOS, und ein bewusster Umgang mit Firmware-Einstellungen und virtuellem TPM.',
      },
      {
        title: 'Neben dem Linux-Schwerpunkt, nicht statt',
        body: 'Das Homelab bleibt Linux-zentriert. Das Windows-Lab verbreitert die Praxis gezielt um die klassischen Administrations-Themen, ohne den Schwerpunkt zu verschieben.',
      },
    ],
    timeline: [
      { when: '2026 H2', what: 'Virtualisierung aufgesetzt, Windows-Server- und Client-VM bootbereit' },
      { when: '2026 H2', what: 'Domänencontroller live: Active-Directory-Domäne mit integriertem DNS, erste Organisationseinheiten, Benutzer und Gruppen' },
      { when: 'als Nächstes', what: 'Gruppenrichtlinien in der Tiefe und Domänen-Beitritt des Clients' },
    ],
    lessons: [
      'Eine eigene Umgebung aufzusetzen zwingt zu Details, die eine Anleitung überspringt: Firmware, Secure Boot, virtuelles TPM, Treiber.',
      'Ehrlich zu dokumentieren, was schon läuft und was noch aussteht, ist wertvoller als ein geschöntes Ergebnis.',
    ],
  },
  'media-vault': {
    problem:
      'Eine Medien-Bibliothek liegt normalerweise entschlüsselt auf der Platte, und der Medien-Server läuft rund um die Uhr, damit man sie ansehen kann. Beides ist unnötig: Wer die Platte in die Hand bekommt, liest alles mit, und ein Dienst, der pro Woche zwei Stunden gebraucht wird, belegt trotzdem dauerhaft Arbeitsspeicher. Ich wollte, dass die Bibliothek verschlüsselt liegen bleibt und sich nur öffnet, wenn ich sie wirklich nutze.',
    approach: [
      'Die Bibliothek liegt verschlüsselt auf der Platte und wird nur bei Bedarf eingehängt, statt dauerhaft im Klartext bereitzuliegen.',
      'Eine schlanke Oberfläche nimmt die Entsperr-Phrase entgegen und reicht sie nur flüchtig an die Verschlüsselungs-Schicht weiter; sie wird nirgends gespeichert, weder auf der Platte noch in einer Sitzung.',
      'Der Medien-Server folgt dem Zustand der Bibliothek: nach dem Einhängen fährt er hoch, beim Sperren geht er wieder herunter und die Bibliothek wird ausgehängt. Beides ist ein Vorgang, nicht zwei getrennte Handgriffe.',
      'Vor dem Start des Servers wird geprüft, ob unter dem Einhänge-Punkt wirklich die entschlüsselte Bibliothek liegt, und nicht ein leeres Verzeichnis, weil das Einhängen still gescheitert ist.',
      'Bewusst ohne Web-Framework gebaut, nur mit der Standard-Bibliothek der Sprache: für eine Oberfläche mit drei Knöpfen, die an einem Schlüssel sitzt, ist jede zusätzliche Abhängigkeit Angriffsfläche ohne Gegenwert.',
      'Der Zugang bleibt aufs eigene Netz begrenzt; nach außen ist nichts davon erreichbar.',
    ],
    architecture: {
      summary:
        'Die Bibliothek liegt verschlüsselt auf der Platte. Eine kleine Oberfläche im eigenen Netz nimmt die Entsperr-Phrase entgegen und gibt sie flüchtig an die Verschlüsselungs-Schicht weiter, die das Klartext-Verzeichnis nur im Arbeitsspeicher bereitstellt. Erst wenn eine Prüfmarke belegt, dass dort wirklich die Bibliothek liegt, fährt der Medien-Server hoch. Beim Sperren geht er herunter und das Verzeichnis wird wieder ausgehängt.',
      tiers: [
        {
          label: 'Eigenes Netz',
          nodes: [
            { id: 'ui', label: 'Entsperr-Oberfläche', note: 'Phrase nur flüchtig, nie gespeichert', kind: 'edge' },
          ],
        },
        {
          label: 'Verschlüsselung',
          nodes: [
            { id: 'fs', label: 'Verschlüsselungs-Schicht', note: 'hängt on-demand ein', kind: 'core' },
            { id: 'check', label: 'Prüfmarke', note: 'liegt die Bibliothek wirklich da?', kind: 'core' },
          ],
        },
        {
          label: 'Dienst',
          nodes: [
            { id: 'server', label: 'Medien-Server', note: 'folgt dem Einhänge-Zustand', kind: 'consumer' },
          ],
        },
        {
          label: 'Daten',
          nodes: [
            { id: 'cipher', label: 'Verschlüsselte Bibliothek', note: 'Ruhezustand', kind: 'data' },
            { id: 'plain', label: 'Klartext-Sicht', note: 'nur während der Nutzung', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'ui', to: 'fs', label: 'Phrase, flüchtig' },
        { from: 'cipher', to: 'fs' },
        { from: 'fs', to: 'plain', label: 'einhängen' },
        { from: 'plain', to: 'check' },
        { from: 'check', to: 'server', label: 'erst dann starten' },
        { from: 'ui', to: 'server', label: 'sperren: herunterfahren' },
      ],
    },
    result: [
      'Die Bibliothek liegt im Normalzustand verschlüsselt; entschlüsselt ist sie nur, solange sie tatsächlich genutzt wird.',
      'Entsperren und Sperren sind je ein Vorgang: Bibliothek und Medien-Server gehen gemeinsam auf und gemeinsam zu, statt getrennt gepflegt zu werden.',
      'Die Entsperr-Phrase wird nur durchgereicht und nirgends abgelegt, auch nicht in einer Sitzung.',
      'Ein still gescheitertes Einhängen führt nicht mehr dazu, dass der Medien-Server auf ein leeres Verzeichnis startet und die Bibliothek als verschwunden meldet.',
      'Der Stand bleibt bewusst als im Aufbau ausgewiesen: der Kern läuft, der Feinschliff steht noch aus.',
    ],
    decisions: [
      {
        title: 'Verschlüsselt als Normalzustand, nicht als Zusatz',
        body: 'Eine Bibliothek, die nur beim Herunterfahren verschlüsselt wird, liegt im Alltag offen. Umgekehrt herum gedacht ist der Ruhezustand verschlüsselt und die Klartext-Sicht die Ausnahme, die man bewusst herstellt.',
      },
      {
        title: 'Der Dienst folgt den Daten',
        body: 'Ein Medien-Server, der läuft, während die Bibliothek zu ist, meldet dem Nutzer eine leere oder kaputte Sammlung und schreibt womöglich seinen Katalog leer. Ihn an den Einhänge-Zustand zu koppeln macht aus zwei Zuständen einen.',
      },
      {
        title: 'Erst prüfen, dann starten',
        body: 'Ein Einhängen kann still scheitern, und darunter liegt dann ein leeres Verzeichnis, das genauso aussieht wie ein leeres Verzeichnis. Eine Prüfmarke im entschlüsselten Baum unterscheidet die beiden Fälle, bevor der Server startet.',
      },
      {
        title: 'Keine Abhängigkeit ohne Gegenwert',
        body: 'Für drei Knöpfe vor einem Schlüssel bringt ein Web-Framework nichts als Angriffsfläche und Update-Pflicht. Die Standard-Bibliothek reicht, und was nicht da ist, muss auch nicht gepatcht werden.',
      },
    ],
    metrics: [
      { label: 'Ruhezustand', value: 'verschlüsselt' },
      { label: 'Entsperr-Phrase', value: 'nur flüchtig, nie gespeichert' },
      { label: 'Medien-Server', value: 'läuft nur bei entsperrter Bibliothek' },
      { label: 'Fremd-Abhängigkeiten', value: 'keine' },
    ],
    lessons: [
      'Verschlüsselung im Ruhezustand nützt wenig, wenn der Klartext-Zustand der Alltag ist. Die Frage ist nicht, ob verschlüsselt wird, sondern wie lange entschlüsselt bleibt.',
      'Wenn ein Dienst auf Daten zeigt, die verschwinden können, muss er ihren Zustand kennen. Sonst schreibt er im schlimmsten Fall seinen eigenen Katalog gegen ein leeres Verzeichnis.',
      'Ein still gescheitertes Einhängen ist von einem leeren Verzeichnis nicht zu unterscheiden, solange man nicht ausdrücklich nachsieht.',
    ],
  },
  'ressourcen-arbiter': {
    problem:
      'Ein Knoten des Virtualisierungs-Clusters sollte sieben schwere Dienste tragen, dazu ein Windows-Lab, das gelegentlich hochgefahren wird. Der Arbeitsspeicher reicht für genau eine dieser Rollen. Gebraucht werden sie fast nie gleichzeitig, aber wann welche gebraucht wird, weiß vorher niemand. Die naheliegenden Auswege taugen beide nichts: alles dauerhaft laufen lassen sprengt den Knoten und lässt am Ende den Kernel entscheiden, welcher Prozess stirbt; alles von Hand starten und stoppen heißt, dass ich der Scheduler bin und niemand etwas nutzen kann, während ich schlafe. Dazu kam eine zweite Anforderung: die Dienste sollten von außen erreichbar sein, ohne am Heimanschluss einen Port zu öffnen und ohne die Anschluss-Adresse preiszugeben.',
    approach: [
      'Jede schwere Rolle bekommt einen eigenen, unprivilegierten Gast auf dem Knoten und läuft darin als regulärer systemd-Dienst, nicht als handgestarteter Prozess in einer Sitzung.',
      'Ein eigener Regler plant den Knoten: er kennt die Rollen als Einträge in einer Registrierdatei, nicht als Sonderfälle im Code. Eine neue Rolle aufzunehmen heißt, einen Eintrag zu schreiben, nicht den Regler anzufassen.',
      'Statt zu raten, ob eine Rolle gebraucht wird, fragt der Regler sie nach ihrer echten Auslastung: je nach Dienst über die Server-Abfrage des Spiele-Netzwerks, über die Verwaltungs-Konsole des Dienstes oder über die Zahl der bestehenden Verbindungen auf dem Dienst-Port. Wer keine Nutzer hat, wird nach zwanzig Minuten abgeschaltet.',
      'Fordert jemand eine Rolle an, verdrängt der Regler die laufende, prüft vorher den freien Arbeitsspeicher gegen eine je Rolle hinterlegte Untergrenze und fährt die alte sauber herunter, bevor die neue startet.',
      'Dienste, die auf ein Abbruch-Signal nicht sauber reagieren und ihren Zustand verlieren würden, bekommen beim Herunterfahren ihre eigenen Speicher- und Beende-Befehle auf die Server-Konsole geschickt, statt dem Standardweg zu vertrauen.',
      'Der öffentliche Zugang läuft ausschließlich über einen VPN-Tunnel zu einem eigenen Server am Netz-Rand, der den Verkehr auf den Gast weiterleitet. Am Heimrouter ist kein Port geöffnet, nach außen ist nur die Adresse des Edge-Servers sichtbar.',
      'Dienste, die sich selbst bei einem öffentlichen Verzeichnis anmelden, würden dabei die Anschluss-Adresse verraten. Für sie läuft der gesamte ausgehende Verkehr des Gasts durch den Tunnel, damit das Verzeichnis die Adresse des Edge-Servers sieht; der Zugriff aus dem eigenen Netz bleibt über eine Routing-Regel direkt.',
      'Jeder Gast bekommt eine eigene Firewall-Regel: die Dienst-Ports nur aus dem Tunnel und vom Knoten, die Verwaltungs-Zugänge ausschließlich aus dem eigenen Netz.',
      'Gesteuert wird über eine kleine, token-geschützte Brücke im eigenen Netz: aus einem Chat-Befehl heraus oder über eine Weboberfläche, die zwischen Wecken und Verdrängen nach Rolle unterscheidet.',
      'Die Zustands-Daten der Rollen liegen im Dateisystem der Gäste und wurden von der dateibasierten Sicherung nicht erfasst. Ein Schritt vor jeder Sicherung zieht sie heraus, danach gehen sie verschlüsselt an einen entfernten Ort.',
    ],
    architecture: {
      summary:
        'Anfragen von außen erreichen einen eigenen Server am Netz-Rand, der sie durch einen VPN-Tunnel auf den jeweiligen Gast weiterleitet; am Heimanschluss ist kein Port geöffnet. Auf dem Knoten entscheidet ein Regler anhand einer Registrierdatei und echter Auslastungs-Abfragen, welche der schweren Rollen laufen darf, verdrängt die vorige mit gesichertem Zustand und schaltet Leerlauf ab. Gesteuert wird über eine token-geschützte Brücke im eigenen Netz, und die Zustands-Daten der Gäste gehen über einen Vor-Sicherungs-Schritt verschlüsselt an einen entfernten Ort.',
      tiers: [
        {
          label: 'Öffentlich',
          nodes: [
            { id: 'user', label: 'Zugriff von außen', kind: 'edge' },
            { id: 'relay', label: 'Server am Netz-Rand', note: 'Weiterleitung · kein Port am Heimanschluss', kind: 'edge' },
          ],
        },
        {
          label: 'Steuerung',
          nodes: [
            { id: 'ui', label: 'Chat-Befehl · Weboberfläche', note: 'Rollen: wecken vs. verdrängen', kind: 'edge' },
            { id: 'bridge', label: 'Steuer-Brücke', note: 'nur eigenes Netz · Token', kind: 'core' },
          ],
        },
        {
          label: 'Knoten',
          nodes: [
            { id: 'arbiter', label: 'Regler', note: 'Registrierdatei · Auslastungs-Abfrage', kind: 'core' },
            { id: 'guests', label: 'Gäste je Rolle', note: 'systemd · sauberes Speichern beim Stopp', kind: 'core' },
          ],
        },
        {
          label: 'Daten',
          nodes: [
            { id: 'state', label: 'Zustands-Daten', kind: 'data' },
            { id: 'offsite', label: 'Verschlüsselt off-site', note: 'über Vor-Sicherungs-Schritt', kind: 'data' },
          ],
        },
      ],
      flows: [
        { from: 'user', to: 'relay', label: 'nur über den Rand' },
        { from: 'relay', to: 'guests', label: 'VPN-Tunnel' },
        { from: 'ui', to: 'bridge' },
        { from: 'bridge', to: 'arbiter', label: 'wecken · schlafen' },
        { from: 'arbiter', to: 'guests', label: 'verdrängen · abschalten' },
        { from: 'guests', to: 'state' },
        { from: 'state', to: 'offsite' },
      ],
    },
    result: [
      'Sieben schwere Rollen teilen sich einen Knoten, der Arbeitsspeicher für eine hat, ohne je zu überbuchen: es läuft immer genau eine, und der Knoten ist still, wenn niemand etwas nutzt.',
      'Abgeschaltet wird nach echter Auslastung, nicht nach Vermutung: jede Rolle wird auf dem Weg abgefragt, der bei ihr tatsächlich die Nutzerzahl liefert.',
      'Eine neue Rolle aufzunehmen ist ein Eintrag in einer Registrierdatei, keine Code-Änderung am Regler.',
      'Am Heimanschluss ist kein einziger Port geöffnet, und die Anschluss-Adresse taucht auch dort nicht auf, wo die Dienste sich selbst öffentlich anmelden.',
      'Rollen, die ihren Zustand bei einem einfachen Abbruch verlieren würden, speichern beim Herunterfahren nachweislich sauber, statt auf gut Glück beendet zu werden.',
      'Die Zustands-Daten liegen verschlüsselt an einem entfernten Ort, obwohl sie in Gast-Dateisystemen liegen, die die normale Dateisicherung nicht sieht.',
    ],
    decisions: [
      {
        title: 'Verdrängen statt überbuchen',
        body: 'Alles gleichzeitig laufen zu lassen hätte bedeutet, dass der Kernel unter Druck entscheidet, welcher Prozess stirbt, und zwar ohne Rücksicht darauf, ob jemand gerade damit arbeitet. Ein Regler, der bewusst verdrängt und vorher sauber herunterfährt, tauscht ein unkontrolliertes Risiko gegen eine kontrollierte Entscheidung.',
      },
      {
        title: 'Echte Auslastung messen statt schätzen',
        body: 'Eine Zeitschaltung oder ein Prozess-Merkmal hätte laufende Nutzung abgewürgt oder leere Dienste ewig am Leben gelassen. Deshalb wird je Dienst der Weg genommen, der die echte Nutzerzahl liefert, auch wenn das drei verschiedene Verfahren bedeutet. Nur so ist eine automatische Abschaltung überhaupt verantwortbar.',
      },
      {
        title: 'Rollen als Daten, nicht als Code',
        body: 'Die erste Fassung kannte genau einen Dienst und hatte ihn fest verdrahtet. Sobald der zweite dazukam, wurde daraus eine Registrierdatei: Zugangsdaten, Abfrage-Verfahren, Speicher-Untergrenze und Leerlauf-Frist je Eintrag. Seitdem ist jede weitere Rolle Konfiguration statt Sonderfall, und der Regler bleibt beim Wachsen gleich groß.',
      },
      {
        title: 'Kein Port am Heimanschluss',
        body: 'Eine Portfreigabe am Heimrouter hätte den Anschluss dauerhaft sichtbar gemacht und jede Rolle direkt exponiert. Der Umweg über einen eigenen Server am Netz-Rand kostet eine Tunnel-Strecke, hält die Anschluss-Adresse aber vollständig aus dem Spiel und lässt die Freigabe an einer Stelle verwalten statt an sieben.',
      },
      {
        title: 'Dem Standard-Abbruch nicht blind vertrauen',
        body: 'Zwei der Dienste beenden sich auf das übliche Abbruch-Signal, ohne ihren Zustand vollständig zu schreiben, was beim Verdrängen still Fortschritt gekostet hätte. Sie bekommen deshalb beim Herunterfahren ihre eigenen Speicher-Befehle auf die Konsole geschickt, und dass das greift, ist in den Server-Protokollen nachgeprüft.',
      },
    ],
    metrics: [
      { label: 'Schwere Rollen auf einem Knoten', value: 'sieben, plus ein Windows-Lab' },
      { label: 'Gleichzeitig aktiv', value: 'genau eine' },
      { label: 'Abschaltung bei Leerlauf', value: 'nach zwanzig Minuten' },
      { label: 'Offene Ports am Heimanschluss', value: 'keiner' },
    ],
    timeline: [
      { when: '2026 H2', what: 'Erste Rolle als eigener Gast mit systemd-Dienst, Regler mit fest verdrahteter Verdrängung' },
      { when: '2026 H2', what: 'Registrierdatei eingeführt: weitere Rollen sind ein Eintrag, keine Code-Änderung' },
      { when: '2026 H2', what: 'Öffentlicher Zugang über den Server am Netz-Rand, Anschluss-Adresse auch bei selbst-anmeldenden Diensten verborgen' },
      { when: '2026 H2', what: 'Sauberes Speichern beim Verdrängen, Abschaltung nach echter Auslastung, Zustands-Daten off-site' },
    ],
    lessons: [
      'Ein Regler, der raten muss, ob etwas gebraucht wird, wird entweder zu vorsichtig oder zu grob. Erst eine echte Auslastungs-Abfrage macht automatisches Abschalten verantwortbar.',
      'Sobald ein zweiter Fall auftaucht, gehört die Fallunterscheidung in Konfiguration statt in Code, sonst wächst der Regler mit jedem Dienst.',
      'Sauber herunterfahren ist kein Detail: dass ein Dienst auf das Standard-Signal beendet wird, heißt nicht, dass er seinen Zustand geschrieben hat, und das merkt man erst beim nächsten Start.',
      'Erreichbarkeit von außen und eine verborgene Anschluss-Adresse schließen sich nicht aus, aber der Umweg muss auch den ausgehenden Verkehr abdecken, sonst verrät ein Dienst sich beim Anmelden selbst.',
      'Ein Backup, das nur Dateien auf dem Host sieht, übersieht genau die Daten, die in den Gästen entstehen. Was gesichert wird, muss man prüfen, nicht annehmen.',
    ],
  },
};

/** Englische Case-Studies (zwei Übersetzungs-Hälften), feldweiser DE-Fallback. */
const PROJECT_DETAILS_EN: Record<string, ProjectDetail> = {
  ...PROJECT_DETAILS_EN_1,
  ...PROJECT_DETAILS_EN_2,
};

/** Case-Study eines Projekts in der gewählten Sprache (EN fällt auf DE zurück). */
export function getProjectDetail(id: string, locale: Locale): ProjectDetail | undefined {
  if (locale === 'en') return PROJECT_DETAILS_EN[id] ?? PROJECT_DETAILS[id];
  return PROJECT_DETAILS[id];
}
