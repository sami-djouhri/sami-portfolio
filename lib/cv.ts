/**
 * Single-source CV-Daten. Bewusst NICHT identisch mit lib/projects.ts,
 * der CV ist eine Selektion + lineare Erzählung, das Projekt-Repo
 * ist Schaufenster.
 *
 * Privacy-Regel weiterhin: keine internen IPs/Hostnames/Container-Namen.
 *
 * Zweisprachig: die DE-Konstanten bleiben der Default, die EN-Varianten
 * darunter sind idiomatisch (nicht wörtlich) gestrafft. Tech-Namen und
 * Zeiträume sind sprachneutral und werden geteilt. Zugriff über `getCv(locale)`.
 */
import type { Locale } from '@/lib/i18n/config';
import { DIENSTE_PROSA } from '@/lib/proof';

// ★ Der Schalter CV_OEFFENTLICH liegt bewusst in lib/site.ts, NICHT hier: die
// Befehlspalette ist eine Client-Komponente und muss ihn lesen. Ein Import aus
// dieser Datei zöge die vollständigen Lebenslauf-Daten ins Browser-Bundle, nur
// um ein Boolean zu erfahren.

/**
 * Die gesuchte Position, das eigentliche Ziel dieser Website.
 *
 * ★ Stand bis 2026-08-27 wortgleich an zwei Stellen (`/cv` und das generierte PDF).
 * Zwei Fassungen desselben Satzes driften auseinander, sobald sich das Ziel ändert,
 * und dann steht auf dem PDF etwas anderes als auf der Seite. Seit 2026-08-27 ist
 * das hier die einzige Quelle; sie speist zusätzlich das `seeks`-Feld der
 * strukturierten Daten (`app/[locale]/layout.tsx`): Recruiter-Werkzeuge und
 * Suchmaschinen lesen dieses Feld, bevor irgendjemand den Fließtext sieht.
 */
export const CV_ZIEL = {
  de: {
    praefix: 'offen für',
    position: 'eine Festanstellung als Junior IT-Administrator',
    satz: 'Offen für eine Festanstellung als Junior IT-Administrator',
  },
  en: {
    praefix: 'open to',
    position: 'a permanent junior IT administrator role',
    satz: 'Open to a permanent junior IT administrator role',
  },
} as const;

export function getZiel(locale: Locale) {
  return locale === 'en' ? CV_ZIEL.en : CV_ZIEL.de;
}

export interface CvSection<T> {
  title: string;
  items: T[];
}

export interface CvExperience {
  period: string;
  role: string;
  context: string;
  bullets: string[];
}

export interface CvProject {
  name: string;
  year: string;
  oneLiner: string;
  stack: string[];
  /** Optional Projekt-ID, verlinkt auf /projekte/{id} */
  id?: string;
}

export interface CvSkillGroup {
  group: string;
  items: string[];
}

export const CV_EXPERIENCE: CvExperience[] = [
  {
    period: '2024 bis heute',
    role: 'Homelab-Infrastruktur · Aufbau und Eigenbetrieb',
    context: 'Raum Düsseldorf, Deutschland',
    bullets: [
      `Aufbau und Betrieb eines Pi-Verbunds mit ${DIENSTE_PROSA.de.klein} Diensten im Dauerbetrieb, segmentiertem Container-Netz und versionierter Service-Map.`,
      'Erweiterung um einen x86-Virtualisierungscluster aus drei Knoten (Proxmox VE): Container und virtuelle Maschinen bereitgestellt und gehärtet, schwere Dienste von den kleinen Rechnern dorthin verlagert, Windows-Server- und Active-Directory-Lab in eigenen VMs mit UEFI, Secure Boot und virtuellem TPM.',
      'Bedarfsgesteuerter Betrieb schwerer Rollen auf knappem Arbeitsspeicher: ein Regler entscheidet anhand echter Auslastung und gemessenem freiem Platz, wer starten darf, fährt weichende Rollen mit Zustandssicherung herunter und schaltet Leerlauf nach gesetzter Frist ab; belegte Rollen werden nie erzwungen geräumt.',
      'Eigen-Productivity-Suite (Saganta), SvelteKit-Shells vor FastAPI-BFFs, schlanker Auth-Dienst auf Basis von better-auth statt Fremd-OIDC, eine Session über Web und native App, ein Event-Spine für Cross-Service-Signale.',
      'Eigener Wissens-Layer über heterogene Quellen mit BGE-M3-Embeddings und RAG, plus eine Dokumenten-Pipeline aus klassischer Bildvorverarbeitung, OCR und LLM-Extraktion.',
      'Marktwatch eBay Deal-Engine mit asynchronen Crawlern, gewichtetem Scorer und harten Safety-Gates auf jeden Schreibzugriff.',
    ],
  },
  {
    period: '2024 bis heute',
    role: 'Eigene Projekte · Web-Hosting & WordPress-Härtung',
    context: 'eigene Infrastruktur',
    bullets: [
      'Mehrere WooCommerce-Shops im Aufbau, mit eigenen .htaccess-Templates, Security-Headern und Cache-Strategie.',
      'Reverse-Proxy mit automatischem TLS pro Instanz (Caddy · cloudflared), sauber getrennte Vhosts, kein geteilter Zugang.',
      'Getrennte Datenbank- und Datei-Backups je Instanz, mit dokumentiertem und erprobtem Restore-Pfad.',
      'Eigenes Deploy-Pattern mit kanonischen Templates und versionierter Konfiguration, reproduzierbar über alle Instanzen.',
    ],
  },
];

export interface CvEducation {
  period: string;
  title: string;
  context: string;
}

export const CV_EDUCATION: CvEducation[] = [
  {
    period: 'seit August 2024',
    title: 'Ausbildung zur Fachkraft für Lagerlogistik',
    context: 'Duale Berufsausbildung (IHK)',
  },
];

export const CV_PROJECTS_FEATURED: CvProject[] = [
  {
    id: 'homelab',
    name: 'Homelab',
    year: '2024 bis heute',
    oneLiner: 'Pi-Cluster mit Event-Spine, Container-Härtung in Wellen, versionierte Service-Map.',
    stack: ['Docker', 'Prometheus', 'MQTT', 'cloudflared', 'VPN'],
  },
  {
    id: 'defense-in-depth',
    name: 'Defense in Depth',
    year: '2025 bis heute',
    oneLiner: 'Härtung über jede Schicht: Netz-Zonen, SSO, verschlüsseltes Off-Site-Backup mit Restore-Drill.',
    stack: ['SSO · OIDC', 'IDS', 'mTLS', 'Off-Site-Backup', 'Container-Härtung'],
  },
  {
    id: 'ressourcen-arbiter',
    name: 'Ressourcen-Arbiter',
    year: '2026 bis heute',
    oneLiner: 'Sieben schwere Rollen auf knappem Speicher, gesteuert nach echter Auslastung, ohne dass jemand aus einer laufenden Sitzung fliegt.',
    stack: ['Python', 'Proxmox · LXC', 'systemd', 'VPN', 'Paketfilter'],
  },
  {
    id: 'ops-cockpit',
    name: 'Ops-Cockpit',
    year: '2026 bis heute',
    oneLiner: 'Eigene Kontrollebene über die Host-Flotte: Live-Metriken, Backup-Frische, Drift-Erkennung, ohne Host-Shell.',
    stack: ['Next.js', 'Prometheus', 'Docker', 'Firewall-Lockdown'],
  },
  {
    id: 'saganta',
    name: 'Saganta',
    year: '2026 bis heute',
    oneLiner: 'Eigene Productivity-Suite, Mail, Kalender, Assets als zusammenhängende App.',
    stack: ['SvelteKit', 'FastAPI', 'better-auth', 'SQLite'],
  },
  {
    id: 'lernen',
    name: 'Coach-Familie',
    year: '2025 bis heute',
    oneLiner: 'Mehrere Lern-Marken auf einem Kern, Web und Android, gemeinsame Basis.',
    stack: ['Next.js', 'SQLite', 'Compose Multiplatform'],
  },
  {
    id: 'marktwatch',
    name: 'Marktwatch',
    year: '2025 bis heute',
    oneLiner: 'Deal-Engine mit Safety-Invarianten, null unautorisierte Schreibzugriffe.',
    stack: ['FastAPI', 'PostgreSQL', 'APScheduler'],
  },
];

export const CV_SKILLS: CvSkillGroup[] = [
  { group: 'Systemadministration', items: ['Linux (Debian · Raspberry Pi OS)', 'Proxmox VE · LXC/VM', 'Docker · Compose', 'systemd · Timer/Cron', 'Bash · Automations-Skripte'] },
  { group: 'Windows & Active Directory', items: ['Windows Server (im Aufbau)', 'Active Directory · Domäne · DNS', 'Gruppenrichtlinien (GPO)', 'Proxmox VE · UEFI/Secure-Boot-VMs'] },
  { group: 'Netzwerk & Sicherheit', items: ['Netz-Segmentierung · Firewall', 'DNS-Filter · eigener Resolver', 'VPN-Zugang', 'Reverse Proxy (nginx · Caddy)', 'OIDC (Authelia) · Container-Härtung'] },
  { group: 'Betrieb & Monitoring', items: ['Prometheus · Grafana · Alerting', 'Off-Site-Backup & Restore', 'Mailserver (mailcow)', 'Service-Map · Runbooks · Doku'] },
  { group: 'Entwicklung', items: ['Python · FastAPI', 'Node · TypeScript', 'PostgreSQL · SQLite', 'Next.js · SvelteKit', 'Compose Multiplatform'] },
  { group: 'AI / Daten', items: ['Claude API & Vision', 'llama.cpp · BGE-M3', 'RAG · Eval-Harness', 'YOLO / TensorRT'] },
];

export interface CvLanguage {
  name: string;
  level: string;
}

export const CV_LANGUAGES: CvLanguage[] = [
  { name: 'Deutsch', level: 'Muttersprache · C2' },
  { name: 'Englisch', level: 'Fließend · C1' },
];

export const CV_HIGHLIGHTS: string[] = [
  `Selbst aufgebautes Homelab mit ${DIENSTE_PROSA.de.klein} Diensten im Dauerbetrieb auf mehreren Hosts, gemessen gegen eine versionierte Service-Map.`,
  'Virtualisierung im Eigenbetrieb: drei-Knoten-Proxmox-Cluster mit Containern und VMs, Windows-Server- und Active-Directory-Lab, schwere Dienste laufen bedarfsgesteuert und belegen nicht dauerhaft Speicher.',
  'Monitoring, Alerting und verschlüsseltes Off-Site-Backup, dessen Restore im Regelbetrieb getestet wird.',
  'Container-Betrieb mit Docker Compose, segmentierten Netzen und VPN-Zugang, gehärtet und pro Ausnahme dokumentiert.',
  'Architektur schreibend dokumentiert: Zielbild, Runbooks und Service-Map als Pflicht, damit der Betrieb reproduzierbar und übergebbar bleibt.',
];

// ─── Englische Varianten + Locale-Getter ────────────────────────────────────────
// Zeiträume/Jahre/Tech-Namen bleiben neutral; nur Prosa wird idiomatisch übersetzt.

const CV_EXPERIENCE_EN: CvExperience[] = [
  {
    period: '2024 to present',
    role: 'Homelab infrastructure · built and self-run',
    context: 'Düsseldorf area, Germany',
    bullets: [
      `Built and operate a Pi cluster running ${DIENSTE_PROSA.en.klein} services around the clock, with a segmented container network and a version-controlled service map.`,
      'Extended it with a three-node x86 virtualization cluster (Proxmox VE): provisioned and hardened containers and virtual machines, moved heavy services there off the small machines, and set up a Windows Server and Active Directory lab in dedicated VMs with UEFI, Secure Boot and a virtual TPM.',
      'On-demand operation of heavy roles on constrained memory: a controller decides from real occupancy and measured headroom who may start, shuts departing roles down with their state saved, and switches idle roles off after a set timeout; occupied roles are never evicted by force.',
      'Own productivity suite (Saganta): SvelteKit shells in front of FastAPI BFFs, a lean auth service built on better-auth instead of third-party OIDC, one session across web and native app, an event spine for cross-service signals.',
      'Own knowledge layer over heterogeneous sources with BGE-M3 embeddings and RAG, plus a document pipeline combining classic image pre-processing, OCR and LLM extraction.',
      'Marktwatch, an eBay deal engine with async crawlers, a weighted scorer and hard safety gates on every write.',
    ],
  },
  {
    period: '2024 to present',
    role: 'Own projects · Web hosting & WordPress hardening',
    context: 'own infrastructure',
    bullets: [
      'Several WooCommerce shops in progress, with custom .htaccess templates, security headers and a caching strategy.',
      'Reverse proxy with automatic TLS per instance (Caddy · cloudflared), cleanly separated vhosts, no shared access.',
      'Separate database and file backups per instance, with a documented restore path that gets exercised.',
      'Own deploy pattern with canonical templates and version-controlled configuration, reproducible across all instances.',
    ],
  },
];

const CV_EDUCATION_EN: CvEducation[] = [
  {
    period: 'since August 2024',
    title: 'Apprenticeship as a warehouse logistics specialist',
    context: 'Dual vocational training (IHK)',
  },
];

const CV_PROJECTS_FEATURED_EN: CvProject[] = [
  {
    id: 'homelab',
    name: 'Homelab',
    year: '2024 to present',
    oneLiner: 'Pi cluster with an event spine, container hardening in waves, a version-controlled service map.',
    stack: ['Docker', 'Prometheus', 'MQTT', 'cloudflared', 'VPN'],
  },
  {
    id: 'defense-in-depth',
    name: 'Defense in Depth',
    year: '2025 to present',
    oneLiner: 'Hardening across every layer: network zones, SSO, encrypted off-site backup with restore drills.',
    stack: ['SSO · OIDC', 'IDS', 'mTLS', 'Off-Site-Backup', 'Container-Härtung'],
  },
  {
    id: 'ressourcen-arbiter',
    name: 'Resource arbiter',
    year: '2026 to present',
    oneLiner: 'Seven heavy roles on tight memory, driven by real occupancy, and nobody gets thrown out of a running session.',
    stack: ['Python', 'Proxmox · LXC', 'systemd', 'VPN', 'Paketfilter'],
  },
  {
    id: 'ops-cockpit',
    name: 'Ops cockpit',
    year: '2026 to present',
    oneLiner: 'My own control plane across the host fleet: live metrics, backup freshness, drift detection, no host shell.',
    stack: ['Next.js', 'Prometheus', 'Docker', 'Firewall lockdown'],
  },
  {
    id: 'saganta',
    name: 'Saganta',
    year: '2026 to present',
    oneLiner: 'Own productivity suite: mail, calendar and assets as one coherent app.',
    stack: ['SvelteKit', 'FastAPI', 'better-auth', 'SQLite'],
  },
  {
    id: 'lernen',
    name: 'Coach family',
    year: '2025 to present',
    oneLiner: 'Several learning brands on one core, web and Android, a shared foundation.',
    stack: ['Next.js', 'SQLite', 'Compose Multiplatform'],
  },
  {
    id: 'marktwatch',
    name: 'Marktwatch',
    year: '2025 to present',
    oneLiner: 'Deal engine with safety invariants, zero unauthorized writes.',
    stack: ['FastAPI', 'PostgreSQL', 'APScheduler'],
  },
];

const CV_SKILLS_EN: CvSkillGroup[] = [
  { group: 'System administration', items: ['Linux (Debian · Raspberry Pi OS)', 'Proxmox VE · LXC/VM', 'Docker · Compose', 'systemd · timers/cron', 'Bash · automation scripts'] },
  { group: 'Windows & Active Directory', items: ['Windows Server (in progress)', 'Active Directory · domain · DNS', 'Group Policy (GPO)', 'Proxmox VE · UEFI/Secure Boot VMs'] },
  { group: 'Network & security', items: ['Network segmentation · firewall', 'DNS filter · own resolver', 'VPN access', 'Reverse proxy (nginx · Caddy)', 'OIDC (Authelia) · container hardening'] },
  { group: 'Operations & monitoring', items: ['Prometheus · Grafana · alerting', 'Off-site backup & restore', 'Mail server (mailcow)', 'Service map · runbooks · docs'] },
  { group: 'Development', items: ['Python · FastAPI', 'Node · TypeScript', 'PostgreSQL · SQLite', 'Next.js · SvelteKit', 'Compose Multiplatform'] },
  { group: 'AI / Data', items: ['Claude API & Vision', 'llama.cpp · BGE-M3', 'RAG · eval harness', 'YOLO / TensorRT'] },
];

const CV_LANGUAGES_EN: CvLanguage[] = [
  { name: 'German', level: 'Native · C2' },
  { name: 'English', level: 'Fluent · C1' },
];

const CV_HIGHLIGHTS_EN: string[] = [
  `A self-run homelab with ${DIENSTE_PROSA.en.klein} services around the clock across several hosts, measured against a version-controlled service map.`,
  'Self-run virtualization: a three-node Proxmox cluster with containers and VMs, a Windows Server and Active Directory lab, and heavy services run on demand rather than staying resident.',
  'Monitoring, alerting and encrypted off-site backup, with a tested restore as part of the routine.',
  'Container operations with Docker Compose, segmented networks and VPN access, hardened and documented per exception.',
  'Architecture documented as I go: target picture, runbooks and service map are mandatory, so operations stay reproducible and easy to hand over.',
];

export interface Cv {
  experience: CvExperience[];
  education: CvEducation[];
  projectsFeatured: CvProject[];
  skills: CvSkillGroup[];
  languages: CvLanguage[];
  highlights: string[];
}

/** Vollständige CV-Daten in der gewählten Sprache. Tech-Namen/Zeiträume neutral. */
export function getCv(locale: Locale): Cv {
  return locale === 'en'
    ? {
        experience: CV_EXPERIENCE_EN,
        education: CV_EDUCATION_EN,
        projectsFeatured: CV_PROJECTS_FEATURED_EN,
        skills: CV_SKILLS_EN,
        languages: CV_LANGUAGES_EN,
        highlights: CV_HIGHLIGHTS_EN,
      }
    : {
        experience: CV_EXPERIENCE,
        education: CV_EDUCATION,
        projectsFeatured: CV_PROJECTS_FEATURED,
        skills: CV_SKILLS,
        languages: CV_LANGUAGES,
        highlights: CV_HIGHLIGHTS,
      };
}
