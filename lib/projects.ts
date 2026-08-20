/**
 * Kuratierte Public-Liste, bewusst NICHT aus cockpit/lib/apps-registry.ts importiert,
 * weil das interne Hosts/IPs enthält. Drift ist hier akzeptabel: das Cockpit ist
 * Werkzeug, das Portfolio ist Schaufenster.
 *
 * Privacy-Regel: keine IPs, keine Container-Namen, keine Hostnames.
 */
import type { Locale } from './i18n/config';

export type Domain = 'Suite' | 'AI' | 'Infra' | 'Bots' | 'Web';
export type ProjectStatus = 'live' | 'im-aufbau' | 'wartung' | 'pivot';

/**
 * Architektur-Skizze pro Projekt, bewusst als deklarative Daten, damit das
 * Render-Component sie privacy-safe und on-brand zeichnet. WICHTIG: `label`/`note`
 * tragen NUR generische Rollen ('Browser', 'BFF', 'Control-Plane', 'AI-Compute'),
 * niemals Hostnames, IPs oder Container-Namen (Privacy-Regel, siehe CLAUDE.md).
 */
export type ArchKind = 'edge' | 'core' | 'data' | 'consumer';

export interface ArchNode {
  id: string;
  /** Generische Rolle, kein Hostname. */
  label: string;
  /** Optionale zweite Zeile, generisch ('OIDC', 'WebSocket', 'read-only'). */
  note?: string;
  /** Visuelle Gewichtung: außen/öffentlich · zentral · Speicher · Abnehmer. */
  kind?: ArchKind;
}

export interface ArchTier {
  /** Spalten-Überschrift, generisch ('Öffentlich', 'Intern', 'Daten'). */
  label: string;
  nodes: ArchNode[];
}

export interface Architecture {
  /** Prosa-Beschreibung des Datenflusses, dient als aria-label, figcaption und Crawler-Text. */
  summary: string;
  tiers: ArchTier[];
  /** Optionale beschriftete Kanten zwischen Knoten (per id). */
  flows?: { from: string; to: string; label?: string }[];
}

export interface ProjectDetail {
  problem: string;
  approach: string[];
  architecture?: Architecture;
  result: string[];
  decisions: { title: string; body: string }[];
  metrics?: { label: string; value: string }[];
  timeline?: { when: string; what: string }[];
  /**
   * Optionale, ehrliche Grenzen und Trade-offs des Systems. Bewusst als Eigenbetrieb
   * gerahmt (kein Produktions-/Team-Kontext behauptet): zeigt Selbstauskunft darüber,
   * wo der Bau aufhört, genau das, was ein technischer Reviewer als Erstes hinterfragt.
   * Nur gesetzt, wo es echt etwas zu sagen gibt.
   */
  limits?: string[];
  /**
   * Optionale Modul-Liste für Suiten, die mehrere Apps unter einem Dach bündeln
   * (z. B. Saganta). Rein generische App-Namen, keine Hostnames/interne IDs.
   * Wird als dezente Chip-Leiste oben auf der Detailseite gezeigt, damit das
   * „ein Dach, viele Apps“-Bild scanbar wird statt nur in der Prosa zu stecken.
   */
  modules?: string[];
}

/**
 * Ein benanntes Quelltext-Repo. Ein Projekt (Gartiko, Saganta …) besteht oft aus
 * mehreren öffentlichen Teilen, statt je Teil ein eigenes Portfolio-Projekt anzulegen,
 * bündelt `Project.repos` sie unter EINEM Projekt. `note`/`noteEn` (optional) sagt in
 * einem Halbsatz, was der Teil ist. Nur neutrale, öffentliche Repos, keine internen.
 */
export interface RepoLink {
  url: string;
  label: string;
  note?: string;
  noteEn?: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  role: string;
  year: string;
  highlight: string;
  stack: string[];
  domain: Domain;
  status: ProjectStatus;
  href?: string;
  repo?: string; // öffentliches Quelltext-Repo (GitHub), falls das Projekt Open Source ist, Kurzform für 1 Repo
  repos?: RepoLink[]; // mehrere benannte Quelltext-Teile (hat Vorrang vor `repo`)
  detail?: ProjectDetail;
  // Optionale englische Varianten (additiv; fehlt eine, greift die deutsche als Fallback).
  // Werden vom Store durchgereicht und im Admin bearbeitbar. `title`/`year`/`stack`/`domain`
  // bleiben sprachneutral (Eigennamen/Tech/Zeitraum).
  taglineEn?: string;
  descriptionEn?: string;
  highlightEn?: string;
  roleEn?: string;
}

/** Für die Anzeige aufgelöste, sprachabhängige Textfelder eines Projekts. */
export interface LocalizedProjectText {
  title: string;
  tagline: string;
  description: string;
  role: string;
  highlight: string;
}

/**
 * Löst die anzuzeigenden Textfelder für eine Sprache auf. EN fällt feldweise auf DE
 * zurück, solange keine Übersetzung vorliegt: so bleibt die Seite immer vollständig.
 */
export function localizedProject(p: Project, locale: Locale): LocalizedProjectText {
  const en = locale === 'en';
  return {
    title: p.title,
    tagline: en ? p.taglineEn ?? p.tagline : p.tagline,
    description: en ? p.descriptionEn ?? p.description : p.description,
    role: en ? p.roleEn ?? p.role : p.role,
    highlight: en ? p.highlightEn ?? p.highlight : p.highlight,
  };
}

export const PROJECTS: Project[] = [
  {
    id: 'saganta',
    title: 'Saganta',
    tagline: 'Mail, Kalender, Wertsachen und Alltags-Apps unter einer Anmeldung.',
    description:
      'Meine eigene Produktivitäts-Suite mit Mail, Kalender, Wertsachen, einem Projekt-Deck und Alltags-Apps von Vorrat bis Essensplanung. Alles läuft unter einer Anmeldung auf eigener Domain. Keine der Sub-Apps spricht direkt mit einem Backend, dazwischen sitzt pro Domäne ein Backend-for-Frontend, das die Session prüft und nur die freigegebenen Felder durchreicht. Ein eigener Auth-Dienst stellt dieselbe Session für das Web und die nativen Android-Apps aus. Die Anwendungen laufen nicht komplett getrennt voneinander. Marktwatch kann zum Beispiel Werte im Asset-System aktualisieren, während fertige Briefe automatisch im Archiv landen. Dadurch muss ich dieselben Daten nicht in mehreren Diensten manuell pflegen. Angefangen hat das als Familien-Suite.',
    role: 'Architektur, Implementation, laufender Ausbau',
    year: 'seit 2026',
    highlight: 'Eine Anmeldung für das Web und die nativen Android-Apps.',
    stack: ['SvelteKit', 'FastAPI', 'better-auth', 'SQLite', 'Kotlin'],
    domain: 'Suite',
    status: 'live',
    href: 'https://saganta.de',
  },
  {
    id: 'homelab',
    title: 'Homelab',
    tagline: 'Über 160 eigene Dienste auf mehreren Hosts, seit 2024 im Dauerbetrieb.',
    description:
      'Über 160 Dienste laufen bei mir zuhause im Dauerbetrieb, verteilt auf mehrere kleine Rechner und einen Virtualisierungs-Cluster. Welcher Dienst wo laufen soll, steht in einer einzigen Datei; ein Abgleich meldet mir jeden Container, der davon abweicht. Die Dienste reden über einen gemeinsamen Event-Bus miteinander, und eine Routen-Probe schlägt an, wenn eine öffentliche Domain nicht mehr antwortet. Die Container laufen ohne Root und mit read-only Dateisystem, das Netz ist in Zonen geschnitten.',
    role: 'Aufbau, Design, Betrieb, On-Call',
    year: 'seit 2024',
    highlight: 'Über 160 Dienste im Dauerbetrieb, keine Abweichung vom dokumentierten Soll-Zustand',
    stack: ['Docker', 'Prometheus', 'MQTT', 'cloudflared', 'WireGuard'],
    domain: 'Infra',
    status: 'live',
    repos: [
      {
        url: 'https://github.com/sami-djouhri/brain-bus',
        label: 'Brain-Bus (Event → Aktion)',
        note: 'Event-getriebene Ops-Automation: gleicht MQTT-Ereignisse gegen ein Regelwerk ab und macht daraus Benachrichtigungen oder bestätigungs-gesicherte Aktionen.',
        noteEn: 'Event-driven ops automation: matches MQTT events against a rule set and turns them into notifications or confirmation-gated actions.',
      },
      {
        url: 'https://github.com/sami-djouhri/mqtt-event-tap',
        label: 'MQTT-Event-Tap',
        note: 'Ein schlanker Infrastruktur-Dienst, der einen ganzen MQTT-Themenbaum abonniert und jede Nachricht als strukturierte JSON-Logs ausgibt.',
        noteEn: 'A tiny infrastructure service that subscribes to an entire MQTT topic tree and prints every message as structured JSON logs.',
      },
    ],
  },
  {
    id: 'lernen',
    title: 'Coach-Familie',
    tagline: 'Sechs Lern-Apps auf einem geteilten Kern, je eine Prüfung.',
    description:
      'Mehrere eigenständige Lern-Apps auf einem geteilten Kern, jede für eine andere Prüfung. Lernlogik, Design-System und die Android-Module liegen einmal vor und werden in die Apps synchronisiert. Datenbank, Auth und Theme sind dagegen pro App getrennt, damit eine Änderung an einer Prüfung die anderen fünf nicht anfasst. Eine Lern-Session führt vom Lesen direkt ins Üben und schlägt den nächsten Schritt vor, statt zurück ins Menü zu werfen. Eine neue Prüfung kommt als weitere App auf demselben Fundament dazu, ohne dass ich den Kern anfassen muss.',
    role: 'Design, Backend, Frontend, Android',
    year: 'seit 2025',
    highlight: 'Ein geteilter Kern, sechs eigenständige Apps, Web und native Android',
    stack: ['Next.js', 'SQLite', 'Compose Multiplatform', 'Hilt'],
    domain: 'Suite',
    status: 'live',
    href: 'https://lernen.meisterminze.de',
  },
  {
    id: 'home-digital-twin',
    title: 'Home Digital Twin',
    tagline: 'Grundriss und 3D-Ansicht des eigenen Hauses auf einer Datenschicht.',
    description:
      'Ein 2D-Grundriss zum Schalten und eine 3D-Szene für den Wechsel zwischen Räumen und Etagen, beide auf derselben Datenschicht. Statuswechsel kommen über WebSocket an, nicht per Polling: schalte ich das Licht am Schalter, springt es sofort auch im Grundriss um. Geräte lassen sich per Drag-and-drop an ihren Platz ziehen, und Klimaverläufe kann ich über mehrere Räume hinweg vergleichen.',
    role: 'Architektur, Backend, Frontend, Raum-Modell',
    year: 'seit 2026',
    highlight: '2D und 3D auf einer Datenschicht, Status in Echtzeit',
    stack: ['TypeScript', 'React', 'Three.js', 'FastAPI', 'WebSocket'],
    domain: 'Infra',
    status: 'live',
  },
  {
    id: 'homelab-app',
    title: 'Homelab-Cockpit',
    tagline: 'Android-App, die Dienste startet und stoppt, erreichbar nur übers eigene VPN.',
    description:
      'Ein nativer Android-Begleiter für mein Homelab: Host-Metriken, Dienste starten, stoppen und neu starten samt Logs, dazu eine Inbox für offene Punkte. Die App spricht ausschließlich ein privates Gateway über mein eigenes VPN an. Gekoppelt wird per QR-Scan, der einen gerätegebundenen Schlüssel im Android-KeyStore erzeugt und gegen ein Client-Zertifikat für mTLS eintauscht; der Schlüssel verlässt das Gerät nie. Wer die App ohne Gateway ansehen will, kann einen Demo-Modus starten.',
    role: 'Design, Mobile-Engineering, Sicherheitsmodell',
    year: 'seit 2026',
    highlight: 'Container-Steuerung und Host-Metriken vom Handy, gerätegebundenes mTLS-Pairing, Zugang nur übers eigene VPN',
    stack: ['Kotlin', 'Jetpack Compose', 'Hilt', 'Retrofit', 'Android Keystore'],
    domain: 'Suite',
    status: 'live',
    repo: 'https://github.com/sami-djouhri/homelab-app',
  },
  {
    id: 'homelab-sentinel',
    title: 'Homelab-Sentinel',
    tagline: 'Ein Discord-Bot als Bereitschaftsdienst fürs eigene Homelab.',
    description:
      'Ein Discord-Bot ist mein Bereitschaftsdienst fürs Homelab. Er meldet Container-Health und Alarme aus dem hauseigenen Event-Bus dorthin, wo ich ohnehin schon bin. Neue Prüfungen kommen als getrennte Module dazu. So kann ich beispielsweise Backups, VPN-Verbindungen, Updates oder fehlgeschlagene Dienste überwachen, ohne für jede neue Prüfung den restlichen Bot umzubauen.',
    role: 'Design, Cog-Architektur, Event-Anbindung',
    year: 'seit 2026',
    highlight: 'Jede Prüfung ein eigenes Modul, der Kern bleibt unangetastet',
    stack: ['Python', 'discord.py', 'Prometheus', 'MQTT'],
    domain: 'Bots',
    status: 'live',
  },
  {
    id: 'marktwatch',
    title: 'Marktwatch',
    tagline: 'Rechnet Schnäppchen mit Preisverteilungen durch und meldet nur, was auch im schlechten Fall trägt.',
    description:
      'Marktwatch durchforstet Kleinanzeigen und eBay nach unterbewerteter Homelab-Hardware und meldet mir echte Schnäppchen per Discord, ohne bei Mengenrabatt-Tricks, Varianten-Verwechslern oder Bundles Fehlalarm zu schlagen. Die Fehlalarm-Abwehr läuft in Schichten: erst ein kostenloser Regel-Filter, dann ein kleines Sprachmodell nur für Grenzfälle, beides hinter einem gemeinsamen Gate, durch das Echtzeit-Alarm und Tages-Digest gleichermaßen müssen. Gerechnet wird mit Preisverteilungen. Eine Empfehlung kommt nur, wenn selbst das schlechteste Szenario noch Gewinn lässt (ein 5%-Quantil und der erwartete Verlust darunter), samt höchstem sinnvollem Gebot. Alles Unumkehrbare bleibt hinter einem Zwei-Flag-Gate, beobachtend als Default.',
    role: 'Architektur, Crawler, Deal-Mathematik, Fehlalarm-Abwehr',
    year: 'seit 2025',
    highlight: 'Meldet nur, wenn selbst der schlechte Fall noch Gewinn lässt',
    stack: ['FastAPI', 'PostgreSQL', 'BeautifulSoup', 'APScheduler'],
    domain: 'Bots',
    status: 'live',
  },
  {
    id: 'ai-vision',
    title: 'AI-Vision · Edge-Inferenz',
    tagline: 'Bilderkennung auf eigener Edge-Hardware im Heimnetz.',
    description:
      'Bilderkennung läuft auf einer GPU im Heimnetz, ohne dass ein Bild einen Cloud-Dienst sieht. Die Edge-Hardware ist erste Generation: knapper Speicher, alte Toolchain, kaum ein Paket installiert sich von der Stange. Ich habe jeden Stolperstein einmal gelöst und aufgeschrieben, bis der Aufbau reproduzierbar war. Eine API kapselt die Hardware-Bindung, andere Dienste holen sich die Inferenz, ohne die GPU dahinter zu kennen. Nach einem Umbau der Verkabelung war die Hardware eine Weile nicht erreichbar; dass der abnehmende Dienst das als Ausfall meldete statt Platzhalter zu liefern, hat sich in genau diesem Fall bezahlt gemacht. Seit dem Wiederanlauf läuft die Pipeline wieder.',
    role: 'Plattform-Bring-up, Integration, Hardening',
    year: 'seit 2026',
    highlight: 'Lokale GPU-Inferenz im Heimnetz, unabhängig von der Cloud',
    stack: ['PyTorch', 'YOLOv5', 'FastAPI'],
    domain: 'AI',
    status: 'live',
    repos: [
      {
        url: 'https://github.com/sami-djouhri/perception-orchestrator',
        label: 'Perception-Orchestrator',
        note: 'Die Steuerzentrale der Perzeptions-Pipeline: macht aus eingehenden Dateien idempotente Jobs, verteilt sie an den GPU-Edge-Worker und meldet den Status über MQTT.',
        noteEn: 'The control center of the perception pipeline: turns incoming files into idempotent jobs, dispatches them to the GPU edge worker and reports status over MQTT.',
      },
    ],
  },
  {
    id: 'shops',
    title: 'Shop-Hosting',
    tagline: 'Mehrere WooCommerce-Shops auf eigener Infrastruktur, aus einer Härtungs-Quelle.',
    description:
      'Mehrere WooCommerce-Shops, die ich auf eigener Infrastruktur baue und betreibe. Standard-WooCommerce bringt kein Hardening mit, und je mehr Instanzen dazukommen, desto teurer wird die Pflege pro Stück. Deshalb liegen Templates, Deploy-Pfad und Restore-Prozedur an einer Stelle, aus der jede Instanz liest. Eine neue Instanz erbt das fertige Hardening-Bundle, und eine Korrektur muss ich nur einmal schreiben.',
    role: 'Hosting, Hardening, Maintenance',
    year: 'seit 2024',
    highlight: 'Eine neue Instanz erbt das Hardening fertig, Korrekturen wirken überall',
    stack: ['WordPress', 'WooCommerce', 'nginx', 'Docker'],
    domain: 'Web',
    status: 'im-aufbau',
  },
  {
    id: 'wissens-foederation',
    title: 'Wissens-Föderation',
    tagline: 'Eine Such-API über elf eigene Datenquellen. Das Frontend kennt keine davon.',
    description: 'Ich wollte nicht jedes Mal überlegen, ob eine Information gerade in einer Notiz, einer Mail oder im Inventar liegt. Deshalb fragt die Suche mehrere Systeme ab und bringt die Treffer in ein gemeinsames Format. Die eigentlichen Daten bleiben weiterhin in ihren jeweiligen Anwendungen. Elf Quellen hängen inzwischen dran, von Dokumenten und Inventar über Marktdaten und Briefe bis zu Büchern und Prüfungsstoff. Jede steckt hinter einem eigenen Adapter, die Abfrage fächert sich auf alle auf. Aggregiert wird zur Abfragezeit, damit kein Hintergrund-Crawler eine zweite Kopie der Daten pflegen muss. Jeder Backend-Zugriff läuft token-authentifiziert.',
    role: 'Architektur, Adapter-Design, Betrieb',
    year: 'seit 2026',
    highlight: 'Elf heterogene Quellen hinter einer Such-API, Auth pro Backend',
    stack: ['FastAPI', 'Python', 'RAG', 'Bearer-Auth', 'Event-Bus'],
    domain: 'AI',
    status: 'live',
  },
  {
    id: 'offline-wissen',
    title: 'Offline-Wissen',
    tagline: 'Nachschlagen, Karte und Navigation funktionieren auch ohne Leitung nach draußen.',
    description:
      'Nachschlagewerk, Karte und Routenplanung liegen vollständig im Haus und funktionieren, wenn die Leitung nach draußen weg ist. Das Nachschlagewerk hält Wikipedia, Fachbücher und Kursmaterial in Archivform vor. Die Karte ist eine Vektorkarte aus offenen Daten, dazu kommen Luftbilder und eine Satellitenansicht als eigene Ebenen. Adressen mit Hausnummern stecken in einem selbstgebauten Index, den ich gegen die verbreitete Standardlösung getauscht habe, weil die auf dieser Hardware nicht läuft. Ein eigener Gast auf dem Virtualisierungs-Cluster rechnet die Routen. Nebenbei sieht kein Anbieter mehr, wonach hier gesucht wird.',
    role: 'Konzeption, Datenaufbereitung, Betrieb',
    year: 'seit 2026',
    highlight: 'Gut 20 Millionen Adressen in einem eigenen Index, gebaut mit unter 500 MB Arbeitsspeicher',
    stack: ['Python', 'SQLite', 'nginx', 'MapLibre', 'Valhalla', 'LXC'],
    domain: 'Infra',
    status: 'live',
    repo: 'https://github.com/sami-djouhri/karten',
  },
  {
    id: 'postfach',
    title: 'Postfach',
    tagline: 'Papierpost wird zum Handy-Foto, das Foto zum durchsuchbaren Datensatz.',
    description: 'Ein Brief wird zum schnellen Handy-Foto und kommt als durchsuchbarer Datensatz zurück. Vor dem Auslesen geht das Foto durch eine eigene Bildaufbereitung, die das Dokument im Bild findet und begradigt; auf einem schief fotografierten Brief liefert OCR sonst deutlich schlechtere Ergebnisse. Dann liest OCR den Text und ein Sprachmodell zieht Titel und Absender heraus. Jeder fertige Scan löst ein Ereignis auf meinem Event-Bus aus, sodass andere Dienste mitbekommen, dass Post da ist. Über eine abgesicherte interne Schnittstelle findet die hausweite Suche den Bestand. Ein Cloud-DMS braucht es dafür nicht.',
    role: 'Konzeption, Service, Integration',
    year: 'seit 2026',
    highlight: 'Klassische Bildaufbereitung und LLM-Extraktion in einer produktiven Pipeline, vollständig auf eigener Hardware',
    stack: ['FastAPI', 'Tesseract OCR', 'Claude API', 'SQLite', 'Event-Bus'],
    domain: 'AI',
    status: 'live',
  },
  {
    id: 'news-engine',
    title: 'News-Engine',
    tagline: 'Clustert Artikel aus vielen Feeds zu Storys, fast vollständig lokal.',
    description: 'Eine Nachrichten-Engine, die zusammengehörende Berichte erkennt. Beiträge aus vielen Feeds werden über eigene Embeddings geclustert, sodass Meldungen zur selben Sache auch über Sprachgrenzen hinweg zusammenfinden, und dann nach Quellenzahl, Trend und Quellenqualität sortiert. Embedding, Clustering und Bewertung laufen lokal. Ein Cloud-Modell kommt nur bei einzelnen Schritten zum Einsatz, bei denen das lokale Modell nicht ausreicht. Dadurch steigen die API-Kosten nicht einfach mit jedem zusätzlich verarbeiteten Artikel.',
    role: 'Architektur, NLP-Pipeline, Cost-Layer',
    year: 'seit 2026',
    highlight: 'Im Standardbetrieb keine externen Kosten, Cloud nur hinter einem Monatsdeckel',
    stack: ['FastAPI', 'PostgreSQL', 'Vektor-Embeddings', 'Claude API', 'Hybrid-LLM-Routing'],
    domain: 'AI',
    status: 'live',
  },
  {
    id: 'concierge',
    title: 'Privater Concierge',
    tagline: 'Ein eigener Sprach- und Text-Assistent, der jede Anfrage zum passenden Modell routet, lokal, wo es reicht.',
    description: 'Ein lokal betriebener Sprach- und Text-Assistent, der jede Anfrage zur passenden Modell-Stufe schickt: ein kleines lokales Modell erledigt Alltag und Tagesbriefing, harte Aufgaben gehen gezielt an ein starkes Modell. Aktionen laufen über einen einzigen Tool-Bus mit Schema-Prüfung, Risk-Tier und Audit-Log. Einen Host-Reboot führt er nie ohne meine ausdrückliche Freigabe aus. Der Briefing-Pool bewertet Kandidaten nach Frische, Quelle und meinem Feedback und wirft die schwächsten wieder raus. Spracherkennung, Synthese und die Modelle laufen auf eigener Hardware.',
    role: 'Architektur, Routing, Tool-Bus',
    year: 'seit 2026',
    highlight: 'Multi-Tier-Routing zwischen lokalem und externem Modell, riskante Aktionen nur mit Freigabe',
    stack: ['Python', 'FastAPI', 'llama.cpp', 'Claude API', 'Home Assistant'],
    domain: 'AI',
    status: 'live',
    repos: [
      {
        url: 'https://github.com/sami-djouhri/memory-gateway',
        label: 'Memory-Gateway',
        note: 'Ein OpenAI-kompatibler Chat-Proxy, der einem lokalen LLM Langzeitgedächtnis gibt, indem er die relevantesten Notizen als Kontext abruft und einspeist.',
        noteEn: 'An OpenAI-compatible chat proxy that gives a local LLM long-term memory by retrieving and injecting the most relevant notes as context.',
      },
      {
        url: 'https://github.com/sami-djouhri/tts-gateway',
        label: 'TTS-Gateway (Sprach-Ausgabe)',
        note: 'Ein Job-Bus mit Prioritäten vor einer einfädigen Sprach-Synthese: plant je Textabschnitt, begrenzt die Warteschlange, kennt Fristen und sagt ehrlich ab, statt sich aufzustauen.',
        noteEn: 'Priority job bus in front of a single-threaded TTS backend: chunk-level scheduling, bounded queue, deadlines and honest backpressure.',
      },
    ],
  },
  {
    id: 'defense-in-depth',
    title: 'Defense in Depth',
    tagline: 'Sicherheit steckt in jeder Schicht, von der Container-Härtung bis zum geprüften Restore.',
    description: 'Jeder Dienst läuft ohne Root, mit read-only Dateisystem und gedroppten Capabilities. Docker-Zugriff gibt es nur über eingeschränkte Proxies; die Ausnahmen davon stehen in einem eigenen Inventar, damit keine still dazukommt. Das Netz ist in Zonen geschnitten, mit einer Regel pro Container, und ein Wächter meldet jeden Verbindungsaufbau, der nicht vorgesehen ist. Die Anmeldung läuft zentral über SSO; hinter dem Edge wird die echte Client-IP mitgeloggt, nicht die des Proxys. Darunter liegt verschlüsseltes Off-Site-Backup. Den Restore-Drill fahre ich regelmäßig gegen echte Stichproben, weil ein Backup ohne geprüfte Rückspielung nichts wert ist.',
    role: 'Sicherheits-Architektur, Härtung, Betrieb',
    year: 'seit 2025',
    highlight: 'Verteidigung über Container, Netz, Edge, Identität und Wiederanlauf',
    stack: ['Authelia', 'OIDC', 'Crowdsec', 'mTLS', 'restic'],
    domain: 'Infra',
    status: 'live',
    repos: [
      {
        url: 'https://github.com/sami-djouhri/service-template',
        label: 'Service-Template (Härtungs-Baseline)',
        note: 'Meinungsstarkes Python-Microservice-Template mit eingebauter Health-, Observability- und Sicherheits-Baseline, das Dutzende meiner Eigen-Dienste erben.',
        noteEn: 'An opinionated Python microservice template with a built-in health, observability and security baseline that dozens of my services inherit.',
      },
      {
        url: 'https://github.com/sami-djouhri/trivy-scanner',
        label: 'Trivy-Scanner (CVE-Scan)',
        note: 'Ein RAM-begrenzter Trivy-CVE-Scanner für die selbstgehostete Docker-Flotte, als systemd-Timer, exportiert als Prometheus-Textfile-Metrik.',
        noteEn: 'A lightweight, RAM-bounded Trivy CVE scanner for a self-hosted Docker fleet, run as a systemd timer and exported as a Prometheus textfile metric.',
      },
    ],
  },
  {
    id: 'ops-cockpit',
    title: 'Ops-Cockpit',
    tagline: 'Eine Oberfläche für alle Hosts, ohne Shell und ohne Container-Exec.',
    description: 'Früher habe ich mich auf jeden Host einzeln eingeloggt. Inzwischen läuft das über eine eigene Oberfläche: Last, Temperatur, Speicher und Plattenbelegung aller Hosts, Dienste starten und stoppen, Container-Logs auf Abruf, dazu eine Topologie-Ansicht der Abhängigkeiten und das Alter des letzten Backups je Host. Der Zugriff geht nie direkt auf den Docker-Socket, sondern über einen eingeschränkten Proxy ohne Container-Exec, per Firewall auf genau eine Steuerebene begrenzt und so verankert, dass die Sperre einen Reboot übersteht. Jeder Konsument hat seinen eigenen Schlüssel, nicht einen für alles. Dienste, die ich absichtlich stillgelegt habe, sind als solche hinterlegt und tauchen nicht als Fehlalarm auf. Eine Host-Shell oder ein Remote-Terminal gibt es nicht: das wäre der eine Weg, über den ein übernommenes Frontend alles andere aushebeln könnte.',
    role: 'Architektur, Härtung, Frontend',
    year: 'seit 2026',
    highlight: 'Multi-Host-Steuerung ohne Container-Exec, Lockdown übersteht Reboot',
    stack: ['Next.js', 'Docker', 'Socket-Proxy', 'Prometheus', 'Firewall-Lockdown'],
    domain: 'Infra',
    status: 'live',
  },
  {
    id: 'windows-ad-lab',
    title: 'Windows- & AD-Lab',
    tagline: 'Ein Lernlabor für Windows Server und Active Directory auf eigener Virtualisierung, gerade im Aufbau.',
    description:
      'Windows Server und Active Directory kann man erst, wenn man sie betrieben hat. Also läuft auf meinem Cluster ein abgeschottetes Lab: Domänencontroller und Windows-Client als virtuelle Maschinen, on-demand gestartet, mit UEFI und Secure Boot. Der Domänencontroller steht, die Domäne läuft mit integriertem DNS, erste Organisationseinheiten, Benutzer und Gruppen sind angelegt. Als Nächstes kommen die Gruppenrichtlinien in der Tiefe und der Domänen-Beitritt des Clients. Der Rest meiner Infrastruktur ist durchgehend Linux, deshalb dieses Lab.',
    role: 'Aufbau, Virtualisierung, Lernpfad',
    year: 'seit 2026',
    highlight: 'Domänencontroller und Client als VMs auf dem eigenen Cluster, on-demand, sauber dokumentiert.',
    stack: ['Proxmox VE', 'Windows Server', 'Active Directory', 'GPO', 'UEFI'],
    domain: 'Infra',
    status: 'im-aufbau',
    taglineEn: 'A lab for Windows Server and Active Directory on my own virtualization, currently taking shape.',
    descriptionEn:
      'You do not really know Windows Server and Active Directory until you have run them. So an isolated lab is coming up on my own cluster: a domain controller and a Windows client as virtual machines, started on demand, with UEFI and Secure Boot. The goal is fluent handling of domains, group policy, DNS and user management, plus a clean documented build. The state is honest: the domain controller is up, the domain stands with its own integrated DNS, and the first organizational units, users and groups exist; next come group policy in depth and joining the client to the domain. A deliberate step toward classic administration work, next to the otherwise Linux-heavy stack.',
    highlightEn: 'Domain controller and client as VMs on my own cluster, on demand, cleanly documented.',
    roleEn: 'Build, virtualization, learning path',
  },
  {
    id: 'modell-vermittlung',
    title: 'Modell-Vermittlung',
    tagline: 'Ein Endpunkt für alle KI-Aufrufe im Haus, mit Monatslimit pro Dienst.',
    description: 'Früher rief jeder Dienst sein Sprachmodell selbst auf. Inzwischen greifen alle Dienste über denselben Endpunkt auf die Modelle zu. Trotzdem bekommt jeder Dienst einen eigenen Schlüssel, erlaubte Modelle und ein Monatslimit. Limits und Modellauswahl muss ich dadurch nicht in jeder Anwendung separat implementieren. Der Endpunkt spricht beide gängigen Schnittstellen-Formate, sodass bestehende Dienste ohne Umbau darüber laufen. Fällt ein Modell aus oder ist es überlastet, schaltet die Vermittlung auf ein Ausweich-Modell um, lokal wie in der Cloud.',
    role: 'Architektur, Implementation, Betrieb',
    year: 'seit 2026',
    highlight: 'Ein Schlüssel und ein Monatslimit pro Dienst, Cloud und lokal am selben Endpunkt',
    stack: ['LiteLLM', 'FastAPI', 'PostgreSQL', 'Docker'],
    domain: 'Infra',
    status: 'live',
  },
  {
    id: 'gartiko',
    title: 'Gartiko',
    tagline: 'Eine öffentliche Pflanzen-Pflege-App mit Community-Anschluss, live unter eigener Domain.',
    description: 'Ein öffentliches Pflege-Portal für Pflanzen: Bestände anlegen, Pflegephasen verfolgen, Erinnerungen und Wissen an einer Stelle, live unter eigener Domain auf eigener Infrastruktur. Das Portal teilt sich den Unterbau mit einem Community-Bot. Ein Wissensartikel wird deshalb einmal gepflegt und erscheint sowohl im Portal als auch im Bot. Der Admin-Bereich ist am öffentlichen Rand abgeschnitten und nur aus meinem eigenen Netz erreichbar.',
    role: 'Architektur, Backend, Frontend, Betrieb',
    year: 'seit 2026',
    highlight: 'Öffentlich erreichbar unter eigener Domain, Admin-Pfad am Rand abgeschnitten',
    stack: ['PHP', 'SQLite', 'Apache', 'Docker', 'cloudflared'],
    domain: 'Suite',
    status: 'live',
    href: 'https://gartiko.de',
    repos: [
      {
        url: 'https://github.com/sami-djouhri/ha-climate-push',
        label: 'Climate Push (Home-Assistant-Integration)',
        note: 'Signierter Home-Assistant-Webhook (HMAC), der nur gewählte Klimawerte sendet. Kein Zugriffstoken verlässt das Haus.',
        noteEn: 'Signed Home Assistant webhook (HMAC) that only sends selected climate readings, no access token ever leaves the home.',
      },
    ],
  },
  {
    id: 'rackforge',
    title: 'RackForge',
    tagline: 'Ein eigener Shop für 3D-gedruckte Teile, von Grund auf selbst gebaut.',
    description:
      'Ein 3D-Druck-Shop, komplett ohne Shop-Framework selbst gebaut. Der Warenkorb behandelt dieselbe Form in zwei Farben als zwei Positionen, sonst stimmt die Kommissionierung nicht. Die Bestands-Engine führt Filament-Rollen und fertig gedruckte Teile getrennt: was nicht auf Lager liegt, läuft als „auf Bestellung“, ein erledigter Druck wird gegen den Bestand verbucht. Kunden laden eigene Druckdateien hoch, durch einen selbst geschriebenen Upload-Pfad mit Format- und Größen-Grenzen. Datenmodell, Kasse und Regeln sind alle selbst geschrieben.',
    role: 'Architektur, Backend, Frontend, Shop-Logik',
    year: 'seit 2026',
    highlight: 'Vollständiger Webshop ohne Framework: eigene Kasse, Bestands-Engine und geprüfter Datei-Upload.',
    stack: ['Python', 'FastAPI', 'Vanilla JS', 'SQLite', 'Docker'],
    domain: 'Web',
    status: 'im-aufbau',
  },
  {
    id: 'cms-baukasten',
    title: 'CMS-Baukasten',
    tagline: 'Ein eigenes, schlankes CMS als Grundlage für kleine Websites.',
    description:
      'Ein schwergewichtiges Fremd-CMS lohnt sich für eine kleine Seite selten, also habe ich eine eigene Vorlage gebaut. Eine Seite läuft bereits damit, weitere erben dieselbe Grundlage. Inhalte pflege ich über eine Oberfläche, die nur aus meinem eigenen Netz erreichbar ist; am öffentlichen Rand wird der Admin-Pfad abgewiesen, bevor die Anwendung ihn überhaupt sieht. Der öffentliche Teil wird statisch aus einem eigenen Datenspeicher ausgeliefert.',
    role: 'Architektur, Backend, Frontend, Template-Pflege',
    year: 'seit 2026',
    highlight: 'Eigenes CMS als Vorlage: Admin nur im eigenen Netz, öffentlicher Teil statisch.',
    stack: ['PHP', 'MySQL', 'Docker', 'cloudflared', 'Apache'],
    domain: 'Web',
    status: 'live',
    href: 'https://meisterminze.de',
  },
  {
    id: 'edge-hosting',
    title: 'Public-Edge-Hosting',
    tagline: 'Ein öffentlicher Server am Netz-Rand, getrennt vom Heim-Verbund.',
    description:
      'Für öffentlich erreichbare Seiten und Mail steht ein eigener Server am Netz-Rand. Er liegt in einer getrennten Zone, damit ein exponierter Dienst im Fall der Fälle nicht im selben Segment sitzt wie meine private Infrastruktur. Ein TLS-Reverse-Proxy terminiert die Domänen und reicht nur lokal an read-only betriebene Container weiter. Ein eigener Mailserver übernimmt Versand und Empfang für meine Domänen. Mehrere Sites teilen sich denselben Unterbau.',
    role: 'Architektur, Provisionierung, Härtung, Betrieb',
    year: 'seit 2026',
    highlight: 'Exponierte Dienste in einer getrennten Edge-Zone, mit eigenem Mailserver.',
    stack: ['Caddy', 'Docker', 'Mailserver', 'Debian', 'Off-Site'],
    domain: 'Infra',
    status: 'live',
    // Öffentlicher Beweis der Edge-Zone: die extern gehostete Status-Seite.
    href: 'https://status.djouhri.de',
    repos: [
      {
        url: 'https://github.com/sami-djouhri/netcup-sentinel',
        label: 'Netcup-Sentinel (externer Wächter)',
        note: 'Externer Wächter auf einem Off-Site-Server: Uptime-Monitoring, Status-Seite, Angriffsflächen-Scan, Backup-Verifikation und ein Dead-Man-Switch fürs Heimnetz.',
        noteEn: 'External watchdog on an off-site VPS: uptime monitoring, status page, attack-surface scan, backup verification and a dead-man switch for the home lab.',
      },
    ],
  },
  {
    id: 'media-vault',
    title: 'Media-Vault',
    tagline: 'Eine verschlüsselte Medien-Bibliothek, die sich nur auf Knopfdruck öffnet und danach wieder verschließt.',
    description:
      'Meine Medien liegen verschlüsselt auf der Platte. Eine schlanke Oberfläche entsperrt die Bibliothek auf Knopfdruck, hängt sie ein und fährt den Medien-Server gleich mit hoch; beim Sperren geht beides wieder zu. Zwischen zwei Sitzungen liegt also nichts entschlüsselt herum, und der Medien-Server läuft nicht 24/7 mit. Die Entsperr-Phrase wird nur im Arbeitsspeicher verarbeitet und nie auf die Platte geschrieben, der Zugang bleibt auf mein eigenes Netz begrenzt.',
    role: 'Konzept, Implementation, Sicherheitsmodell',
    year: 'seit 2026',
    highlight: 'Verschlüsselte Bibliothek, on-demand entsperrt, der Medien-Server folgt dem Mount, nichts liegt offen herum',
    stack: ['Python', 'gocryptfs', 'Docker Compose', 'Linux'],
    domain: 'Infra',
    status: 'im-aufbau',
    repo: 'https://github.com/sami-djouhri/media-vault-ui',
  },
  {
    id: 'ressourcen-arbiter',
    title: 'Ressourcen-Arbiter',
    tagline: 'Erst ein knapper Knoten, der selbst entscheidet, wer laufen darf. Inzwischen ein Muster über den ganzen Verbund.',
    description:
      'Ein Knoten des Virtualisierungs-Clusters trägt sieben schwere Rollen, die fast nie gleichzeitig gebraucht werden. Arbeitsspeicher hat er für genau eine. Überbuchen wäre der bequeme Weg, überlässt aber im Ernstfall dem Kernel die Entscheidung, welcher Prozess stirbt. Also plant ein eigener Regler den Knoten. Die Rollen stehen als Einträge in einer Registrierdatei, er fragt jede laufende Rolle nach ihrer tatsächlichen Auslastung, verdrängt bei einer neuen Anforderung die alte mit gesichertem Zustand und schaltet ab, was zwanzig Minuten leer läuft. Nach außen sind die Dienste nur über einen Tunnel zu einem eigenen Server am Netz-Rand erreichbar. Am Heimanschluss ist kein einziger Port geöffnet, und die Anschluss-Adresse taucht nirgends auf. Dasselbe Prinzip trägt inzwischen auch die gewöhnlichen Web-Dienste: sieben selten benutzte Anwendungen auf zwei weiteren Rechnern starten beim ersten Aufruf und schlafen nach einer halben Stunde ohne Zugriff wieder ein.',
    role: 'Konzept, Implementation, Netz-Design, Betrieb',
    year: 'seit 2026',
    highlight: 'Sieben schwere Rollen auf einem Knoten, immer nur eine gleichzeitig, gesteuert nach gemessener Auslastung.',
    stack: ['Python', 'Proxmox · LXC', 'systemd', 'nginx', 'WireGuard', 'nftables'],
    domain: 'Infra',
    status: 'live',
    repos: [
      {
        url: 'https://github.com/sami-djouhri/role-arbiter',
        label: 'Rollen-Arbiter (schwere Rollen)',
        note: 'Prioritätsgesteuerter Regler für einen speicherknappen Virtualisierungs-Knoten: hält schwere Rollen auf genau eine zugleich, entscheidet nach gemessener Auslastung, verdrängt mit gesichertem Zustand und schaltet bei Leerlauf ab.',
        noteEn: 'Priority-based resource controller for a memory-constrained hypervisor node: keeps heavy on-demand roles to one at a time, driven by real occupancy probes, with graceful save-and-stop and idle auto-off.',
      },
      {
        url: 'https://github.com/sami-djouhri/wake-gateway',
        label: 'Wake-Gateway (Web-Dienste)',
        note: 'Selten genutzte Web-Dienste, die beim ersten Aufruf starten und bei Leerlauf wieder einschlafen. Ein nginx hält stellvertretend ihre Ports, eine kleine API startet und stoppt die Container.',
        noteEn: 'Rarely used web services that start on the first request and sleep again when idle. nginx holds their published ports; a small API starts and stops the containers.',
      },
    ],
  },
];

/**
 * Englische Projekttexte, zentral gepflegt und beim Modul-Load in PROJECTS gemergt
 * (→ der CMS-Seed trägt die *En-Felder, Admin bleibt editierbar). Fehlt ein Eintrag,
 * fällt localizedProject() feldweise auf Deutsch zurück.
 */
const PROJECTS_TEXT_EN: Record<
  string,
  { tagline: string; description: string; highlight: string; role: string }
> = {
  saganta: {
    tagline: 'My own productivity suite that feels like a product and yet is entirely mine.',
    description:
      "My own productivity suite with mail, calendar, valuables, a project deck and everyday apps from pantry to meal planning. It all runs under one brand and one login, reachable at its own domain. None of the sub-apps talks to a backend directly. In between sits a mediation layer that enforces the access gate at the edge, and a lean self-built auth service issues the same session for web and native Android. The interesting part is where the domains meet. Valuables know their market value because my own market engine feeds them, and paper mail lands searchable under the same roof. It started as a family suite and it's grown together further with every domain.",
    highlight: 'One login for web and native Android, full data sovereignty over mail, calendar and knowledge.',
    role: 'Architecture, implementation, ongoing build-out',
  },
  homelab: {
    tagline: 'Self-run infrastructure that grows more mature every month.',
    description:
      'Over 160 services run at my home around the clock, from mail through search and automation to AI inference, spread across several hosts. Every change originates from a single source of truth. An event spine connects the services to each other, and a route probe tells me about public domains that are failing before I notice myself. The networks are segmented, the containers hardened, the state documented. New hosts and domains arrive in a controlled way.',
    highlight: 'Over 160 services in continuous operation, zero drift against the source of truth',
    role: 'Build, design, operations, on-call',
  },
  lernen: {
    tagline: 'Standalone learning apps on a shared core, built for the next discipline.',
    description:
      "Several standalone learning apps on a shared core, each for a different exam, but with the same learning logic, design system and Android modules underneath. What's shared is built once and synced into the apps. What belongs apart stays apart: database, auth and theme are fully isolated per app, so each domain keeps its own pace and face. The old tile menu has become a continuous product. A session leads straight from reading into practice and suggests the next sensible step itself. A new learning domain arrives as another app on the same foundation, without me touching the core.",
    highlight: 'One shared core, six standalone apps, web and native Android',
    role: 'Design, backend, frontend, Android',
  },
  'home-digital-twin': {
    tagline: 'My own home as a walkable interface, in 2D and 3D.',
    description:
      'My home as a walkable interface. A 2D floor plan for quick switching, a 3D scene for moving between rooms and floors, both on the same data layer and with the same live status. Status changes arrive without polling. Flip a light and it jumps instantly in the floor plan too. Devices move to their place by drag-and-drop, climate curves compare across rooms, and new rooms attach without rebuilding what is already there.',
    highlight: '2D and 3D on one data layer, status in real time',
    role: 'Architecture, backend, frontend, room model',
  },
  'homelab-app': {
    tagline: 'My homelab as a native ops cockpit, right in my pocket.',
    description:
      'A native Android companion that makes my homelab operable from the phone: host metrics at a glance, services to start, stop and restart with their logs, and an inbox to triage open items. The app only ever talks to a private gateway over my own VPN; pairing happens by scanning a QR code that generates a device-bound key in the Android KeyStore and exchanges it for a client certificate and mTLS, so the key never leaves the device. A public demo mode shows the app entirely without a gateway.',
    highlight: 'Container control and host metrics from the phone, device-bound mTLS pairing, access only over my own VPN',
    role: 'Design, mobile engineering, security model',
  },
  'homelab-sentinel': {
    tagline: 'A personal on-call for my homelab, a watcher set that grows with it.',
    description:
      'A Discord bot is my on-call duty for the homelab: it reports container health, backup status, available updates, alerts from the in-house event bus, security-audit nudges and the state of the VPN connections, right where I already am. Every new worry gets its own encapsulated building block without touching the core. So the watcher set grows exactly with what the infrastructure learns about itself.',
    highlight: 'Modular watcher architecture, extensible block by block',
    role: 'Design, cog architecture, event wiring',
  },
  marktwatch: {
    tagline: 'Works bargains out from price distributions and flags only what holds up in the bad case too.',
    description:
      'Marktwatch scours classifieds and eBay for underpriced homelab hardware and pings me real bargains on Discord, without raising false alarms on bulk-discount tricks, variant mix-ups or bundles. The false-positive defense runs in layers: first a free rule filter, then a small language model only for borderline cases, both behind a shared gate that the real-time alert and the daily digest must equally pass. It reckons with price distributions. A recommendation only lands when even the worst-case scenario still leaves a profit (a 5% quantile and the expected shortfall below it), complete with the highest sensible bid. Everything irreversible stays behind a two-flag gate, with observation as the default.',
    highlight: 'Flags only when even the bad case still leaves a profit',
    role: 'Architecture, crawler, deal math, false-positive defense',
  },
  'ai-vision': {
    tagline: 'Image recognition on my own edge hardware, inside the home network.',
    description:
      "Image recognition runs on a GPU in my home network, without a single image ever reaching a cloud service. The first-generation edge hardware is stubborn: tight memory, an old toolchain, almost nothing installs off the shelf. So I solved every platform stumbling block once and wrote it down until a dependable path stood. An API encapsulates the hardware binding in a single place. Other self-run services consume the inference without ever knowing the GPU behind it, and further models sit on the same foundation without a rebuild. After a re-cabling the hardware sat off the network for a while, and having the consuming service report an outage rather than invent results paid off in exactly that case. The pipeline has been running again since it came back.",
    highlight: 'Local GPU inference in the home network, independent of the cloud',
    role: 'Platform bring-up, integration, hardening',
  },
  shops: {
    tagline: 'Multiple WooCommerce shops on my own infrastructure, all from one hardening source.',
    description:
      'Multiple WooCommerce shops I build and uniformly harden on my own infrastructure. Stock WooCommerce is not hardened, and per-instance maintenance gets more expensive the more of them pile up. So a canonical hardening source pulls every instance to the same state: hardened templates, isolated instances, one uniform deploy path, one documented restore. A new instance inherits the finished hardening bundle. Fixes take effect everywhere alike, because all instances read what one source writes.',
    highlight: 'A new instance inherits the hardening ready-made: scaling without drift risk',
    role: 'Hosting, hardening, maintenance',
  },
  'wissens-foederation': {
    tagline: 'One search API over eleven of my own data sources. The frontend knows none of them.',
    description:
      'A single search query searches eleven completely different self-run systems at once (from documents, notes and inventory through market data and letters to knowledge archives, books and exam material), and the frontend knows none of them. Each source sits behind an adapter, the query fans out to all of them and comes back unified; aggregation happens deliberately at query time, so no crawler has to maintain a second source of truth. Every backend access is token-authenticated. So scattered island systems become one knowledge layer that other services address as a single backend, without knowing the sources behind it.',
    highlight: 'Eleven heterogeneous sources behind one search API, auth per backend',
    role: 'Architecture, adapter design, operations',
  },
  'offline-wissen': {
    tagline: 'Looking things up, the map and turn-by-turn routing all work with the uplink gone.',
    description:
      'A reference library, a map and route planning that live entirely at home and keep working when the uplink is gone. The library holds Wikipedia, technical books and course material in archive form. The map is a vector map built from open data, with aerial imagery and a satellite view as separate layers on top. Addresses down to house numbers sit in an index I built myself, after the common off-the-shelf option turned out not to fit the hardware. A dedicated guest on the virtualization cluster computes the routes. As a side effect, no provider gets to see what is being looked up here.',
    highlight: 'Just over 20 million addresses in a self-built index, assembled in under 500 MB of memory',
    role: 'Concept, data pipeline, operations',
  },
  postfach: {
    tagline: 'Paper mail becomes a phone photo, the photo a searchable record.',
    description:
      'A letter becomes a quick phone photo and comes back as a cleanly filed, searchable record. Before it is read, the photo goes through a custom image pipeline that finds the document in the frame and straightens it; then OCR reads the text and a language model pulls out title and sender. Every finished scan raises an event on my event bus so other services can follow along, and a secured internal search interface makes the archive discoverable for the knowledge layer. Processing and filing run entirely on my own hardware. Paperwork becomes data, without a cloud DMS.',
    highlight: 'Classic image processing and LLM extraction in a production pipeline, fully on my own hardware',
    role: 'Concept, service, integration',
  },
  'news-engine': {
    tagline: 'Many sources become one story: semantic clustering with hard cost discipline.',
    description:
      'A news engine that recognizes stories. Posts from many feeds are semantically clustered via my own embeddings, so reports on the same matter converge even across language borders, and are then condensed by source count, trend and source quality. The interesting part is the cost architecture. The bulk runs locally and deterministically, and a cloud model steps in only as editor-in-chief for the few hard steps, behind a router, a budget guard and a call log. In standard operation there is zero external cost.',
    highlight: 'Zero external cost in standard operation, cloud only behind hard caps',
    role: 'Architecture, NLP pipeline, cost layer',
  },
  concierge: {
    tagline: 'My own voice and text assistant that routes each request to the right model, local where that is enough.',
    description:
      'A locally run voice and text assistant that routes each request to the right model tier: a small local model handles everyday tasks and the daily briefing without cloud cost, hard tasks go deliberately to a strong model. Actions run over a single tool bus with schema checking, a risk tier and an audit log. A host reboot is never executed without my explicit approval. An incremental briefing pool scores and evicts candidates by freshness, source and feedback; a knowledge layer picks the right knowledge space per question. Voice, knowledge and control stay on my own network.',
    highlight: 'Multi-tier routing between local and external model, risky actions only with approval',
    role: 'Architecture, routing, tool bus',
  },
  'defense-in-depth': {
    tagline: 'Security sits in every layer, from container hardening to a tested restore.',
    description:
      'Security here spreads across every layer. Every service runs least-privileged with a read-only filesystem, dropped capabilities and no root; Docker access only through restricted proxies with a documented exception inventory. The network is cut into zones with one rule per container, an own watcher reports every unsanctioned connection attempt in real time, identity runs centrally via SSO with login protection and real client-IP logging behind the edge. Underneath lies encrypted off-site backup. The restore drill runs regularly, so I know the recovery path actually works.',
    highlight: 'Defense across container, network, edge, identity and recovery',
    role: 'Security architecture, hardening, operations',
  },
  'ops-cockpit': {
    tagline: 'My own control plane over the whole host fleet, deliberately locked down hard.',
    description:
      'I used to log into every host separately. These days it all runs through one interface: live metrics of all hosts (load, temperature, memory, disk), starting and stopping services from a distance, container logs on demand, a self-drawn topology view of the services and their dependencies, plus backup freshness across all hosts. Access never runs directly, but through a hardened intermediate layer without container exec, firewall-locked to exactly one control plane and anchored so the lock survives a reboot. Each consumer gets its own tightly scoped key rather than a master key. It spots divergence between expected and actual state itself, without treating deliberate shutdowns as false alarms. A deliberate decision: no host shell, no remote terminal.',
    highlight: 'Multi-host control without container exec, lockdown survives reboot',
    role: 'Architecture, hardening, frontend',
  },
  gartiko: {
    tagline: 'A public plant-care app with community connection, live on its own domain.',
    description:
      'A public care portal for plants of every kind: track inventories, follow care phases, reminders and knowledge in one place, live on its own domain on my own infrastructure. The portal shares its base with a community bot, so knowledge curation and web interface draw from the same source and nothing has to be maintained twice. The admin area is cut off hard at the public edge and reachable only from my own network, and the public part stays lean and fast.',
    highlight: 'Publicly reachable on its own domain, admin path cut off at the edge',
    role: 'Architecture, backend, frontend, operations',
  },
  rackforge: {
    tagline: 'My own shop for 3D-printed parts, built from scratch.',
    description:
      'A 3D-printing shop built entirely without a shop framework: my own catalog with generated detail pages, a color-aware cart that keeps the same shape in different colors cleanly apart, and an inventory engine that tracks filament spools and finished prints separately. Anything not in stock is listed as “made to order”, and a completed print is booked against stock. Users upload their own print files, checked by a self-written upload path with format and size limits. The data model, the checkout and the rules are all my own code.',
    highlight: 'A complete web shop without a framework: own checkout, inventory engine and vetted file upload.',
    role: 'Architecture, backend, frontend, shop logic',
  },
  'cms-baukasten': {
    tagline: 'My own lean CMS as a reusable base for small sites.',
    description:
      'My own deliberately lean CMS as a template for small sites. A heavyweight third-party CMS rarely pays off for a small site. One of my own sites already runs on it, and further sites inherit the same base. Content is maintained through an interface reachable only from my own network (at the public edge the admin path is rejected hard), while the public part is served fast and static from its own data store. A new site is essentially a configuration question.',
    highlight: 'My own CMS as a template: admin only on my own network, public part static.',
    role: 'Architecture, backend, frontend, template maintenance',
  },
  'edge-hosting': {
    tagline: 'A public server as a deliberately separate zone next to the home cluster.',
    description:
      'Not everything belongs in the home network: for publicly reachable sites and mail there is a dedicated server at the network edge, deliberately set up as a separate zone so an exposed service never sits in the same segment as the private infrastructure. A TLS reverse proxy terminates the domains and passes only locally to hardened, read-only containers. My own mail server handles sending and receiving for my own domains. Several sites share the same uniformly secured base.',
    highlight: 'Exposed services in a separate edge zone, with my own mail server.',
    role: 'Architecture, provisioning, hardening, operations',
  },
  'media-vault': {
    tagline: 'An encrypted media library that only opens on demand and locks itself again afterwards.',
    description:
      'My media sits encrypted on disk and only becomes visible when needed: a lean interface unlocks the library on demand, mounts it and brings the media server up with it; on lock, both close again. So nothing stays decrypted at rest, and the service only runs when I actually need it. The unlock passphrase is processed only transiently and never stored, and access stays confined to my own network.',
    highlight: 'Encrypted library, unlocked on demand, the media server follows the mount, nothing left exposed at rest',
    role: 'Concept, implementation, security model',
  },
  'ressourcen-arbiter': {
    tagline: 'First a tight node deciding for itself which role gets to run. By now a pattern across the whole fleet.',
    description:
      'One node of the virtualization cluster carries seven heavy roles that are almost never needed at the same time. It has memory for exactly one. Overcommitting would be the comfortable route, but it hands the kernel the decision about which process dies. So a controller of my own schedules the node. The roles live as entries in a registry file, it asks every running role for its actual occupancy, evicts the previous one with its state safely written out when a new request arrives, and switches off whatever has been idle for twenty minutes. From outside, the services are reachable only through a tunnel to my own edge server. Not a single port is open on the home connection, and the home address appears nowhere. The same principle now carries the ordinary web services too: seven rarely used applications on two further machines start on the first request and go back to sleep after half an hour without access.',
    highlight: 'Seven heavy roles on one node, only ever one at a time, driven by measured occupancy.',
    role: 'Concept, implementation, network design, operations',
  },
  'modell-vermittlung': {
    tagline: 'One gateway for every AI call in the house, with budget, switching and honest cost accounting.',
    description:
      'Each service used to call its own language model. These days everything runs through a central gateway: a single endpoint that speaks both common interface formats, so existing services route through it without a rewrite. Every consumer gets its own key with its own monthly budget as a runaway guard, plus a model allow-list. Under overload or outage the gateway switches to a fallback model, local or cloud. That gives one cost picture instead of scattered billing, a cap per service, and a documented path for when one side drops out. The gateway is deliberately kept thin.',
    highlight: 'A budget-capped gateway for every AI call, cloud and local, with a fallback path.',
    role: 'Architecture, implementation, operation',
  },
};

for (const p of PROJECTS) {
  const en = PROJECTS_TEXT_EN[p.id];
  if (en) {
    p.taglineEn = en.tagline;
    p.descriptionEn = en.description;
    p.highlightEn = en.highlight;
    p.roleEn = en.role;
  }
}

export const ABOUT = {
  name: 'Sami Djouhri',
  shortName: 'Sami',
  role: 'Infrastruktur · Systeme · Automation',
  location: 'Heiligenhaus, NRW',
  tagline: 'Ich baue Systeme, die zusammenhängen und mir gehören.',
  // Ein-Zeilen-Antwort auf den `whoami`-Prompt im Hero (Mono, knapp).
  bio: 'Mir ist wichtig, dass ich verstehe, was bei mir läuft. Ein Fremdprodukt kann morgen seinen Preis verdreifachen oder die API abschalten, und dann steht man da. Also baue ich die Dinge selbst, auch wenn sie dadurch kleiner ausfallen. Der Schwerpunkt liegt auf Linux, gehärteter Infrastruktur, Betrieb und Automation, dazu eigene Suiten und lokale AI, wo sie trägt. Ich dokumentiere meine Systeme so, dass ich sie auch nach Jahren noch verstehe und jemand anderes sie übernehmen könnte.',
  contact: {
    email: 'sami@djouhri.de',
  },
};

// Admin-first: das Trio trägt die Bewerbungs-Positionierung (Infrastruktur ·
// Systeme · Betrieb). Die Reihenfolge ist bewusst infra-first: homelab und der
// Ressourcen-Arbiter führen in der Lesereihenfolge, saganta steht hinten, bleibt
// aber im Trio, weil es das einzige Featured-Projekt mit Live-Screenshot ist (die
// Landing zieht Previews nur aus dieser Liste) und die Breite belegt.
export const FEATURED_PROJECT_IDS = ['homelab', 'ressourcen-arbiter', 'saganta'] as const;

export interface FocusItem {
  title: string;
  status: 'aktiv' | 'als-nächstes' | 'design';
  description: string;
  /** Optional: verlinkt den Fokus-Punkt auf ein Projekt (/projekte/{projectId}). */
  projectId?: string;
}

export const CURRENT_FOCUS: FocusItem[] = [
  {
    title: 'Dienste laufen lassen, wenn sie gebraucht werden',
    status: 'aktiv',
    description:
      'Ein Knoten trägt sieben schwere, selten gleichzeitig gebrauchte Rollen, hat aber nur Arbeitsspeicher für eine davon. Ein Regler entscheidet nach gemessener Auslastung, wer laufen darf, fährt den Vorgänger sauber mit Zustandssicherung herunter und schaltet ungenutzte Rollen nach zwanzig Minuten Leerlauf selbst wieder ab. Dasselbe gilt inzwischen für gewöhnliche Web-Dienste: sieben selten benutzte Anwendungen starten beim ersten Aufruf und schlafen danach wieder ein. Als Nächstes will ich wissen, welche Dienste diese Behandlung noch verdienen, ohne dass jemand es merkt.',
    projectId: 'ressourcen-arbiter',
  },
  {
    title: 'Offline nachschlagen und navigieren',
    status: 'aktiv',
    description:
      'Nachschlagewerk, Karte, Adress-Suche und Routenplanung liegen vollständig im Haus. Der Adress-Index war der interessante Teil: die verbreitete Standardlösung verlangt hundert Gigabyte Datenbank und mehr Arbeitsspeicher, als der Rechner hat, also habe ich einen eigenen Index gebaut, der auf genau eine Frage zugeschnitten ist. Offen ist, die Adress-Suche direkt an die Routenplanung zu hängen.',
    projectId: 'offline-wissen',
  },
  {
    title: 'Schwere Last auf den x86-Cluster verteilen',
    status: 'aktiv',
    description:
      'Der Verbund hat einen x86-Cluster dazubekommen, und die Verlagerung ist über den ersten Dienst hinaus: das zentrale KI-Gateway, ein großes Sprachmodell für die langsame Qualitäts-Spur und die Sprach-Synthese liegen inzwischen dort, jeweils in einem eigenen Gast. Die kleinen Rechner behalten, was latenzkritisch ist.',
  },
  {
    title: 'Windows- und Active-Directory-Lab',
    status: 'aktiv',
    description:
      'Auf dem Cluster läuft ein Windows-Server- und Active-Directory-Lab: der Domänencontroller steht mit eigener Domäne und integriertem DNS, erste Benutzer, Gruppen und Organisationseinheiten sind angelegt. Als Nächstes die Gruppenrichtlinien in der Tiefe und der Domänen-Beitritt eines Clients. Dazu arbeite ich die klassischen Administrations-Themen strukturiert durch, weil mein Homelab sonst reines Linux wäre.',
    projectId: 'windows-ad-lab',
  },
  {
    title: 'Den Wiederanlauf üben, nicht nur einrichten',
    status: 'aktiv',
    description:
      'Die Off-Site-Sicherung deckt inzwischen jeden Host ab, inklusive des Arbeitsrechners und des verschlüsselten Bündels mit den Zugangsdaten, und eine tägliche Vollständigkeits-Prüfung meldet jede Lücke von selbst. Der Restore-Drill läuft seither monatlich statt quartalsweise und holt echte Stichproben zurück, die letzte in wenigen Sekunden. Als Nächstes will ich kontrollierte Ausfälle auslösen und zusehen, ob das System sie abfängt oder nur meldet.',
  },
  {
    title: 'Automatiken sollen sagen, warum sie handeln',
    status: 'als-nächstes',
    description:
      'Jede automatische Aktion im Haus soll eine Spur hinterlassen: was sie ausgelöst hat, wie sicher sie sich war, warum sie so entschieden hat. Im Moment handeln die Automatiken stillschweigend, und genau das stört mich daran. Die Bausteine sind gebaut und getestet; der Anschluss an den laufenden Melde-Pfad steht noch aus, weil er einen Umbau nah an den sicherheitskritischen Diensten bedeutet.',
  },
];

export interface StackCategory {
  label: string;
  items: string[];
}

// Admin-first: Infra & Ops zuerst, passend zur Junior-IT-Admin-Positionierung
// und deckungsgleich mit den CV-Skills. Entwicklung folgt, bleibt aber ehrlich sichtbar.
export const STACK: StackCategory[] = [
  {
    label: 'Infra & Ops',
    items: ['Proxmox · LXC · KVM', 'Docker Compose', 'systemd · Units & Timer', 'nginx · Caddy · cloudflared', 'WireGuard', 'nftables · iptables', 'better-auth · Authelia', 'restic · Backup', 'Prometheus · Grafana', 'Mailserver', 'Windows Server · Active Directory'],
  },
  {
    label: 'Backend',
    items: ['Python · FastAPI', 'Node · TypeScript', 'PHP', 'PostgreSQL · SQLite', 'asyncio'],
  },
  {
    label: 'Frontend',
    items: ['SvelteKit', 'Next.js · App Router', 'Tailwind', 'React', 'Compose Multiplatform'],
  },
  {
    label: 'AI / Daten',
    items: ['Claude · API & Vision', 'llama.cpp · BGE-M3', 'YOLOv5 · Edge-Vision', 'RAG · Eval-Harness'],
  },
];

export interface Principle {
  title: string;
  body: string;
}

export const PRINCIPLES: Principle[] = [
  {
    title: 'Eigene Systeme',
    body: 'Wo es vertretbar ist, baue ich selbst. Eine kleinere App, die ich verstehe und betreiben kann, altert besser als ein großes Fremd-Produkt, das mit der Zeit wegdriftet.',
  },
  {
    title: 'Sicherheit als Standard',
    body: 'Read-only Container, gedroppte Capabilities, segmentierte Netze, kein direkter Docker-Socket. Härtung passiert in Wellen, dokumentiert pro Ausnahme.',
  },
  {
    title: 'Keine Platzhalter-Daten',
    body: 'Wenn eine Oberfläche nichts anzuzeigen hat, zeigt sie das auch so an. Ein Demo-Datensatz, der aussieht wie ein echter, kostet mich beim nächsten Fehler mehr Zeit, als er beim Bauen gespart hat.',
  },
  {
    title: 'Dokumentation als Qualitätssicherung',
    body: 'Service-Map, Runbooks, Entscheidungs-Logs. Was aufgeschrieben ist, kann ich ein halbes Jahr später nachprüfen, statt es mir aus dem Code wieder herzuleiten.',
  },
];

// ─── Englische Varianten der Code-Konstanten + Locale-Getter ────────────────────

const ABOUT_EN = {
  role: 'Infrastructure · Systems · Automation',
  tagline: 'I build systems that fit together and are mine.',
  bio: 'It matters to me that I understand what runs on my own machines. A third-party product can triple its price or switch off its API tomorrow, and then you are stuck. So I build things myself, even when that means they come out smaller. The focus is on Linux, hardened infrastructure, operations and automation, plus my own suites and local AI where it earns its place. Built to last years and to stay handoverable.',
};

/** ABOUT-Profil in der gewählten Sprache (neutrale Felder wie name/location bleiben gleich). */
export function getAbout(locale: Locale): typeof ABOUT {
  return locale === 'en' ? { ...ABOUT, ...ABOUT_EN } : ABOUT;
}

const CURRENT_FOCUS_EN: FocusItem[] = [
  {
    title: 'Running services when they are actually wanted',
    status: 'aktiv',
    description:
      'One node carries seven heavy roles that are rarely needed at the same time, but it only has memory for one of them. A controller decides by measured occupancy who gets to run, shuts the previous role down cleanly with its state saved, and switches idle roles back off by itself after twenty minutes. The same now applies to ordinary web services: seven rarely used applications start on the first request and go back to sleep afterwards. Next I want to know which further services deserve the same treatment without anyone noticing.',
    projectId: 'ressourcen-arbiter',
  },
  {
    title: 'Looking things up and navigating offline',
    status: 'aktiv',
    description:
      'Reference library, map, address lookup and route planning all live at home. The address index was the interesting part: the common off-the-shelf option wants a hundred gigabytes of database and more memory than the machine has, so I built an index of my own, cut to exactly one question. Still open is wiring address lookup straight into route planning.',
    projectId: 'offline-wissen',
  },
  {
    title: 'Spreading heavy load onto the x86 cluster',
    status: 'aktiv',
    description:
      'The homelab gained an x86 cluster, and the move is well past its first service: the central AI gateway, a large language model for the slow quality lane and speech synthesis all live there now, each in its own guest. The small machines keep what is latency-critical.',
  },
  {
    title: 'Windows and Active Directory lab',
    status: 'aktiv',
    description:
      'A hands-on Windows Server and Active Directory lab runs on the cluster: the domain controller is up with its own domain and integrated DNS, and the first users, groups and organizational units exist. Next come group policy in depth and joining a client to the domain, deliberately alongside the Linux focus. Plus structured learning along the classic administration topics, to broaden my practice beyond the Linux homelab.',
    projectId: 'windows-ad-lab',
  },
  {
    title: 'Making recovery antifragile',
    status: 'aktiv',
    description:
      'Off-site backup now covers every host, including my workstation and the encrypted bundle holding the credentials, and a daily completeness check reports any gap on its own. The restore drill has moved from quarterly to monthly and pulls real samples back, the last one within seconds. Next come controlled failure exercises, so the system absorbs disruptions on its own and does not merely report them.',
  },
  {
    title: 'Glass-box autonomy',
    status: 'als-nächstes',
    description:
      'Every automated action in the house should carry a traceable reasoning trail, with confidence, rationale and trigger recorded. Right now the automations act silently, and that is the part that bothers me. The building blocks are written and tested; wiring them into the live notification path is still pending, because it means rebuilding close to the safety-critical services.',
  },
];

export function getFocus(locale: Locale): FocusItem[] {
  return locale === 'en' ? CURRENT_FOCUS_EN : CURRENT_FOCUS;
}

const STACK_LABEL_EN: Record<string, string> = { 'AI / Daten': 'AI / Data' };

/** Stack-Kategorien; nur die Rubrik-Labels werden übersetzt, die Tech-Namen bleiben. */
export function getStack(locale: Locale): StackCategory[] {
  if (locale !== 'en') return STACK;
  return STACK.map((c) => ({ ...c, label: STACK_LABEL_EN[c.label] ?? c.label }));
}

const PRINCIPLES_EN: Principle[] = [
  {
    title: 'Systems of my own',
    body: 'Where it is reasonable, I build it myself. A smaller app I understand and can run ages better than a huge third-party product that drifts over time.',
  },
  {
    title: 'Security as default',
    body: 'Read-only containers, dropped capabilities, segmented networks, no direct Docker socket. Hardening happens in waves, documented per exception.',
  },
  {
    title: 'Honest empty states',
    body: 'A clear empty state beats a pretty mock that lies eventually. Nothing gets invented in production UI.',
  },
  {
    title: 'Documentation as quality assurance',
    body: 'Service map, runbooks, decision logs, target picture. What is written down I can verify, and somebody else can take it over.',
  },
];

export function getPrinciples(locale: Locale): Principle[] {
  return locale === 'en' ? PRINCIPLES_EN : PRINCIPLES;
}
