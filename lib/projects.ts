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
  lessons?: string[];
  /**
   * Optionale Modul-Liste für Suiten, die mehrere Apps unter einem Dach bündeln
   * (z. B. Saganta). Rein generische App-Namen, keine Hostnames/interne IDs.
   * Wird als dezente Chip-Leiste oben auf der Detailseite gezeigt, damit das
   * „ein Dach, viele Apps"-Bild scanbar wird statt nur in der Prosa zu stecken.
   */
  modules?: string[];
}

/**
 * Ein benanntes Quelltext-Repo. Ein Projekt (Gartiko, Saganta …) besteht oft aus
 * mehreren öffentlichen Teilen — statt je Teil ein eigenes Portfolio-Projekt anzulegen,
 * bündelt `Project.repos` sie unter EINEM Projekt. `note`/`noteEn` (optional) sagt in
 * einem Halbsatz, was der Teil ist. Nur neutrale, öffentliche Repos — keine internen.
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
  repo?: string; // öffentliches Quelltext-Repo (GitHub), falls das Projekt Open Source ist — Kurzform für 1 Repo
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
    tagline: 'Eine eigene Produktivitäts-Suite, die wie ein Produkt wirkt und doch ganz mir gehört.',
    description:
      'Meine eigene Produktivitäts-Suite: Mail, Kalender, Wertsachen, ein Projekt-Deck und Alltags-Apps von Vorrat bis Essensplanung: alles unter einer Marke, einer Anmeldung, einem Look, erreichbar unter eigener Domain. Jede Sub-App spricht nur mit einer vorgelagerten Vermittlungsschicht, die am Rand das Zugangs-Gate durchsetzt, nie direkt mit den Backends; ein eigener schlanker Auth-Dienst stellt dieselbe Session für Web und native Android-App aus. Der Reiz liegt darin, wie die Domänen ineinandergreifen: Wertsachen kennen ihren Marktwert, weil meine eigene Markt-Engine sie speist, und Papierpost landet durchsuchbar im selben Dach. Was als Familien-Suite begann, wächst mit jeder Domäne ein Stück vollständiger zusammen.',
    role: 'Architektur, Implementation, laufender Ausbau',
    year: 'seit 2026',
    highlight: 'Eine Anmeldung für Web und native Android, volle Datenhoheit über Mail, Kalender und Wissen.',
    stack: ['SvelteKit', 'FastAPI', 'better-auth', 'SQLite', 'Kotlin'],
    domain: 'Suite',
    status: 'live',
    href: 'https://saganta.de',
  },
  {
    id: 'homelab',
    title: 'Homelab',
    tagline: 'Eigenbetriebene Infrastruktur, die mit jedem Monat reifer wird.',
    description:
      'Über 160 Dienste laufen bei mir zuhause im Dauerbetrieb (Mail, Suche, Automation, AI-Inferenz) verteilt auf mehrere Hosts und betrieben wie ein Produkt, nicht wie ein Bastelkeller. Jede Änderung geht von einer einzigen Quelle der Wahrheit aus; ein Event-Spine verbindet die Dienste, eine Routen-Probe meldet öffentliche Domänen, die kippen, bevor ich es merke. Segmentiert, gehärtet, dokumentiert. Und wächst kontrolliert um neue Hosts und Domänen.',
    role: 'Aufbau, Design, Betrieb, On-Call',
    year: 'seit 2024',
    highlight: 'Über 160 Dienste im Dauerbetrieb, null Drift gegen die Quelle der Wahrheit',
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
    tagline: 'Eigenständige Lern-Apps auf einem geteilten Kern, gebaut für die nächste Disziplin.',
    description:
      'Mehrere eigenständige Lern-Apps auf einem geteilten Kern, jede für eine andere Prüfung, aber mit derselben Lernlogik, demselben Design-System und denselben Android-Modulen darunter. Geteiltes wird einmal gebaut und synchronisiert statt kopiert; Getrenntes (Datenbank, Auth, Theme) bleibt pro App vollständig isoliert, damit jede Domäne ihr eigenes Tempo und Gesicht behält. Aus dem alten Kachel-Menü ist ein durchgehendes Produkt geworden: eine Session führt vom Lesen direkt ins Üben und schlägt den nächsten sinnvollen Schritt selbst vor, statt einen vor eine Menüwand zu stellen. Eine neue Lern-Domäne kommt als weitere App auf demselben Fundament dazu, nicht als Eingriff in den Kern.',
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
    tagline: 'Das eigene Haus als begehbares Interface, in 2D und 3D.',
    description:
      'Mein Zuhause als begehbares Interface statt als endlose Karten-Wand: ein 2D-Grundriss zum schnellen Schalten und eine 3D-Szene für Raum- und Etagenwechsel, beide auf derselben Datenschicht und mit demselben Live-Status. Statuswechsel kommen ohne Polling an. Schalte ich das Licht, springt es sofort auch im Grundriss. Geräte wandern per Drag-and-drop an ihren Platz, Klimaverläufe lassen sich über Räume vergleichen, neue Räume fügen sich an, ohne dass Bestehendes umgebaut wird.',
    role: 'Architektur, Backend, Frontend, Raum-Modell',
    year: 'seit 2026',
    highlight: '2D und 3D auf einer Datenschicht, Status in Echtzeit statt im Sekundentakt',
    stack: ['TypeScript', 'React', 'Three.js', 'FastAPI', 'WebSocket'],
    domain: 'Infra',
    status: 'live',
  },
  {
    id: 'homelab-app',
    title: 'Homelab-Cockpit',
    tagline: 'Das eigene Homelab als natives Ops-Cockpit in der Hosentasche.',
    description:
      'Ein nativer Android-Begleiter, der mein Homelab vom Handy aus steuerbar macht: Host-Metriken auf einen Blick, Dienste starten, stoppen und neu starten samt Logs, und eine Inbox zum Sichten offener Punkte. Die App spricht ausschließlich ein privates Gateway übers eigene VPN an; gekoppelt wird per QR-Scan, der einen gerätegebundenen Schlüssel im Android-KeyStore erzeugt und gegen ein Client-Zertifikat samt mTLS eintauscht, der Schlüssel verlässt das Gerät nie. Ein öffentlicher Demo-Modus zeigt die App ganz ohne Gateway. Gebaut wie eine Produktiv-App, nicht wie eine schnelle Fernsteuerung.',
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
    tagline: 'Persönlicher On-Call fürs eigene Homelab, ein Wächter-Set das mitwächst.',
    description:
      'Ein Discord-Bot ist mein Bereitschaftsdienst fürs Homelab: er meldet Container-Health, Backup-Status, verfügbare Updates, Alarme aus dem hauseigenen Event-Bus, Security-Audit-Anstöße und den Zustand der VPN-Verbindungen, dorthin, wo ich ohnehin schon bin. Jede neue Sorge bekommt einen eigenen, abgekapselten Baustein, ohne den Kern zu berühren. So wächst das Wächter-Set genau mit dem mit, was die Infrastruktur über sich selbst lernt.',
    role: 'Design, Cog-Architektur, Event-Anbindung',
    year: 'seit 2026',
    highlight: 'Modulare Wächter-Architektur, Baustein für Baustein erweiterbar',
    stack: ['Python', 'discord.py', 'Prometheus', 'MQTT'],
    domain: 'Bots',
    status: 'live',
  },
  {
    id: 'marktwatch',
    title: 'Marktwatch',
    tagline: 'Erkennt echte Schnäppchen mit Wahrscheinlichkeit statt Bauchgefühl, und meldet nur, was auch im schlechten Fall trägt.',
    description:
      'Marktwatch durchforstet Kleinanzeigen und eBay nach unterbewerteter Homelab-Hardware und meldet mir echte Schnäppchen per Discord, ohne bei Mengenrabatt-Tricks, Varianten-Verwechslern oder Bundles Fehlalarm zu schlagen. Die Fehlalarm-Abwehr läuft in Schichten: erst ein kostenloser Regel-Filter, dann ein kleines Sprachmodell nur für Grenzfälle, beides hinter einem gemeinsamen Gate, durch das Echtzeit-Alarm und Tages-Digest gleichermaßen müssen. Gerechnet wird mit Preisverteilungen statt Mittelwerten: eine Empfehlung kommt nur, wenn selbst das schlechteste Szenario noch Gewinn lässt (ein 5%-Quantil und der erwartete Verlust darunter), samt höchstem sinnvollem Gebot. Alles Unumkehrbare bleibt hinter einem Zwei-Flag-Gate, beobachtend als Default.',
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
    tagline: 'Bilderkennung auf eigener Edge-Hardware, nicht in fremden Rechenzentren.',
    description:
      'Bilderkennung auf einer GPU im Heimnetz, statt jedes Bild an einen Cloud-Dienst abzugeben. Die Edge-Hardware der ersten Generation ist eigensinnig (knapper Speicher, alte Toolchain, kaum etwas installiert sich von der Stange), also habe ich jeden Plattform-Stolperstein einmal gelöst und festgehalten, bis ein belastbarer Pfad stand statt einer Bastelei. Eine API kapselt die Hardware-Bindung an einer einzigen Stelle: andere Eigen-Services konsumieren die Inferenz, ohne die GPU dahinter je zu kennen, und weitere Modelle sitzen ohne Umbau auf derselben Grundlage auf. Aktuell pausiert die Pipeline: die Edge-Hardware ist seit einem Umbau der Verkabelung nicht am Netz, der abnehmende Dienst fällt sauber darauf zurück, statt Ergebnisse zu erfinden.',
    role: 'Plattform-Bring-up, Integration, Hardening',
    year: 'seit 2026',
    highlight: 'Lokale GPU-Inferenz im Heimnetz, unabhängig von der Cloud',
    stack: ['PyTorch', 'YOLOv5', 'FastAPI'],
    domain: 'AI',
    status: 'wartung',
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
    tagline: 'Mehrere WooCommerce-Shops auf eigener Infrastruktur, einheitlich gehärtet statt einzeln gepflegt.',
    description:
      'Mehrere WooCommerce-Shops, die ich auf eigener Infrastruktur baue und einheitlich härte, statt jeden einzeln zu pflegen. Standard-WooCommerce ist nicht gehärtet, und die Pflege pro Instanz wird teurer, je mehr dazukommen. Deshalb zieht eine kanonische Härtungs-Quelle jede Instanz auf denselben Stand: gehärtete Templates, isolierte Instanzen, ein einheitlicher Deploy-Pfad, ein dokumentierter Restore. Eine neue Instanz erbt das fertige Hardening-Bundle, statt es neu zusammenzubauen, und Korrekturen wirken überall gleich, weil die Instanzen lesen, was eine Quelle schreibt.',
    role: 'Hosting, Hardening, Maintenance',
    year: 'seit 2024',
    highlight: 'Eine neue Instanz erbt das Hardening, statt es neu zusammenzubauen: Skalierung ohne Drift-Risiko',
    stack: ['WordPress', 'WooCommerce', 'nginx', 'Docker'],
    domain: 'Web',
    status: 'im-aufbau',
  },
  {
    id: 'wissens-foederation',
    title: 'Wissens-Föderation',
    tagline: 'Eine Such-API über zehn eigene Datenquellen. Das Frontend kennt keine davon.',
    description: 'Eine einzige Suchanfrage durchsucht zehn völlig verschiedene Eigen-Systeme auf einmal (von Dokumenten, Notizen und Inventar über Marktdaten und Briefe bis zu Wissens-Archiven, Büchern und Prüfungsstoff), und das Frontend kennt keines davon. Jede Quelle steckt hinter einem Adapter, die Abfrage fächert sich auf alle auf und kommt vereinheitlicht zurück; aggregiert wird bewusst zur Abfragezeit, statt per Hintergrund-Crawler einen zweiten Wahrheitsstand zu pflegen. Jeder Backend-Zugriff läuft token-authentifiziert. So wird aus verstreuten Insel-Systemen ein Wissens-Layer, den andere Dienste als ein einziges Backend ansprechen, ohne die Quellen dahinter zu kennen.',
    role: 'Architektur, Adapter-Design, Betrieb',
    year: 'seit 2026',
    highlight: 'Zehn heterogene Quellen hinter einer Such-API, Auth pro Backend',
    stack: ['FastAPI', 'Python', 'RAG', 'Bearer-Auth', 'Event-Bus'],
    domain: 'AI',
    status: 'live',
  },
  {
    id: 'postfach',
    title: 'Postfach',
    tagline: 'Papierpost wird zum Handy-Foto, das Foto zum durchsuchbaren Datensatz.',
    description: 'Ein Brief wird zum schnellen Handy-Foto und kommt als sauber abgelegter, durchsuchbarer Datensatz zurück. Vor dem Auslesen geht das Foto durch eine eigene Bildaufbereitung, die das Dokument im Bild findet und begradigt; dann liest OCR den Text und ein Sprachmodell zieht Titel und Absender heraus. Jeder fertige Scan löst ein Ereignis auf meinem Event-Bus aus, sodass andere Dienste mitlesen, und eine abgesicherte interne Such-Schnittstelle macht den Bestand für den Wissens-Layer auffindbar. Aufbereitung und Ablage laufen vollständig auf eigener Hardware. Papierkram wird zu Daten, ohne Cloud-DMS.',
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
    tagline: 'Aus vielen Quellen wird eine Story: semantisches Clustering mit harter Kostendisziplin.',
    description: 'Eine Nachrichten-Engine, die nicht Artikel zählt, sondern Storys versteht: Beiträge aus vielen Feeds werden über eigene Embeddings semantisch geclustert, sodass Berichte zur selben Sache auch über Sprachgrenzen hinweg zusammenfinden, und nach Quellenzahl, Trend und Quellenqualität verdichtet statt nach dem lautesten Einzelartikel. Der Kern ist die Kostenarchitektur: die Masse läuft lokal und deterministisch, ein Cloud-Modell kommt nur als Chefredakteur für die wenigen harten Schritte zum Einsatz, hinter Router, Budget-Wächter und Aufruf-Logbuch. Standardmäßig fallen null externe Kosten an; Qualität wird nur dort eingekauft, wo sie zählt.',
    role: 'Architektur, NLP-Pipeline, Cost-Layer',
    year: 'seit 2026',
    highlight: 'Null externe Kosten im Standardbetrieb, Cloud nur hinter harten Caps',
    stack: ['FastAPI', 'PostgreSQL', 'Vektor-Embeddings', 'Claude API', 'Hybrid-LLM-Routing'],
    domain: 'AI',
    status: 'live',
  },
  {
    id: 'concierge',
    title: 'Privater Concierge',
    tagline: 'Ein eigener Sprach- und Text-Assistent, der jede Anfrage zum passenden Modell routet, lokal, wo es reicht.',
    description: 'Ein lokal betriebener Sprach- und Text-Assistent, der jede Anfrage zur passenden Modell-Stufe routet: ein kleines lokales Modell erledigt Alltag und Tagesbriefing ohne Cloud-Kosten, harte Aufgaben gehen gezielt an ein starkes Modell. Aktionen laufen über einen einzigen Tool-Bus mit Schema-Prüfung, Risk-Tier und Audit-Log. Ein Host-Reboot wird nie ohne meine ausdrückliche Freigabe ausgeführt. Ein inkrementeller Briefing-Pool bewertet und verdrängt Kandidaten nach Frische, Quelle und Feedback, ein Wissens-Layer wählt pro Frage den passenden Wissensraum. Stimme, Wissen und Steuerung bleiben im eigenen Netz, die Kosten kontrollierbar.',
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
    ],
  },
  {
    id: 'defense-in-depth',
    title: 'Defense in Depth',
    tagline: 'Sicherheit als durchgehender Layer, nicht als Nachgedanke: gehärtet, segmentiert, überwacht, wiederherstellbar.',
    description: 'Sicherheit liegt hier nicht in einer einzelnen Maßnahme, sondern über jede Schicht verteilt. Jeder Dienst läuft minimal-privilegiert mit read-only Dateisystem, gedroppten Capabilities und ohne Root; Docker-Zugriff nur über eingeschränkte Proxies mit dokumentiertem Ausnahmen-Inventar. Das Netz ist in Zonen geschnitten mit einer Regel pro Container, ein eigener Wächter meldet jeden nicht genehmigten Verbindungsaufbau in Echtzeit, Identität läuft zentral über SSO mit Anmeldeschutz und echtem Client-IP-Logging hinter dem Edge. Darunter liegt verschlüsseltes Off-Site-Backup mit regelmäßigem Restore-Drill, Wiederherstellung getestet statt nur gehofft.',
    role: 'Sicherheits-Architektur, Härtung, Betrieb',
    year: 'seit 2025',
    highlight: 'Verteidigung über Container, Netz, Edge, Identität und Wiederanlauf statt Einzelmaßnahme',
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
    tagline: 'Eine eigene Kontrollebene über die ganze Host-Flotte, gehärtet statt bequem.',
    description: 'Statt mich auf jeden Host einzeln einzuloggen, läuft alles über eine eigene Oberfläche: Live-Metriken aller Hosts (Last, Temperatur, Speicher, Platte), Service-Start und -Stopp aus der Distanz, Container-Logs auf Abruf, eine selbst gezeichnete Topologie-Ansicht der Dienste und ihrer Abhängigkeiten, dazu die Backup-Frische über alle Hosts. Der Zugriff läuft nie direkt, sondern über eine gehärtete Zwischenschicht ohne Container-Exec, firewall-gesperrt auf genau eine Steuerebene und so verankert, dass die Sperre Reboot übersteht; jeder Konsument bekommt einen eigenen, eng zugeschnittenen Schlüssel statt eines Generalschlüssels. Abweichungen zwischen erwartetem und tatsächlichem Zustand erkennt sie selbst, ohne bewusste Stilllegungen als Fehlalarm zu werten. Bewusste Entscheidung: keine Host-Shell, kein Remote-Terminal.',
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
      'Um Windows Server und Active Directory nicht nur zu lesen, sondern praktisch zu betreiben, entsteht auf dem eigenen Cluster ein abgeschottetes Lab: ein Domänencontroller und ein Windows-Client als virtuelle Maschinen, on-demand gestartet, mit UEFI und Secure Boot. Ziel ist der geübte Umgang mit Domänen, Gruppenrichtlinien, DNS und Benutzerverwaltung, dazu ein sauber dokumentierter Aufbau statt Klick-Anleitung. Der Stand ist ehrlich: der Domänencontroller läuft, die Domäne steht mit eigenem, integriertem DNS, und erste Organisationseinheiten, Benutzer und Gruppen sind angelegt; als Nächstes die Gruppenrichtlinien in der Tiefe und der Domänen-Beitritt des Clients. Ein bewusster Schritt in Richtung klassischer Administrations-Aufgaben, neben dem sonst Linux-lastigen Rest.',
    role: 'Aufbau, Virtualisierung, Lernpfad',
    year: 'seit 2026',
    highlight: 'Domänencontroller und Client als VMs auf dem eigenen Cluster, on-demand, sauber dokumentiert.',
    stack: ['Proxmox VE', 'Windows Server', 'Active Directory', 'GPO', 'UEFI'],
    domain: 'Infra',
    status: 'im-aufbau',
    taglineEn: 'A lab for Windows Server and Active Directory on my own virtualization, currently taking shape.',
    descriptionEn:
      'To operate Windows Server and Active Directory hands-on rather than only read about them, an isolated lab is coming up on my own cluster: a domain controller and a Windows client as virtual machines, started on demand, with UEFI and Secure Boot. The goal is fluent handling of domains, group policy, DNS and user management, with a clean, documented build instead of a click-through. The state is honest: the domain controller is up, the domain stands with its own integrated DNS, and the first organizational units, users and groups exist; next come group policy in depth and joining the client to the domain. A deliberate step toward classic administration work, next to the otherwise Linux-heavy stack.',
    highlightEn: 'Domain controller and client as VMs on my own cluster, on demand, cleanly documented.',
    roleEn: 'Build, virtualization, learning path',
  },
  {
    id: 'modell-vermittlung',
    title: 'Modell-Vermittlung',
    tagline: 'Ein Tor für alle KI-Aufrufe im Haus, mit Budget, Umschaltung und ehrlicher Kostenrechnung.',
    description: 'Statt dass jeder Dienst sein Sprachmodell selbst ruft, läuft alles über eine zentrale Vermittlung: ein Endpunkt, der beide gängigen Schnittstellen-Formate spricht, sodass bestehende Dienste ohne Umbau darüber laufen. Jeder Konsument bekommt einen eigenen Schlüssel mit eigenem Monatsbudget als Runaway-Schutz, dazu eine Modell-Freigabeliste; bei Überlast oder Ausfall schaltet die Vermittlung auf ein Ausweich-Modell um, lokal wie in der Cloud. So entsteht ein einziges Kostenbild statt verstreuter Abrechnung, ein Deckel pro Dienst statt böser Überraschung, und ein dokumentierter Weg, wenn eine Seite wegbricht. Bewusst als schmales Tor gebaut, nicht als weitere Abhängigkeit.',
    role: 'Architektur, Implementation, Betrieb',
    year: 'seit 2026',
    highlight: 'Ein Budget-gedeckeltes Tor für alle KI-Aufrufe, Cloud und lokal, mit Ausweich-Pfad',
    stack: ['LiteLLM', 'FastAPI', 'PostgreSQL', 'Docker'],
    domain: 'Infra',
    status: 'live',
  },
  {
    id: 'gartiko',
    title: 'Gartiko',
    tagline: 'Eine öffentliche Pflanzen-Pflege-App mit Community-Anschluss, live unter eigener Domain.',
    description: 'Ein öffentliches Pflege-Portal für Pflanzen aller Art: Bestände anlegen, Pflegephasen verfolgen, Erinnerungen und Wissen an einer Stelle, live unter eigener Domain auf eigener Infrastruktur. Das Portal teilt sich den Unterbau mit einem Community-Bot, sodass Wissenspflege und Web-Oberfläche aus derselben Quelle schöpfen statt doppelt gepflegt zu werden. Der Admin-Bereich ist am öffentlichen Rand hart abgeschnitten und nur aus dem eigenen Netz erreichbar, der öffentliche Teil bleibt schlank und schnell. Ein Produkt, das man besuchen kann, nicht nur ein Screenshot.',
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
        note: 'Signierter Home-Assistant-Webhook (HMAC), der nur gewählte Klimawerte sendet — kein Zugriffstoken verlässt das Haus.',
        noteEn: 'Signed Home Assistant webhook (HMAC) that only sends selected climate readings, no access token ever leaves the home.',
      },
    ],
  },
  {
    id: 'rackforge',
    title: 'RackForge',
    tagline: 'Ein eigener Shop für 3D-gedruckte Teile, von Grund auf gebaut statt auf ein Shop-System gesetzt.',
    description:
      'Ein 3D-Druck-Shop, komplett ohne Shop-Framework selbst gebaut: eigener Katalog mit generierten Detailseiten, ein farbbewusster Warenkorb, der dieselbe Form in verschiedenen Farben sauber auseinanderhält, und eine Bestands-Engine, die Filament-Rollen und fertig gedruckte Teile getrennt führt. Was nicht auf Lager liegt, gilt nicht als ausverkauft, sondern als „auf Bestellung"; ein erledigter Druck wird gegen den Bestand verbucht. Nutzer laden eigene Druckdateien hoch, geprüft von einem selbst geschriebenen Upload-Pfad mit Format- und Größen-Grenzen. Eigenes Datenmodell, eigene Kasse, eigene Regeln.',
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
    tagline: 'Ein eigenes, schlankes CMS als wiederverwendbare Grundlage für kleine Websites.',
    description:
      'Ein eigenes, bewusst schlankes CMS als Vorlage für kleine Websites, statt jede kleine Seite auf ein schwergewichtiges Fremd-CMS zu setzen. Eine eigene Seite läuft bereits damit, weitere Seiten erben dieselbe Grundlage. Inhalte pflegt man über eine Oberfläche, die nur aus dem eigenen Netz erreichbar ist (am öffentlichen Rand wird der Admin-Pfad hart abgewiesen), während der öffentliche Teil aus einem eigenen Datenspeicher schnell und statisch ausgeliefert wird. Eine neue Seite wird so zur Konfigurations-Frage statt zum Neubau.',
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
    tagline: 'Ein öffentlicher Server als bewusst getrennte Zone neben dem Heim-Verbund.',
    description:
      'Nicht alles gehört ins Heimnetz: für öffentlich erreichbare Seiten und Mail steht ein eigener Server am Netz-Rand, bewusst als getrennte Zone aufgesetzt, damit ein exponierter Dienst nie im selben Segment wie die private Infrastruktur sitzt. Ein TLS-Reverse-Proxy terminiert die Domänen und reicht nur lokal an gehärtete, read-only betriebene Container weiter. Ein eigener Mailserver übernimmt Versand und Empfang für die eigenen Domänen, statt das einem Fremd-Postfach zu überlassen. Mehrere Sites teilen sich denselben, einheitlich abgesicherten Unterbau.',
    role: 'Architektur, Provisionierung, Härtung, Betrieb',
    year: 'seit 2026',
    highlight: 'Exponierte Dienste in einer getrennten Edge-Zone, eigener Mailserver statt Fremd-Postfach.',
    stack: ['Caddy', 'Docker', 'Mailserver', 'Debian', 'Off-Site'],
    domain: 'Infra',
    status: 'live',
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
      'Meine Medien liegen verschlüsselt auf der Platte und werden nur bei Bedarf sichtbar: eine schlanke Oberfläche entsperrt die Bibliothek on-demand, hängt sie ein und fährt den Medien-Server gleich mit hoch; beim Sperren geht beides wieder zu. So liegt nichts dauerhaft entschlüsselt herum, und der Dienst läuft nur, wenn ich ihn wirklich brauche. Die Entsperr-Phrase wird nur flüchtig verarbeitet und nie gespeichert, der Zugang bleibt aufs eigene Netz begrenzt.',
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
    tagline: 'Ein knapper Knoten, der selbst entscheidet, wer laufen darf.',
    description:
      'Ein Knoten des Virtualisierungs-Clusters trägt sieben schwere Rollen, die fast nie gleichzeitig gebraucht werden, hat aber nur Arbeitsspeicher für eine davon. Statt zu überbuchen und im Ernstfall den Kernel entscheiden zu lassen, welcher Prozess stirbt, plant ein eigener Regler den Knoten: er kennt die Rollen als Einträge in einer Registrierdatei, nicht als Sonderfälle im Code, fragt jede laufende Rolle nach ihrer echten Auslastung, verdrängt bei einer neuen Anforderung die alte mit gesichertem Zustand und schaltet ab, was zwanzig Minuten leer läuft. Öffentlich erreichbar sind die Dienste nur über einen Tunnel zu einem eigenen Server am Netz-Rand, der ihren Verkehr weiterleitet: am Heimanschluss ist kein einziger Port geöffnet, und die Anschluss-Adresse taucht nirgends auf. Ergebnis: ein Knoten, der im Leerlauf still ist, sieben Rollen trägt und trotzdem nie überbucht.',
    role: 'Konzept, Implementation, Netz-Design, Betrieb',
    year: 'seit 2026',
    highlight: 'Sieben schwere Rollen auf einem Knoten, immer nur eine gleichzeitig, gesteuert nach echter Auslastung statt nach Vermutung.',
    stack: ['Python', 'Proxmox · LXC', 'systemd', 'WireGuard', 'nftables', 'restic'],
    domain: 'Infra',
    status: 'live',
    repo: 'https://github.com/sami-djouhri/minecraft-arbiter',
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
      'My own productivity suite: mail, calendar, valuables, a project deck and everyday apps from pantry to meal planning: all under one brand, one login, one look, reachable at its own domain. Every sub-app talks only to an upstream mediation layer that also enforces the access gate at the edge, never straight to the backends; a lean self-built auth service issues the same session for web and native Android. The appeal is how the domains interlock: valuables know their market value because my own market engine feeds them, and paper mail lands searchable under the same roof. What began as a family suite grows a little more complete with every domain.',
    highlight: 'One login for web and native Android, full data sovereignty over mail, calendar and knowledge.',
    role: 'Architecture, implementation, ongoing build-out',
  },
  homelab: {
    tagline: 'Self-run infrastructure that grows more mature every month.',
    description:
      'Over 160 services run at my home around the clock (mail, search, automation, AI inference) spread across several hosts and operated like a product, not a hobby basement. Every change originates from a single source of truth; an event spine connects the services, a route probe reports public domains that are failing before I notice. Segmented, hardened, documented, and it grows in a controlled way with new hosts and domains.',
    highlight: 'Over 160 services in continuous operation, zero drift against the source of truth',
    role: 'Build, design, operations, on-call',
  },
  lernen: {
    tagline: 'Standalone learning apps on a shared core, built for the next discipline.',
    description:
      "Several standalone learning apps on a shared core, each for a different exam, but with the same learning logic, design system and Android modules underneath. What's shared is built once and synced instead of copied; what's separate (database, auth, theme) stays fully isolated per app, so each domain keeps its own pace and face. The old tile menu has become a continuous product: a session leads straight from reading into practice and suggests the next sensible step itself, instead of putting you in front of a wall of menus. A new learning domain arrives as another app on the same foundation, not as surgery on the core.",
    highlight: 'One shared core, six standalone apps, web and native Android',
    role: 'Design, backend, frontend, Android',
  },
  'home-digital-twin': {
    tagline: 'My own home as a walkable interface, in 2D and 3D.',
    description:
      'My home as a walkable interface instead of an endless wall of cards: a 2D floor plan for quick switching and a 3D scene for moving between rooms and floors, both on the same data layer and with the same live status. Status changes arrive without polling. Flip a light and it jumps instantly in the floor plan too. Devices move to their place by drag-and-drop, climate curves compare across rooms, new rooms attach without rebuilding what is already there.',
    highlight: '2D and 3D on one data layer, status in real time instead of on a timer',
    role: 'Architecture, backend, frontend, room model',
  },
  'homelab-app': {
    tagline: 'My homelab as a native ops cockpit, right in my pocket.',
    description:
      'A native Android companion that makes my homelab operable from the phone: host metrics at a glance, services to start, stop and restart with their logs, and an inbox to triage open items. The app only ever talks to a private gateway over my own VPN; pairing happens by scanning a QR code that generates a device-bound key in the Android KeyStore and exchanges it for a client certificate and mTLS, so the key never leaves the device. A public demo mode shows the app entirely without a gateway. Built like a production app, not a quick remote control.',
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
    tagline: 'Spots real bargains with probability instead of gut feeling, and flags only what holds up in the bad case too.',
    description:
      'Marktwatch scours classifieds and eBay for underpriced homelab hardware and pings me real bargains on Discord, without raising false alarms on bulk-discount tricks, variant mix-ups or bundles. The false-positive defense runs in layers: first a free rule filter, then a small language model only for borderline cases, both behind a shared gate that the real-time alert and the daily digest must equally pass. It reckons with price distributions instead of averages: a recommendation only lands when even the worst-case scenario still leaves a profit (a 5% quantile and the expected shortfall below it), complete with the highest sensible bid. Everything irreversible stays behind a two-flag gate, with observation as the default.',
    highlight: 'Flags only when even the bad case still leaves a profit',
    role: 'Architecture, crawler, deal math, false-positive defense',
  },
  'ai-vision': {
    tagline: "Image recognition on my own edge hardware, not in someone else's data center.",
    description:
      'Image recognition on a GPU in my home network instead of handing every image to a cloud service. The first-generation edge hardware is stubborn (tight memory, an old toolchain, almost nothing installs off the shelf), so I solved every platform stumbling block once and wrote it down until a dependable path stood instead of a hack. An API encapsulates the hardware binding in a single place: other self-run services consume the inference without ever knowing the GPU behind it, and further models sit on the same foundation without a rebuild. The pipeline is currently paused: the edge hardware has been off the network since a re-cabling, and the consuming service degrades cleanly instead of inventing results.',
    highlight: 'Local GPU inference in the home network, independent of the cloud',
    role: 'Platform bring-up, integration, hardening',
  },
  shops: {
    tagline: 'Multiple WooCommerce shops on my own infrastructure, uniformly hardened instead of maintained one by one.',
    description:
      'Multiple WooCommerce shops I build and uniformly harden on my own infrastructure, instead of maintaining each one by hand. Stock WooCommerce is not hardened, and per-instance maintenance gets more expensive the more of them pile up. So a canonical hardening source pulls every instance to the same state: hardened templates, isolated instances, one uniform deploy path, one documented restore. A new instance inherits the finished hardening bundle instead of rebuilding it, and fixes take effect everywhere alike because the instances read what one source writes.',
    highlight: 'A new instance inherits the hardening instead of rebuilding it: scaling without drift risk',
    role: 'Hosting, hardening, maintenance',
  },
  'wissens-foederation': {
    tagline: 'One search API over ten of my own data sources. The frontend knows none of them.',
    description:
      'A single search query searches ten completely different self-run systems at once (from documents, notes and inventory through market data and letters to knowledge archives, books and exam material), and the frontend knows none of them. Each source sits behind an adapter, the query fans out to all of them and comes back unified; aggregation happens deliberately at query time instead of maintaining a second source of truth via a crawler. Every backend access is token-authenticated. So scattered island systems become one knowledge layer that other services address as a single backend, without knowing the sources behind it.',
    highlight: 'Ten heterogeneous sources behind one search API, auth per backend',
    role: 'Architecture, adapter design, operations',
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
      'A news engine that does not count articles but understands stories: posts from many feeds are semantically clustered via my own embeddings, so reports on the same matter converge into one story even across language borders, and are condensed by source count, trend and source quality instead of the loudest single article. The heart is the cost architecture: the bulk runs locally and deterministically, a cloud model steps in only as editor-in-chief for the few hard steps, behind a router, a budget guard and a call log. By default zero external cost is incurred; quality is bought only where it counts.',
    highlight: 'Zero external cost in standard operation, cloud only behind hard caps',
    role: 'Architecture, NLP pipeline, cost layer',
  },
  concierge: {
    tagline: 'My own voice and text assistant that routes each request to the right model, local where that is enough.',
    description:
      'A locally run voice and text assistant that routes each request to the right model tier: a small local model handles everyday tasks and the daily briefing without cloud cost, hard tasks go deliberately to a strong model. Actions run over a single tool bus with schema checking, a risk tier and an audit log. A host reboot is never executed without my explicit approval. An incremental briefing pool scores and evicts candidates by freshness, source and feedback; a knowledge layer picks the right knowledge space per question. Voice, knowledge and control stay on my own network, the cost stays controllable.',
    highlight: 'Multi-tier routing between local and external model, risky actions only with approval',
    role: 'Architecture, routing, tool bus',
  },
  'defense-in-depth': {
    tagline: 'Security as a continuous layer, not an afterthought: hardened, segmented, monitored, recoverable.',
    description:
      'Security here does not sit in a single measure but is spread across every layer. Every service runs least-privileged with a read-only filesystem, dropped capabilities and no root; Docker access only through restricted proxies with a documented exception inventory. The network is cut into zones with one rule per container, an own watcher reports every unsanctioned connection attempt in real time, identity runs centrally via SSO with login protection and real client-IP logging behind the edge. Underneath lies encrypted off-site backup with a regular restore drill, recovery tested rather than merely hoped for.',
    highlight: 'Defense across container, network, edge, identity and recovery instead of a single measure',
    role: 'Security architecture, hardening, operations',
  },
  'ops-cockpit': {
    tagline: 'My own control plane over the whole host fleet, hardened, not convenient.',
    description:
      'Instead of logging into every host separately, it all runs through one interface: live metrics of all hosts (load, temperature, memory, disk), starting and stopping services from a distance, container logs on demand, a self-drawn topology view of the services and their dependencies, plus backup freshness across all hosts. Access never runs directly but through a hardened intermediate layer without container exec, firewall-locked to exactly one control plane and anchored so the lock survives a reboot; each consumer gets its own tightly scoped key instead of a master key. It spots divergence between expected and actual state itself, without treating deliberate shutdowns as false alarms. A deliberate decision: no host shell, no remote terminal.',
    highlight: 'Multi-host control without container exec, lockdown survives reboot',
    role: 'Architecture, hardening, frontend',
  },
  gartiko: {
    tagline: 'A public plant-care app with community connection, live on its own domain.',
    description:
      'A public care portal for plants of every kind: track inventories, follow care phases, reminders and knowledge in one place, live on its own domain on my own infrastructure. The portal shares its base with a community bot, so knowledge curation and web interface draw from the same source instead of being maintained twice. The admin area is cut off hard at the public edge and reachable only from my own network, the public part stays lean and fast. A product you can visit, not just a screenshot.',
    highlight: 'Publicly reachable on its own domain, admin path cut off at the edge',
    role: 'Architecture, backend, frontend, operations',
  },
  rackforge: {
    tagline: 'My own shop for 3D-printed parts, built from scratch instead of on a shop system.',
    description:
      'A 3D-printing shop built entirely without a shop framework: my own catalog with generated detail pages, a color-aware cart that keeps the same shape in different colors cleanly apart, and an inventory engine that tracks filament spools and finished prints separately. Not in stock does not mean sold out but “made to order”; a completed print is booked against stock. Users upload their own print files, checked by a self-written upload path with format and size limits. My own data model, my own checkout, my own rules.',
    highlight: 'A complete web shop without a framework: own checkout, inventory engine and vetted file upload.',
    role: 'Architecture, backend, frontend, shop logic',
  },
  'cms-baukasten': {
    tagline: 'My own lean CMS as a reusable base for small sites.',
    description:
      'My own deliberately lean CMS as a template for small sites, instead of putting every small site on a heavyweight third-party CMS. One of my own sites already runs on it, further sites inherit the same base. Content is maintained through an interface reachable only from my own network (at the public edge the admin path is rejected hard), while the public part is served fast and static from its own data store. A new site becomes a configuration question instead of a rebuild.',
    highlight: 'My own CMS as a template: admin only on my own network, public part static.',
    role: 'Architecture, backend, frontend, template maintenance',
  },
  'edge-hosting': {
    tagline: 'A public server as a deliberately separate zone next to the home cluster.',
    description:
      'Not everything belongs in the home network: for publicly reachable sites and mail there is a dedicated server at the network edge, deliberately set up as a separate zone so an exposed service never sits in the same segment as the private infrastructure. A TLS reverse proxy terminates the domains and passes only locally to hardened, read-only containers. My own mail server handles sending and receiving for my own domains instead of leaving that to a third-party mailbox. Several sites share the same uniformly secured base.',
    highlight: 'Exposed services in a separate edge zone, own mail server instead of a third-party mailbox.',
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
    tagline: 'A tight node that decides for itself which role gets to run.',
    description:
      'One node of the virtualization cluster carries seven heavy roles that are almost never needed at the same time, yet it only has memory for one of them. Rather than overcommit and let the kernel decide which process dies under pressure, a controller of my own schedules the node: it knows the roles as entries in a registry file instead of special cases in code, asks every running role for its real occupancy, evicts the previous one with its state safely written out when a new request arrives, and switches off whatever has been idle for twenty minutes. Public reachability runs solely through a tunnel to my own edge server, which forwards the traffic: not a single port is open on the home connection, and the home address appears nowhere. The result is a node that stays quiet when idle, carries seven roles and still never overcommits.',
    highlight: 'Seven heavy roles on one node, only ever one at a time, driven by real occupancy instead of guesswork.',
    role: 'Concept, implementation, network design, operations',
  },
  'modell-vermittlung': {
    tagline: 'One gateway for every AI call in the house, with budget, switching and honest cost accounting.',
    description:
      'Instead of each service calling its own language model, everything runs through a central gateway: a single endpoint that speaks both common interface formats, so existing services route through it without a rewrite. Every consumer gets its own key with its own monthly budget as a runaway guard, plus a model allow-list; under overload or outage the gateway switches to a fallback model, local or cloud. The result is one cost picture instead of scattered billing, a cap per service instead of a nasty surprise, and a documented path for when one side drops out. Built deliberately as a thin gateway, not as one more dependency.',
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
  tagline: 'Ich baue zusammenhängende Eigen-Systeme statt Fremd-Baukasten.',
  // Ein-Zeilen-Antwort auf den `whoami`-Prompt im Hero (Mono, knapp).
  whoami: 'Ein selbst gebautes Homelab, das ich verstehe, härte und im Alltag betreibe.',
  bio: 'Ich baue lieber eine kleinere Sache, die mir gehört und die ich verstehe, als mich an ein Fremdprodukt zu binden, das morgen den Preis verdreifacht oder die API abschaltet. Schwerpunkt: produktive Suiten, gehärtete Infrastruktur und AI-gestützte Automation, gebaut, um über Jahre zu laufen, nicht für den Screenshot.',
  contact: {
    email: 'sami@djouhri.de',
  },
};

// Admin-first: das Trio soll die Bewerbungs-Positionierung tragen (Infrastruktur ·
// Systeme · Automation). marktwatch (eBay-Deal-Engine) ist dafür das schwächste
// Signal und wich dem Ressourcen-Arbiter; saganta bleibt, weil es das einzige
// Featured-Projekt mit Live-Screenshot ist (die Landing zieht Previews nur aus
// dieser Liste) und die Breite belegt.
export const FEATURED_PROJECT_IDS = ['saganta', 'homelab', 'ressourcen-arbiter'] as const;

export interface FocusItem {
  title: string;
  status: 'aktiv' | 'als-nächstes' | 'design';
  description: string;
  /** Optional: verlinkt den Fokus-Punkt auf ein Projekt (/projekte/{projectId}). */
  projectId?: string;
}

export const CURRENT_FOCUS: FocusItem[] = [
  {
    title: 'Einen knappen Knoten sich selbst planen lassen',
    status: 'aktiv',
    description:
      'Ein Knoten trägt inzwischen sieben schwere, selten gleichzeitig gebrauchte Rollen, hat aber nur Arbeitsspeicher für eine davon. Statt zu überbuchen entscheidet ein Regler nach echter Auslastung, wer laufen darf, fährt den Vorgänger sauber mit Zustandssicherung herunter und schaltet ungenutzte Rollen nach zwanzig Minuten Leerlauf selbst wieder ab.',
    projectId: 'ressourcen-arbiter',
  },
  {
    title: 'Schwere Last auf den x86-Cluster verteilen',
    status: 'aktiv',
    description:
      'Der Verbund hat einen x86-Cluster dazubekommen, und die Verlagerung ist über den ersten Dienst hinaus: das zentrale KI-Gateway, ein großes Sprachmodell für die langsame Qualitäts-Spur und die Sprach-Synthese liegen inzwischen dort, jeweils in einem eigenen Gast. Die kleinen Rechner behalten, was latenzkritisch ist, statt alles an einem Punkt zu stapeln.',
  },
  {
    title: 'Windows- und Active-Directory-Lab',
    status: 'aktiv',
    description:
      'Auf dem Cluster läuft ein praktisches Windows-Server- und Active-Directory-Lab: der Domänencontroller steht mit eigener Domäne und integriertem DNS, erste Benutzer, Gruppen und Organisationseinheiten sind angelegt. Als Nächstes die Gruppenrichtlinien in der Tiefe und der Domänen-Beitritt eines Clients, bewusst neben dem Linux-Schwerpunkt. Dazu strukturiertes Lernen entlang der klassischen Administrations-Themen, um die eigene Praxis über das Linux-Homelab hinaus zu verbreitern.',
    projectId: 'windows-ad-lab',
  },
  {
    title: 'Wiederanlauf antifragil machen',
    status: 'aktiv',
    description:
      'Die Off-Site-Sicherung deckt inzwischen jeden Host ab, inklusive des verschlüsselten Bündels mit den Zugangsdaten, und eine tägliche Vollständigkeits-Prüfung meldet jede Lücke von selbst. Der Restore-Drill läuft quartalsweise gegen echte Stichproben. Als Nächstes kontrollierte Ausfall-Übungen, damit das System Störungen abfängt, statt sie nur zu melden.',
  },
  {
    title: 'Gläserne Autonomie',
    status: 'als-nächstes',
    description:
      'Jede automatische Aktion im Haus soll eine nachvollziehbare Warum-Spur bekommen: Konfidenz, Begründung und Auslöser mitgeschrieben, statt stillschweigend zu handeln. Die Bausteine sind gebaut und getestet; der Anschluss an den laufenden Melde-Pfad steht noch aus, weil er einen Umbau nah an den sicherheitskritischen Diensten bedeutet.',
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
    items: ['Proxmox · LXC · KVM', 'Docker Compose', 'systemd · Units & Timer', 'cloudflared · Caddy', 'WireGuard', 'nftables · iptables', 'better-auth · Authelia', 'restic · Backup', 'Prometheus · Grafana', 'Mailserver', 'Windows Server · Active Directory'],
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
    title: 'Eigen-System statt Baukasten',
    body: 'Wo es vertretbar ist: lieber eine kleinere eigene App, die ich verstehe und betreiben kann, als ein riesiges Fremd-Produkt, das langfristig driftet.',
  },
  {
    title: 'Sicherheit als Standard',
    body: 'Read-only Container, gedroppte Capabilities, segmentierte Netze, kein direkter Docker-Socket. Härtung passiert in Wellen, dokumentiert pro Ausnahme.',
  },
  {
    title: 'Ehrliche Empty-States',
    body: 'Lieber ein klarer leerer Zustand als ein hübscher Mock, der irgendwann lügt. Keine Halluzinationen in produktiver UI.',
  },
  {
    title: 'Dokumentation als Qualitätssicherung',
    body: 'Service-Map, Runbooks, Entscheidungs-Logs, Zielbild. Was dokumentiert ist, ist überprüfbar, reproduzierbar und übergebbar, statt im Kopf einer einzelnen Person zu hängen. Qualität, die ein Audit übersteht.',
  },
];

// ─── Englische Varianten der Code-Konstanten + Locale-Getter ────────────────────

const ABOUT_EN = {
  role: 'Infrastructure · Systems · Automation',
  tagline: 'I build coherent self-owned systems instead of third-party kits.',
  whoami: 'A self-built homelab I understand, harden and run day to day.',
  bio: 'I would rather build a smaller thing that is mine and that I understand than tie myself to a third-party product that triples its price or shuts off its API tomorrow. Focus: productive suites, hardened infrastructure and AI-assisted automation, built to run for years, not for the screenshot.',
};

/** ABOUT-Profil in der gewählten Sprache (neutrale Felder wie name/location bleiben gleich). */
export function getAbout(locale: Locale): typeof ABOUT {
  return locale === 'en' ? { ...ABOUT, ...ABOUT_EN } : ABOUT;
}

const CURRENT_FOCUS_EN: FocusItem[] = [
  {
    title: 'Letting a tight node schedule itself',
    status: 'aktiv',
    description:
      'One node now carries seven heavy roles that are rarely needed at the same time, but it only has memory for one of them. Instead of overcommitting, a controller decides by real occupancy who gets to run, shuts the previous role down cleanly with its state saved, and switches idle roles back off by itself after twenty minutes.',
    projectId: 'ressourcen-arbiter',
  },
  {
    title: 'Spreading heavy load onto the x86 cluster',
    status: 'aktiv',
    description:
      'The homelab gained an x86 cluster, and the move is well past its first service: the central AI gateway, a large language model for the slow quality lane and speech synthesis all live there now, each in its own guest. The small machines keep what is latency-critical instead of stacking everything in one place.',
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
      'Off-site backup now covers every host, including the encrypted bundle holding the credentials, and a daily completeness check reports any gap on its own. The restore drill runs quarterly against real samples. Next come controlled failure exercises, so the system absorbs disruptions instead of merely reporting them.',
  },
  {
    title: 'Glass-box autonomy',
    status: 'als-nächstes',
    description:
      'Every automated action in the house should carry a traceable reasoning trail: confidence, rationale and trigger recorded, instead of acting silently. The building blocks are written and tested; wiring them into the live notification path is still pending, because it means rebuilding close to the safety-critical services.',
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
    title: 'Self-owned system over kit',
    body: 'Where it is reasonable: rather a smaller app of my own that I understand and can run than a huge third-party product that drifts over time.',
  },
  {
    title: 'Security as default',
    body: 'Read-only containers, dropped capabilities, segmented networks, no direct Docker socket. Hardening happens in waves, documented per exception.',
  },
  {
    title: 'Honest empty states',
    body: 'Rather a clear empty state than a pretty mock that lies eventually. No hallucinations in production UI.',
  },
  {
    title: 'Documentation as quality assurance',
    body: 'Service map, runbooks, decision logs, target picture. What is documented is verifiable, reproducible and handoverable, instead of living in one person’s head. Quality that survives an audit.',
  },
];

export function getPrinciples(locale: Locale): Principle[] {
  return locale === 'en' ? PRINCIPLES_EN : PRINCIPLES;
}
