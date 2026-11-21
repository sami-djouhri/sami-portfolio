/**
 * Kuratierte Public-Liste, bewusst NICHT aus cockpit/lib/apps-registry.ts importiert,
 * weil das interne Hosts/IPs enthält. Drift ist hier akzeptabel: das Cockpit ist
 * Werkzeug, das Portfolio ist Schaufenster.
 *
 * Privacy-Regel: keine IPs, keine Container-Namen, keine Hostnames.
 */
import type { Locale } from './i18n/config';
import { localizedStackItem } from './stack-begriffe';
import { localizedProject, localizedYear, type LocalizedProjectText } from './projekt-text';
import { ABOUT, getAbout } from './about';

export { ABOUT, getAbout, localizedProject, localizedStackItem, localizedYear, type LocalizedProjectText };

export type Domain = 'Suite' | 'AI' | 'Infra' | 'Bots' | 'Web';
export type ProjectStatus = 'live' | 'im-aufbau' | 'wartung' | 'pivot';

/**
 * Architektur-Skizze pro Projekt, bewusst als deklarative Daten, damit das
 * Render-Component sie privacy-safe und on-brand zeichnet. WICHTIG: `label`/`note`
 * tragen NUR generische Rollen ('Browser', 'BFF', 'Control-Plane', 'AI-Compute'),
 * niemals Hostnames, IPs oder Container-Namen (Privacy-Regel).
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
  /** Englische Bezeichnung, wo `label` deutsche Wörter trägt. Fehlt sie, gilt `label`. */
  labelEn?: string;
  note?: string;
  noteEn?: string;
}

/**
 * Ein echtes Bildschirmfoto der Anwendung.
 *
 * Warum das ein eigenes Feld ist und nicht `LivePreview`. Jene Komponente hängt
 * an `project.href` und zeigt eine öffentlich erreichbare Adresse mit Fensterleiste
 * und „live öffnen". Das trifft auf die Produkte zu, die im Netz stehen, und auf
 * keines der Werkzeuge im eigenen Haus. Gemessen am 2026-10-06 hatten 19 von 24
 * Projekten gar kein Bild, sondern erzeugte Geometrie, und genau das war der einzige
 * Marker, an dem die Seite nach Vorlage aussah. Ein Beleg löst das, ohne eine
 * Adresse zu behaupten, die es nicht gibt.
 *
 * ⚠️ Der Privacy-Grep deckt nur Text. Jedes Bild braucht eine Sichtprüfung auf interne
 * Namen und Adressen IM BILD, bevor es in `public/` landet, und es darf nichts
 * Privates zeigen. Beim Leser der Bibliothek heißt das: ein gemeinfreies Buch
 * (Kafka, Ausgabe des Project Gutenberg) statt des eigenen Regals. Das zeigt die
 * typografische Arbeit und verrät die Sammlung nicht.
 */
export interface Beleg {
  /** Pfad unter `public/`, WebP. */
  bild: string;
  /** Breite und Höhe der Datei, gegen Layout-Sprung beim Nachladen. */
  breite: number;
  hoehe: number;
  alt: string;
  unterschrift: string;
  /**
   * Englische Fassung, ergänzt am 2026-10-17. Vorher gab es sie nicht, und
   * die Bildunterschrift des einen bestehenden Belegs stand damit auf `/en`
   * auf Deutsch. Das fiel nie auf, weil ein Bild auch mit fremdsprachiger
   * Unterschrift aussieht, als sei alles in Ordnung. Entscheid vom
   * 2026-10-15 und am 17.10. bestätigt: beide Sprachen sind gleichwertig.
   */
  altEn?: string;
  unterschriftEn?: string;
}

export interface Project {
  id: string;
  title: string;
  /**
   * Englischer Titel, nur wo `title` ein beschreibender deutscher Name ist
   * („Offline-Wissen", „Spielserver-Betrieb"). Eigennamen (Saganta, Gartiko,
   * Marktwatch) bekommen keinen. Ergänzt am 2026-10-30: bis dahin galt `title`
   * als sprachneutral, und auf `/en` standen 13 deutsche Überschriften.
   */
  titleEn?: string;
  tagline: string;
  description: string;
  role: string;
  year: string;
  highlight: string;
  stack: string[];
  domain: Domain;
  status: ProjectStatus;
  /** Vier-Felder-Kurzfassung. Fehlt sie, rendert die Detailseite wie bisher. */
  /** Echtes Bildschirmfoto der Anwendung, auch ohne öffentliche Adresse. */
  beleg?: Beleg;
  href?: string;
  repo?: string; // öffentliches Quelltext-Repo (GitHub), falls das Projekt Open Source ist, Kurzform für 1 Repo
  repos?: RepoLink[]; // mehrere benannte Quelltext-Teile (hat Vorrang vor `repo`)
  detail?: ProjectDetail;
  // Optionale englische Varianten (additiv; fehlt eine, greift die deutsche als Fallback).
  // `year` läuft über `localizedYear`, `stack` über `localizedStackItem`, `title` über
  // `titleEn` (nur wo er kein Eigenname ist). `domain` bleibt sprachneutral.
  taglineEn?: string;
  descriptionEn?: string;
  highlightEn?: string;
  roleEn?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'saganta',
    title: 'Saganta',
    tagline: 'Kalender, Notizen, Post und Alltags-Apps unter einer Anmeldung.',
       description:
      'Meine eigene Suite mit Kalender, Aufgaben, Notizen, Post, einem Projekt-Deck und Alltags-Apps vom Lager bis zur Essensplanung. Alle laufen unter einer Anmeldung, im Browser, auf Android und als Linux-Programm. Keine App spricht direkt mit einem Backend. Dazwischen sitzt je Bereich eine Schicht, die die Anmeldung prüft und nur freigegebene Felder durchreicht. Die Suite ist privat und nur im eigenen Netz erreichbar. Angefangen hat sie als Familien-Suite.',  role: 'Architektur, Aufbau, laufender Ausbau',
    year: 'seit 2026',
    highlight: 'Eine Anmeldung für Browser, Android und Linux.',
    stack: ['SvelteKit', 'FastAPI', 'better-auth', 'SQLite', 'Kotlin'],
    domain: 'Suite',
    status: 'live',
    // Kein `href` seit dem 2026-10-30: Saganta ist seit dem 21.10. privat
    // (Entscheid), saganta.de antwortet gewollt mit 404. Mit Adresse
    // stand auf der Fallstudie „live oeffnen" vor einer leeren Seite. Das
    // Bildschirmfoto im Werkfeld bleibt, es haengt an `lib/previews`, nicht hier.
    // Zurueck, sobald das Schaufenster auf netcup steht.
    repos: [
      {
        url: 'https://github.com/sami-djouhri/saganta-suite',
        label: 'Saganta-Suite (Plattform)',
        labelEn: 'Saganta Suite (platform)',
        note: 'Der Verbund aus allen Diensten samt Prüfer davor: er findet sechs Fehlerbilder, die ein gültiges Compose-File durchgehen lässt, etwa einen Vhost, der auf einen Dienst zeigt, den es in diesem Stapel nicht gibt.',
        noteEn: 'The whole stack with the checker that runs before it: it catches six failure modes a valid compose file lets through, such as a vhost pointing at a service that does not exist in this stack.',
      },
      {
        url: 'https://github.com/sami-djouhri/saganta',
        label: 'Saganta (Shell und Apps)',
        labelEn: 'Saganta (shell and apps)',
        note: 'Die vordere Hälfte: die Shell, in die man sich anmeldet, die Apps darin und die Backends dahinter.',
        noteEn: 'The front half: the shell you sign into, the apps that live in it, and the backends behind them.',
      },
    ],
  },
  {
    id: 'homelab',
    title: 'Homelab',
    tagline: 'Selbst betriebene Dienste auf mehreren Hosts, seit 2024 im Dauerbetrieb.',
    // Die Beschreibung setzt die Tagline FORT, sie wiederholt sie nicht. Beide
    // begannen bis 2026-08-31 mit „Über 160 … im Dauerbetrieb", und auf der
    // Startseite rendern sie als Featured-Karte direkt untereinander: derselbe
    // Satz zweimal, zwei Zeilen auseinander.
    description:
      'Verteilt auf mehrere kleine Rechner, einen Virtualisierungs-Cluster und zwei gemietete Server. Welcher Dienst wo laufen soll, steht in einer einzigen Datei. Ein Abgleich misst alle 15 Minuten dagegen und meldet jeden Dienst, der fehlt. Meldungen laufen über einen gemeinsamen Event-Bus, und der Meldeweg wird selbst geprüft. Die Sicherungen werden jede Woche testweise zurückgespielt.',
    role: 'Aufbau, Design, Betrieb, On-Call',
    year: 'seit 2024',
    highlight: 'Jeder Dienst steht in einer versionierten Service-Map, gegen die der Ist-Zustand gemessen wird',
    stack: ['Docker', 'Prometheus', 'MQTT', 'cloudflared', 'VPN'],
    domain: 'Infra',
    status: 'live',
    repos: [
      {
        url: 'https://github.com/sami-djouhri/brain-bus',
        label: 'Brain-Bus (Event → Aktion)',
        labelEn: 'Brain-Bus (event → action)',
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
    title: 'Lernstufe',
    tagline: 'Eine Lern-App für alle Bereiche, vom IT-Zertifikat bis zum Führerschein.',
    description:
      'Eine Lern-App für mehrere Bereiche: IT-Zertifikate, Ausbildung, Führerschein, Schulstoff. Bis November 2026 waren das sechs getrennte Apps mit je eigener Datenbank und eigenem Konto. Jetzt gibt es einen Server, eine Datenbank und ein Konto, Konten und Fortschritt der alten Apps sind zusammengeführt. Die Startseite zeigt fällige Wiederholungen über alle Kurse, Probeprüfungen ziehen ihre Fragen aus Pools je Themengebiet. Die App läuft im Browser und auf Android.',
    role: 'Konzept, Aufbau, Betrieb',
    year: 'seit 2025',
    highlight: 'Sechs Apps zu einer zusammengeführt, ohne Konto- oder Fragenverlust',
    stack: ['Next.js', 'SQLite', 'Kotlin', 'Jetpack Compose'],
    domain: 'Suite',
    status: 'live',
    href: 'https://lernen.meisterminze.de',
  },
  {
    id: 'homelab-app',
    title: 'Tardis',
    tagline: 'Android-App, die Dienste startet und stoppt, erreichbar nur übers eigene VPN.',
    description:
      'Ein nativer Android-Begleiter für mein Homelab: Host-Metriken, Dienste starten, stoppen und neu starten samt Logs, dazu eine Inbox für offene Punkte. Die App spricht ausschließlich ein privates Gateway über mein eigenes VPN an. Gekoppelt wird per QR-Scan, der einen gerätegebundenen Schlüssel im Android-KeyStore erzeugt und gegen ein Client-Zertifikat für mTLS eintauscht; der Schlüssel verlässt das Gerät nie. Wer die App ohne Gateway ansehen will, kann einen Demo-Modus starten. Dieselbe Steuerung gibt es im internen Web-Portal, beide gehen über einen Proxy ohne Container-Exec, und eine Host-Shell gibt es nirgends.',
    role: 'Konzept, Aufbau, Sicherheitsmodell',
    year: 'seit 2026',
    highlight: 'Container-Steuerung und Host-Metriken vom Handy, gerätegebundenes mTLS-Pairing, Zugang nur übers eigene VPN',
    stack: ['Kotlin', 'Jetpack Compose', 'Hilt', 'Retrofit', 'Android Keystore'],
    domain: 'Suite',
    status: 'live',
    repo: 'https://github.com/sami-djouhri/tardis-android',
  },
  {
    id: 'homelab-sentinel',
    title: 'Homelab-Sentinel',
    tagline: 'Ein eigener Meldeweg als Bereitschaftsdienst fürs Homelab.',
    description:
      'Das Homelab meldet sich von selbst, wenn etwas zu tun ist. Alarme und Skripte laufen über einen eigenen Event-Bus. Regeln legen Dringlichkeit und Ruhezeit fest, zugestellt wird über ntfy aufs Handy. Eingriffe wie ein Container-Neustart warten als Freigabe in Tardis. Bis November 2026 war das ein Discord-Bot.',
    role: 'Konzept, Aufbau, Event-Anbindung',
    year: 'seit 2026',
    highlight: 'Jede Meldung über eine Regel, jeder Eingriff erst nach Freigabe',
    stack: ['Python', 'MQTT', 'ntfy', 'Prometheus'],
    domain: 'Infra',
    status: 'live',
  },
  {
    id: 'marktwatch',
    title: 'Marktwatch',
    tagline: 'Rechnet am schlechten Fall und meldet nur, was auch dann noch Gewinn lässt.',
    description:
      'Sucht auf Kleinanzeigen und eBay nach Homelab-Hardware unter Wert. Treffer kommen per Discord. Fehlalarme waren das Hauptproblem: Bundles, Ersatzteile, die falsche Variante. Dagegen läuft ein Regelfilter, und Sofort-Alarm und Tagesübersicht gehen beide durch dasselbe Gate. Gerechnet wird mit dem schlechten Fall: niedriger Erlös, hohe Instandsetzung. Eine Meldung kommt erst, wenn auch dann noch Gewinn bleibt, mit dem höchsten Preis, den ich zahlen sollte. Kaufen kann der Bot nicht. Alles, was sich nicht zurücknehmen lässt, braucht zwei gesetzte Schalter.',
    role: 'Konzept, Datenpfad, Bewertungs-Regeln, Betrieb',
    year: 'seit 2025',
    highlight: 'Meldet erst, wenn auch der schlechte Fall noch Gewinn lässt',
    stack: ['FastAPI', 'PostgreSQL', 'BeautifulSoup', 'APScheduler'],
    domain: 'Bots',
    status: 'live',
  },
  {
    id: 'wissens-foederation',
    title: 'Wissens-Föderation',
    tagline: 'Eine Such-API über mehrere Wissensquellen im Haus, erreichbar unter einer Adresse.',
    // quellen-gate:geschichte (Rückbau, keine aktuelle Quellenzahl)
    description: 'Ich wollte nicht jedes Mal überlegen, ob eine Information gerade in einer Notiz, einem Dokument oder einem Nachschlagewerk liegt. Deshalb fragt die Suche mehrere Systeme gleichzeitig ab und bringt die Treffer in ein gemeinsames Format. Die eigentlichen Daten bleiben in ihren jeweiligen Anwendungen. Angebunden sind Dokumente, Notizen, Nachschlagewerke, Bücher, Fachwissen, Kursmaterial, meine eigenen Betriebsanleitungen sowie Orte und Adressen. Vier Quellen habe ich wieder ausgebaut: Inventar, Marktdaten, Termine und Post sind Anwendungsdaten, sie gehören in ihre Anwendung und nicht in einen Wissensindex. Jede Quelle steckt hinter einem eigenen Adapter, die Abfrage fächert sich auf alle auf. Aggregiert wird zur Abfragezeit, damit kein Hintergrund-Crawler eine zweite Kopie der Daten pflegen muss. Wo eine Quelle es verlangt, fragt die Suche mit eigenem Token an.',
    role: 'Architektur, Adapter-Design, Betrieb',
    year: 'seit 2026',
    highlight: 'Verschiedene Quellen hinter einer Such-API, eigener Token, wo die Quelle es verlangt, Betriebsdaten bewusst draußen',
    stack: ['FastAPI', 'Python', 'RAG', 'Bearer-Auth', 'Event-Bus'],
    domain: 'AI',
    status: 'live',
  },
  {
    id: 'offline-wissen',
    title: 'Offline-Wissen',
    tagline: 'Nachschlagen, Karte und Navigation funktionieren auch ohne Leitung nach draußen.',
    description:
      'Nachschlagewerk, Karte und Routenplanung liegen vollständig im Haus und funktionieren, wenn die Leitung nach draußen weg ist. Das Nachschlagewerk hält Wikipedia, Fachbücher und Kursmaterial in Archivform vor. Die Karte ist eine Vektorkarte aus offenen Daten, dazu kommen Luftbilder und eine Satellitenansicht als eigene Ebenen. Adressen mit Hausnummern und gut zwei Millionen Einträge mit Gattung stecken in einem selbstgebauten Index, den ich gegen die verbreitete Standardlösung getauscht habe, weil die auf dieser Hardware nicht läuft. Ein eigener Gast auf dem Virtualisierungs-Cluster rechnet die Routen, ein weiterer die Verbindungen mit Bus und Bahn. Eine App nimmt die Karte für ganz Deutschland aufs Telefon mit. Nebenbei sieht kein Anbieter mehr, wonach hier gesucht wird.',
    role: 'Konzeption, Datenaufbereitung, Betrieb',
    year: 'seit 2026',
    highlight: 'Über 19 Millionen Adressen in einem eigenen Index, gebaut mit unter 500 MB Arbeitsspeicher',
    stack: ['Python', 'SQLite', 'nginx', 'MapLibre', 'Valhalla', 'OpenTripPlanner', 'LXC'],
    domain: 'Infra',
    status: 'live',
    // Beleg statt `href`: das Portal steht nur im Haus, eine oeffentliche
    // Adresse gibt es nicht. Aufgenommen am 2026-10-18 am laufenden Dienst mit
    // `scripts/belege/aufnehmen.sh karte.js`.
    //
    // Die Ansicht ist bewusst eine fremde Innenstadt und nicht die eigene
    // Umgebung. Ein Kartenbild ist sonst eine Adressangabe, und die
    // Pauschalregel vom 2026-10-17 schliesst alles aus, was aus dem Haus
    // zeigt.
    //
    // ⚠️ Im ersten Lauf stand unten rechts ein Hinweiskasten des Portals mit
    // der LAN-Adresse des Wirts, dem internen Namen und dem der eigenen
    // Zertifizierungsstelle. Der Privacy-Grep hat das nicht gefunden und
    // konnte es nicht: er liest Text, nicht Bilder. Das Aufnahme-Werkzeug
    // prueft den sichtbaren Text der Seite jetzt selbst, bevor es ausloest.
    beleg: {
      bild: '/previews/offline-wissen.webp',
      breite: 1120,
      hoehe: 731,
      alt: 'Das Kartenportal mit Luftbild und dreidimensionalen Gebäuden über einer Innenstadt, daneben eine berechnete Radroute mit Höhenprofil, Anstieg, Abstieg und Abbiegehinweisen.',
      altEn:
        'The map portal showing aerial imagery and three-dimensional buildings over a town centre, next to it a computed cycling route with an elevation profile, ascent, descent and turn-by-turn directions.',
      unterschrift:
        'Luftbild, Gelände und Gebäudehöhen kommen aus offenen Landesdaten, die Route rechnet ein eigener Dienst im Haus. Das Höhenprofil liest denselben Kachelsatz wie das Gelände.',
      unterschriftEn:
        'Aerial imagery, terrain and building heights come from open state data, the route is computed by a service of my own. The elevation profile reads the same tile set as the terrain.',
    },
  },
  {
    // Musterkapitel des Neuentwurfs vom 2026-10-06. Erster Eintrag in der neuen
    // Linie: keine Autorschaft, Größenordnungen statt exakter Zahlen, Steckbrief vor
    // der Tiefe. Wer weitere Projekte umstellt, liest zuerst diesen hier.
    id: 'bibliothek',
    title: 'Bibliothek',
    // Erste Fassung redete um die Sache herum (Befund 2026-10-06): sie schrieb
    // „Pflegewerkzeug" statt Calibre und „Bücher, die im Haus liegen" statt E-Books. Die
    // Seite nennt Caddy, mailcow, Prometheus, Proxmox, Tesseract und better-auth beim
    // Namen; ein Produktname ist hier also die Regel und das Umschreiben war die
    // Abweichung. Die Privacy-Regel verbietet Adressen und Wirtsnamen, nicht Software.
    tagline: 'Ein eigener Leser für die Calibre-Sammlung, im Browser und auf dem Telefon.',
    // Jeder Satz beschreibt, was der Dienst TUT oder was ENTSCHIEDEN wurde. Keiner
    // behauptet, wer ihn geschrieben hat. Das ist die Linie, nicht nur Stilgeschmack:
    // sie ist mit dem Gewissen des Owners vereinbar und trifft die gesuchte Rolle.
    description:
      'Die E-Book-Sammlung liegt als EPUB und PDF im Haus und wird mit Calibre verwaltet. Gelesen wird sie im Browser, auf dem Rechner wie auf dem Telefon, wo sie sich auf den Startbildschirm legen lässt und sich wie eine App verhält. Der Leser, den calibre-web mitbringt, kam dafür nicht in Frage: er ist eine epub.js-Demo von 2015, Buchsuche und Notizen stehen im Vorlagentext auskommentiert, und ohne Anmeldung landet der Lesestand auf einem geteilten Gast-Konto, wo ihn der nächste Leser überschreibt. Davor liegt deshalb ein eigener Leser, für die Darstellung der Bücher sorgt foliate-js. Er trennt zwei Dinge, die vorher eins waren: wo das Lesezeichen steckt und was tatsächlich gelesen wurde. Wer ein Buch durchblättert, verschiebt sein Lesezeichen, der Fortschritt bleibt stehen. Vorlesen geht ebenfalls, die Sprachausgabe läuft dabei auf eigener Hardware im Haus.',
    role: 'Konzept, Architektur, Betrieb',
    year: 'seit 2026',
    highlight: 'Gelesen wird auch bei gestopptem calibre-web, ein Buch liegt in 0,18 Sekunden vor.',
    // Gezeigt wird die Leseansicht, nicht das Regal. Ein Regal verrät, was im Haus
    // steht; eine aufgeschlagene Seite zeigt die typografische Arbeit und sonst nichts.
    // Das Buch ist gemeinfrei (Kafka, Ausgabe des Project Gutenberg), damit auf der
    // öffentlichen Seite kein fremder Text steht, der dort nicht stehen darf.
    beleg: {
      bild: '/previews/bibliothek-leser.webp',
      breite: 1440,
      hoehe: 990,
      alt: 'Die Leseansicht mit dem aufgeschlagenen ersten Kapitel von Kafkas Verwandlung im Blocksatz, darunter Seitenzahl und restliche Lesezeit.',
      altEn:
        'The reading view with the opening chapter of Kafka\'s Metamorphosis set justified, with page number and remaining reading time below.',
      // Erste Fassung lautete „... sind eingestellt, nicht übernommen". Das ist eine
      // Antithese, und die ist auf dieser Seite seit dem 2026-09-30 nicht erwünscht.
      // Der Stilprüfer hat sie gemeldet, allerdings erst, nachdem seine Feldliste das
      // Feld überhaupt kannte.
      unterschrift:
        'Die Leseansicht. Die Zeilenlänge ist auf 66 Zeichen eingestellt und am laufenden Dienst nachgemessen. Am rechten Rand steht das Lesezeichen des Profils.',
      unterschriftEn:
        'The reading view. Line length is set to 66 characters and measured against the running service. The profile bookmark sits at the right edge.',
    },
    stack: ['Python', 'SQLite', 'foliate-js', 'nginx', 'Service Worker'],
    domain: 'Suite',
    status: 'live',
  },
  // Aufgenommen am 2026-11-07 (Deck-Aufgabe „Werkliste: finanzen und
  // spielserver dazu"). Kein Bildschirmfoto und kein Beleg: jede Ansicht des
  // Dienstes zeigt das echte Haushaltsbuch. Kein einziger Betrag aus dem Buch
  // steht in diesen Texten, die Beispiele sind allgemein.
  {
    id: 'finanzen',
    title: 'Finanzen',
    titleEn: 'Finances',
    tagline: 'Konten, Budgets und Depot an einem Ort, mit einer Prognose, wie lange das Geld reicht.',
    description:
      'Ein eigener Dienst für das Geld im Haushalt. Er führt Konten und Buchungen, Verträge mit Kündigungsfrist, Kredite, Budgets, Sparziele und ein Depot. Die Hauptfrage ist, wie lange das Geld reicht, wenn alles so weiterläuft. Dafür rechnet er eine Prognose über Jahre als Spanne aus drei Rechnungen und eine Rechnung über Jahrzehnte in heutigem Geld. Jeder Betrag ist ein ganzzahliger Cent, und jeder wiederkehrende Termin wird aus seinem Startdatum berechnet. Buchungen kommen über Daueraufträge, als CSV-Datei oder von Hand, einen Zugang zur Bank gibt es bewusst nicht. Der Dienst ist nur im eigenen Netz erreichbar und liegt hinter einer Anmeldung.',
    role: 'Konzept, Architektur, Betrieb',
    year: 'seit 2026',
    highlight: 'Jeder Betrag ein ganzzahliger Cent, und wo eine Zahl fehlt, steht der Grund statt einer Null.',
    stack: ['Python', 'FastAPI', 'SQLite', 'Authelia', 'Service Worker'],
    domain: 'Suite',
    status: 'live',
  },
  {
    id: 'news-engine',
    title: 'News-Engine',
    tagline: 'Clustert Artikel aus vielen Feeds zu Storys, lokal betrieben.',
    description: 'Eine Nachrichten-Engine, die zusammengehörende Berichte erkennt. Beiträge aus vielen Feeds werden über eigene Embeddings geclustert, sodass Meldungen zur selben Sache auch über Sprachgrenzen hinweg zusammenfinden, und dann nach Quellenzahl, Trend und Quellenqualität sortiert. Embedding, Clustering und Bewertung laufen lokal, Texte schreibt ein lokales Modell im Haus. Ein Cloud-Modell ist eingebaut, aber abgeschaltet, und das Aufrufbuch zeigt seit Mitte September keinen einzigen Aufruf.',
    role: 'Architektur, Verarbeitungskette, Kostensteuerung',
    year: 'seit 2026',
    highlight: 'Sechs Abnehmer auf einer Engine, alle Modellaufrufe lokal',
    stack: ['FastAPI', 'SQLite', 'Vektor-Embeddings', 'llama.cpp'],
    domain: 'AI',
    status: 'live',
    // Kein `href` seit dem 2026-10-30: news.saganta.de lief ueber den
    // saganta-Tunnel, der seit dem 21.10. keinen Dienst mehr traegt (404,
    // von aussen gemessen). Am 2026-10-17 war es noch 200.
  },
  {
    id: 'concierge',
    title: 'Privater Concierge',
    tagline: 'Ein Sprach- und Text-Assistent, der jede Anfrage zum passenden Modell routet, lokal, wo es reicht.',
    description: 'Ein lokal betriebener Sprach- und Text-Assistent, der jede Anfrage zur passenden Modell-Stufe schickt: ein kleines lokales Modell erledigt Alltag und Tagesbriefing, harte Aufgaben gehen gezielt an ein starkes Modell. Aktionen laufen über einen einzigen Tool-Bus mit Schema-Prüfung, Risk-Tier und Audit-Log. Einen Host-Reboot führt er nie ohne meine ausdrückliche Freigabe aus. Der Briefing-Pool bewertet Kandidaten nach Frische, Quelle und meinem Feedback und wirft die schwächsten wieder raus. Spracherkennung, Synthese und die Modelle laufen auf eigener Hardware.',
    role: 'Architektur, Routing-Regeln, Betrieb',
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
        labelEn: 'TTS gateway (speech output)',
        note: 'Ein Job-Bus mit Prioritäten vor einer einfädigen Sprach-Synthese: plant je Textabschnitt, begrenzt die Warteschlange, kennt Fristen und sagt ab, wenn eine Frist nicht zu halten ist.',
        noteEn: 'Priority job bus in front of a single-threaded TTS backend: chunk-level scheduling, bounded queue, deadlines and honest backpressure.',
      },
    ],
  },
  {
    id: 'defense-in-depth',
    title: 'Defense in Depth',
    tagline: 'Sicherheit steckt in jeder Schicht, von der Container-Härtung bis zum geprüften Restore.',
    description: 'Sicherheit in mehreren Schichten, dazu eine tägliche Prüfung, ob sie noch stehen. Container laufen ohne die Möglichkeit, sich mehr Rechte zu verschaffen, die meisten schreibgeschützt und ohne root. Kein Anwendungs-Container hängt direkt am Docker-Socket. Das Netz ist in Zonen geteilt, und ein Wächter meldet jeden Beitritt, der nicht freigegeben ist. Dienste ohne eigene Anmeldung stehen hinter SSO, am öffentlichen Rand liest ein IDS mit. Darunter liegt eine verschlüsselte Sicherung außer Haus, aus der jede Woche Stichproben zurückgeholt werden.',
    role: 'Sicherheits-Architektur, Härtung, Betrieb',
    year: 'seit 2025',
    highlight: 'Verteidigung über Container, Netz, Edge, Identität und Wiederanlauf',
    stack: ['SSO · OIDC', 'IDS', 'mTLS', 'Off-Site-Backup', 'Container-Härtung'],
    domain: 'Infra',
    status: 'live',
    repos: [
      {
        url: 'https://github.com/sami-djouhri/service-template',
        label: 'Service-Template (Härtungs-Baseline)',
        labelEn: 'Service template (hardening baseline)',
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
    id: 'modell-vermittlung',
    title: 'Modell-Vermittlung',
    tagline: 'Ein Endpunkt für alle KI-Aufrufe im Haus, mit Monatslimit pro Dienst.',
    description: 'Früher rief jeder Dienst sein Sprachmodell selbst auf. Inzwischen greifen alle Dienste über denselben Endpunkt auf die Modelle zu. Trotzdem bekommt jeder Dienst einen eigenen Schlüssel, erlaubte Modelle und ein Monatslimit. Limits und Modellauswahl muss ich dadurch nicht in jeder Anwendung separat implementieren. Der Endpunkt spricht beide gängigen Schnittstellen-Formate, sodass bestehende Dienste ohne Umbau darüber laufen. Fällt ein Modell aus oder ist es überlastet, schaltet die Vermittlung auf ein Ausweich-Modell um, lokal wie in der Cloud.',
    role: 'Architektur, Aufbau, Betrieb',
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
    role: 'Konzept, Aufbau, Betrieb',
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
        labelEn: 'Climate Push (Home Assistant integration)',
        note: 'Signierter Home-Assistant-Webhook (HMAC), der nur gewählte Klimawerte sendet. Kein Zugriffstoken verlässt das Haus.',
        noteEn: 'Signed Home Assistant webhook (HMAC) that only sends selected climate readings, no access token ever leaves the home.',
      },
    ],
  },
  {
    id: 'cms-baukasten',
    title: 'CMS-Baukasten',
    tagline: 'Ein eigenes, schlankes CMS als Grundlage für kleine Websites.',
    description:
      'Ein schwergewichtiges Fremd-CMS lohnt sich für eine kleine Seite selten, also liegt hier eine eigene Vorlage. Zwei Seiten laufen bereits damit und teilen sich dasselbe Abbild, eine davon öffentlich. Inhalte pflege ich über eine Oberfläche, die nur aus meinem eigenen Netz erreichbar ist; am öffentlichen Rand wird der Admin-Pfad abgewiesen, bevor die Anwendung ihn überhaupt sieht. Der öffentliche Teil wird statisch aus einem eigenen Datenspeicher ausgeliefert.',
    role: 'Konzept, Aufbau, Inhaltspflege, Betrieb',
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
    // Kein href: die Status-Seite war bis 2026-11-21 der öffentliche Beleg der
    // Edge-Zone und ist seitdem nicht mehr öffentlich (der Wächter alarmiert nur).
    repos: [
      {
        url: 'https://github.com/sami-djouhri/netcup-sentinel',
        label: 'Netcup-Sentinel (externer Wächter)',
        labelEn: 'Netcup Sentinel (external watcher)',
        note: 'Externer Wächter auf einem Off-Site-Server: Uptime-Monitoring mit Alarm, Backup-Verifikation und ein Dead-Man-Switch fürs Heimnetz.',
        noteEn: 'External watchdog on an off-site VPS: uptime monitoring with alerts, backup verification and a dead-man switch for the home lab.',
      },
    ],
  },
  {
    id: 'ressourcen-arbiter',
    title: 'Ressourcen-Arbiter',
    tagline: 'Erst ein knapper Knoten, der selbst entscheidet, wer laufen darf. Inzwischen ein Muster über den ganzen Verbund.',
    description:
      'Neun schwere Rollen teilen sich einen Wirt, dessen Arbeitsspeicher bei weitem nicht für alle reicht. Überbuchen wäre der bequeme Weg, überlässt aber im Ernstfall dem Kernel die Entscheidung, welcher Prozess stirbt. Also plant ein eigener Regler den Speicher. Die Rollen stehen als Einträge in einer Registrierdatei, er fragt jede laufende Rolle nach ihrer tatsächlichen Auslastung, entscheidet über jeden Start am gemessenen freien Platz und schaltet ab, was zwanzig Minuten leer läuft. Erzwungen verdrängt wird nie: ist es zu eng, weicht zuerst, was leer und ungeschützt ist, sonst kommt eine Absage im Klartext. Anfangs hing daran eine zweite, aufwendige Hälfte, die nur die Anschluss-Adresse verbergen sollte, ein Tunnel und eine Weiterleitungsregel je Rolle. Mit dem Umzug der Rollen auf einen eigenen Server fiel sie ersatzlos weg. Dasselbe Prinzip trägt inzwischen auch die gewöhnlichen Web-Dienste: 17 selten benutzte Anwendungen auf zwei Rechnern im Haus starten beim ersten Aufruf und schlafen nach einer halben Stunde ohne Zugriff wieder ein.',
    role: 'Konzept, Netz-Design, Aufbau, Betrieb',
    year: 'seit 2026',
    highlight: 'Neun schwere Rollen auf knappem Speicher, gestartet nach gemessenem Platz statt nach festem Slot, und wer gerade arbeitet, wird nicht verdrängt.',
    stack: ['Python', 'systemd', 'Docker', 'nginx', 'SSH-Tunnel', 'Paketfilter'],
    domain: 'Infra',
    status: 'live',
    repos: [
      {
        url: 'https://github.com/sami-djouhri/role-arbiter',
        label: 'Rollen-Arbiter (schwere Rollen)',
        labelEn: 'Role arbiter (heavy roles)',
        note: 'Regler für speicherknappe Wirte: entscheidet über jeden Start am gemessenen freien Platz, räumt belegte Rollen nie erzwungen, sichert den Zustand weichender Rollen und schaltet bei Leerlauf ab.',
        noteEn: 'Controller for memory-constrained hosts: decides every start against measured free memory, never evicts occupied roles by force, saves the state of roles that give way and switches off when idle.',
      },
      {
        url: 'https://github.com/sami-djouhri/wake-gateway',
        label: 'Wake-Gateway (Web-Dienste)',
        labelEn: 'Wake gateway (web services)',
        note: 'Selten genutzte Web-Dienste, die beim ersten Aufruf starten und bei Leerlauf wieder einschlafen. Ein nginx hält stellvertretend ihre Ports, eine kleine API startet und stoppt die Container.',
        noteEn: 'Rarely used web services that start on the first request and sleep again when idle. nginx holds their published ports; a small API starts and stops the containers.',
      },
    ],
  },
  // Aufgenommen am 2026-09-12. Der Bestand lief da schon ueber ein Jahr, stand
  // aber nirgends: das Portfolio kannte nur den Regler dahinter (ressourcen-arbiter),
  // nicht die Dienste, die er verwaltet. Fuer eine Bewerbung als Administrator ist
  // das der untypischste und zugleich staerkste Eintrag der Liste, weil hier zum
  // einzigen Mal FREMDE Menschen von der Verfuegbarkeit abhaengen und weil nichts
  // davon eigene Software ist. Reiner Betrieb, keine Zurechnungsfrage.
  {
    id: 'spielserver',
    title: 'Spielserver-Betrieb',
    tagline: 'Neun öffentliche Server für sieben Spiele und eine feste Gruppe, im Wechsel statt gleichzeitig.',
    description:
      'Neun Server für sieben Spiele stehen offen im Netz und werden von einer festen Gruppe genutzt. Das ist der einzige Teil meiner Infrastruktur, dessen Ausfall andere Leute merken. Jeder Server läuft auf einem gemieteten Wirt unter einem eigenen Dienstnutzer, Minecraft als einziger im Container, mit einer Firewall-Regel je Port, einer Ratenbegrenzung je Quelladresse noch vor der Firewall und Sperrlisten gegen Anmelde-Fluten. Der Speicher reicht nicht für alle gleichzeitig, also laufen sie auf Abruf: ein Platzhalter hält den schlafenden Server in der Serverliste sichtbar und weckt ihn beim Beitritt, nach zwanzig Minuten ohne Spieler geht er wieder schlafen. Wer gerade spielt, wird dabei nie verdrängt. Spielstände werden vor dem Herunterfahren gesichert und liegen doppelt off-site.',
    role: 'Aufbau, Härtung, Betrieb, Sicherung',
    year: 'seit 2026',
    highlight:
      'Neun öffentlich erreichbare Server auf einem Wirt mit 16 GB, die zusammen rund 24 GB bräuchten',
    stack: ['Linux', 'systemd', 'Paketfilter', 'Ratenbegrenzung', 'Off-Site-Backup'],
    domain: 'Infra',
    status: 'live',
    repos: [
      {
        url: 'https://github.com/sami-djouhri/game-dashboard',
        label: 'Spiel-Dashboard',
        labelEn: 'Game dashboard',
        note: 'Die Oberfläche vor dem Regler: sie zeigt, was läuft, was schläft, ob jemand darauf ist und wie viel Speicher der Wirt noch frei hat. Wer einen Server benutzt, weckt ihn hier selbst.',
        noteEn: 'The front end for the resource controller: it shows what is up, what is asleep, whether anyone is on it and how much memory the host has left. People who use a server wake it here themselves.',
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
  { title?: string; tagline: string; description: string; highlight: string; role: string }
> = {
  saganta: {
    tagline: 'Calendar, notes, mail and everyday apps under one login.',
    description:
      'My own suite with calendar, tasks, notes, mail and letters, a project deck and everyday apps from inventory to meal planning. They all run under one login, in the browser, on Android and as Linux programs. No app talks to a backend directly. In between, each area has a layer that checks the login and passes through only the fields that are allowed. The suite is private and only reachable inside my own network. It started as a family suite.',
    highlight: 'One login for browser, Android and Linux.',
    role: 'Architecture, build-out, ongoing expansion',
  },
  homelab: {
    tagline: 'Self-run services across several hosts, in continuous operation since 2024.',
    description:
      'Spread across several small computers, a virtualization cluster and two rented servers. Which service should run where is written in a single file. A check measures against it every 15 minutes and reports every service that is missing. Alerts travel over a shared event bus, and the alert path itself is tested. The backups are restored as a test every week.',
    highlight: 'Every service is listed in a version-controlled service map, and the live state is measured against it',
    role: 'Build, design, operations, on-call',
  },
  lernen: {
    tagline: 'One learning app for every area, from IT certification to driving licence.',
    description:
      'One learning app for several areas: IT certifications, vocational training, driving licence, school subjects. Until November 2026 these were six separate apps, each with its own database and account. Now there is one server, one database and one account; accounts and progress from the old apps are merged. The start page shows due reviews across all courses, mock exams draw their questions from per-topic pools. The app runs in the browser and on Android.',
    highlight: 'Six apps merged into one, without losing an account or a question',
    role: 'Concept, build-out, operations'
  },
  'homelab-app': {
    title: 'Tardis',
    tagline: 'Android app that starts and stops my homelab services, reachable only over my own VPN.',
    description:
      'A native Android companion that makes my homelab operable from the phone: host metrics at a glance, services to start, stop and restart with their logs, and an inbox to triage open items. The app only ever talks to a private gateway over my own VPN; pairing happens by scanning a QR code that generates a device-bound key in the Android KeyStore and exchanges it for a client certificate and mTLS, so the key never leaves the device. A public demo mode shows the app entirely without a gateway. The same controls exist in the internal web portal; both go through a proxy without container exec, and there is no host shell anywhere.',
    highlight: 'Container control and host metrics from the phone, device-bound mTLS pairing, access only over my own VPN',
    role: 'Concept, build-out, security model',
  },
  'homelab-sentinel': {
    tagline: 'An own alert path as on-call duty for the homelab.',
    description:
      'The homelab reports on its own when there is something to do. Alerts and scripts go through an own event bus. Rules set urgency and a quiet period, and delivery goes through ntfy to the phone. Interventions such as a container restart wait as an approval in Tardis. Until November 2026 this was a Discord bot.',
    highlight: 'Every message through a rule, every intervention only after approval',
    role: 'Concept, build-out, event wiring',
  },
  marktwatch: {
    tagline: 'Works bargains out from price distributions and flags only what holds up in the bad case too.',
    description:
      'Marktwatch scours classifieds and eBay for underpriced homelab hardware and pings me real bargains on Discord, without raising false alarms on bulk-discount tricks, variant mix-ups or bundles. The false-positive defense is deterministic: a rule filter separates out the known traps, behind it a shared gate that the real-time alert and the daily digest must equally pass. It reckons with price distributions. A recommendation only lands when even the worst-case scenario still leaves a profit (a 5% quantile and the expected shortfall below it), complete with the highest sensible bid. Everything irreversible stays behind a two-flag gate, with observation as the default.',
    highlight: 'Flags only when even the bad case still leaves a profit',
    role: 'Concept, data path, scoring rules, operations',
  },
  'wissens-foederation': {
    title: 'Knowledge Federation',
    tagline: 'One search API over several knowledge sources of my own. The frontend knows none of them.',
    description:
      // quellen-gate:geschichte (Rückbau, keine aktuelle Quellenzahl)
      'A single query searches several different self-run systems at once (documents, notes, reference archives, books, domain knowledge, course material, my own runbooks, and places and addresses), and the frontend knows none of them. I took four sources back out: inventory, market data, appointments and postal mail are application data, they belong in their application rather than in a knowledge index. Each source sits behind an adapter, the query fans out to all of them and comes back unified; aggregation happens deliberately at query time, so no crawler has to maintain a second source of truth. Where a source requires it, the search uses its own token for that source. Scattered island systems become one knowledge layer that other services address as a single backend, without knowing the sources behind it.',
    highlight: 'Different sources behind one search API, own token where the source requires one, operational data deliberately left out',
    role: 'Architecture, adapter design, operations',
  },
  'offline-wissen': {
    title: 'Offline Knowledge',
    tagline: 'Looking things up, the map and turn-by-turn routing all work with the uplink gone.',
    description:
      'A reference library, a map and route planning that live entirely at home and keep working when the uplink is gone. The library holds Wikipedia, technical books and course material in archive form. The map is a vector map built from open data, with aerial imagery and a satellite view as separate layers on top. Addresses down to house numbers and a good two million entries with a category sit in an index of its own, after the common off-the-shelf option turned out not to fit the hardware. A dedicated guest on the virtualization cluster computes the routes, another one the journeys by bus and rail. An app carries the map for all of Germany onto the phone. As a side effect, no provider gets to see what is being looked up here.',
    highlight: 'More than 19 million addresses in an index of its own, assembled in under 500 MB of memory',
    role: 'Concept, data pipeline, operations',
  },
  bibliothek: {
    title: 'Library',
    tagline: 'A reader of my own for the Calibre collection, in the browser and on the phone.',
    description:
      'The e-book collection sits at home as EPUB and PDF and is managed with Calibre. It is read in the browser, on the computer as well as on the phone, where it can be added to the home screen and behaves like an app. The reader that ships with calibre-web was not an option: it is an epub.js demo from 2015, book search and notes are commented out in its template, and without signing in the reading position lands on a shared guest account, where the next reader overwrites it. So a reader of my own sits in front of it, and foliate-js renders the books. It separates two things that used to be one: where the bookmark sits and what has actually been read. Paging through a book moves the bookmark, the progress stays where it is. Read-aloud works too, with speech synthesis running on my own hardware at home.',
    highlight: 'Reading works with calibre-web stopped, a book is there in 0.18 seconds.',
    role: 'Concept, architecture, operations',
  },
  'news-engine': {
    tagline: 'Clusters articles from many feeds into stories, running locally.',
    description:
      'A news engine that recognizes stories. Posts from many feeds are semantically clustered via my own embeddings, so reports on the same matter converge even across language borders, and are then condensed by source count, trend and source quality. Embedding, clustering and scoring run locally, and a local model in the house writes the texts. A cloud model is built in but switched off, and the call log has not shown a single call since mid-September.',
    highlight: 'Six consumers on one engine, every model call local',
    role: 'Architecture, processing chain, cost control',
  },
  concierge: {
    title: 'Private Concierge',
    tagline: 'My own voice and text assistant that routes each request to the right model, local where that is enough.',
    description:
      'A locally run voice and text assistant that routes each request to the right model tier: a small local model handles everyday tasks and the daily briefing without cloud cost, hard tasks go deliberately to a strong model. Actions run over a single tool bus with schema checking, a risk tier and an audit log. A host reboot is never executed without my explicit approval. An incremental briefing pool scores and evicts candidates by freshness, source and feedback; a knowledge layer picks the right knowledge space per question. Voice, knowledge and control stay on my own network.',
    highlight: 'Multi-tier routing between local and external model, risky actions only with approval',
    role: 'Architecture, routing rules, operations',
  },
  'defense-in-depth': {
    tagline: 'Security sits in every layer, from container hardening to a tested restore.',
    description:
      'Security in several layers, plus a daily check whether they are still standing. Containers run without the ability to gain further privileges, most of them read-only and without root. No application container is attached to the Docker socket directly. The network is split into zones, and a watcher reports every join that is not approved. Services without their own login sit behind SSO, and an IDS reads along at the public edge. Underneath lies an encrypted off-site backup, from which samples are restored every week.',
    highlight: 'Defense across container, network, edge, identity and recovery',
    role: 'Security architecture, hardening, operations',
  },
  gartiko: {
    tagline: 'A public plant-care app with community connection, live on its own domain.',
    description:
      'A public care portal for plants of every kind: track inventories, follow care phases, reminders and knowledge in one place, live on its own domain on my own infrastructure. The portal shares its base with a community bot, so knowledge curation and web interface draw from the same source and nothing has to be maintained twice. The admin area is cut off hard at the public edge and reachable only from my own network, and the public part stays lean and fast.',
    highlight: 'Publicly reachable on its own domain, admin path cut off at the edge',
    role: 'Concept, build-out, operations',
  },
  'cms-baukasten': {
    title: 'CMS Toolkit',
    tagline: 'My own lean CMS as a reusable base for small sites.',
    description:
      'My own deliberately lean CMS as a template for small sites. A heavyweight third-party CMS rarely pays off for a small site. Two of my own sites already run on it and share the same image, one of them public. Content is maintained through an interface reachable only from my own network (at the public edge the admin path is rejected hard), while the public part is served fast and static from its own data store. A new site is essentially a configuration question.',
    highlight: 'My own CMS as a template: admin only on my own network, public part static.',
    role: 'Concept, build-out, content upkeep, operations',
  },
  'edge-hosting': {
    title: 'Public Edge Hosting',
    tagline: 'A public server as a deliberately separate zone next to the home cluster.',
    description:
      'Not everything belongs in the home network: for publicly reachable sites and mail there is a dedicated server at the network edge, deliberately set up as a separate zone so an exposed service never sits in the same segment as the private infrastructure. A TLS reverse proxy terminates the domains and passes only locally to hardened, read-only containers. My own mail server handles sending and receiving for my own domains. Several sites share the same uniformly secured base.',
    highlight: 'Exposed services in a separate edge zone, with my own mail server.',
    role: 'Architecture, provisioning, hardening, operations',
  },
  'ressourcen-arbiter': {
    title: 'Resource Arbiter',
    tagline: 'First a tight node deciding for itself which role gets to run. By now a pattern across the whole fleet.',
    description:
      'Nine heavy roles share a host whose memory is nowhere near enough for all of them. Overcommitting would be the comfortable route, but it hands the kernel the decision about which process dies. So a controller of my own schedules the memory. The roles live as entries in a registry file, it asks every running role for its actual occupancy, decides each start against measured headroom, and switches off whatever has been idle for twenty minutes. Nothing is ever evicted by force: when it gets tight, what is empty and unprotected gives way first, otherwise the answer is a plain refusal. Early on there was a second, elaborate half whose only job was to hide the home address, a tunnel and a forwarding rule per role. When the roles moved to a dedicated server, it fell away with nothing put in its place. The same principle now carries the ordinary web services too: 17 rarely used applications on two machines at home start on the first request and go back to sleep after half an hour without access.',
    highlight: 'Nine heavy roles on tight memory, started against measured headroom rather than a fixed slot, and whoever is working does not get evicted.',
    role: 'Concept, network design, build-out, operations',
  },
  'modell-vermittlung': {
    title: 'Model Gateway',
    tagline: 'One gateway for every AI call in the house, with budget, switching and honest cost accounting.',
    description:
      'Each service used to call its own language model. These days everything runs through a central gateway: a single endpoint that speaks both common interface formats, so existing services route through it without a rewrite. Every consumer gets its own key with its own monthly budget as a runaway guard, plus a model allow-list. Under overload or outage the gateway switches to a fallback model, local or cloud. That gives one cost picture instead of scattered billing, a cap per service, and a documented path for when one side drops out. The gateway is deliberately kept thin.',
    highlight: 'A budget-capped gateway for every AI call, cloud and local, with a fallback path.',
    role: 'Architecture, build-out, operations',
  },
  finanzen: {
    title: 'Finances',
    tagline: 'Accounts, budgets and a portfolio in one place, with a forecast of how long the money lasts.',
    description:
      'A service of my own for household money. It keeps accounts and transactions, contracts with notice periods, loans, budgets, savings goals and a portfolio. The main question is how long the money lasts if everything carries on as it is. For that it calculates a forecast over years as a range from three calculations, and a calculation over decades in today’s money. Every amount is a whole number of cents, and every recurring date is calculated from its start date. Transactions come in through standing orders, as a CSV file or by hand; there is deliberately no connection to the bank. The service is only reachable inside my own network and sits behind a login.',
    highlight: 'Every amount a whole number of cents, and where a number is missing, the reason stands there instead of a zero.',
    role: 'Concept, architecture, operations',
  },
  spielserver: {
    title: 'Game Server Operations',
    tagline: 'Nine public servers for seven games and a fixed group, in rotation rather than all at once.',
    description:
      'Nine servers for seven games sit openly on the net and are used by a fixed group. This is the one part of my infrastructure whose downtime other people notice. Each server runs on a rented host under its own service user, Minecraft as the only one in a container, with one firewall rule per port, a per-source rate limit that bites before the firewall does, and ban lists against login floods. Memory is not enough for all of them at once, so they run on demand: a stand-in keeps the sleeping server visible in the server list and wakes it on join, and after twenty minutes without players it goes back to sleep. Nobody currently playing is ever evicted for it. Saves are written before shutdown and kept off-site twice over.',
    highlight: 'Nine publicly reachable servers on one 16 GB host that would need around 24 GB together',
    role: 'Build-out, hardening, operations, backups',
  },
};

for (const p of PROJECTS) {
  const en = PROJECTS_TEXT_EN[p.id];
  if (en) {
    if (en.title) p.titleEn = en.title;
    p.taglineEn = en.tagline;
    p.descriptionEn = en.description;
    p.highlightEn = en.highlight;
    p.roleEn = en.role;
  }
}

/**
 * Eine Arbeit über ihre Routen-Kennung. Ersetzt seit dem 2026-10-26 das
 * `getProject` aus dem abgeräumten CMS-Speicher.
 *
 * Bewusst synchron. Die Vorgängerin war `async`, weil sie eine Datei im
 * Volume las, und jede der sechs Aufrufstellen trug ein `await` auf eine
 * Abfrage, die gar keine war. Danach ist diese Datei die einzige Quelle, und
 * eine synchrone Signatur sagt das: es gibt nichts mehr zu laden, was
 * fehlschlagen könnte.
 */
export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}


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

/**
 * ⚠️ GEPARKT seit 2026-10-15, nichts rendert diese Liste mehr.
 *
 * Die Seite „Aktueller Fokus" ist entfallen (Entscheid 06.10.: veraltet
 * still). Die sechs Punkte bleiben hier stehen, weil sie im nächsten Schritt
 * verteilt werden: die vier mit `projectId` werden zum Steckbrief-Feld „Als
 * Nächstes" ihres Projekts, die übrigen drei (Verteilung auf den x86-Cluster,
 * Wiederanlauf üben, begründende Automatiken) wandern in die
 * Infrastruktur-Fallstudie. Danach fällt die Liste samt `FocusItem`,
 * `CURRENT_FOCUS_EN` und `getFocus`. Gleiche Lage wie `lib/notes.ts`.
 */
export const CURRENT_FOCUS: FocusItem[] = [
  {
    title: 'Dienste laufen lassen, wenn sie gebraucht werden',
    status: 'aktiv',
    description:
      'Ein Wirt trägt neun schwere, selten gleichzeitig gebrauchte Rollen, aber nicht genug Arbeitsspeicher für alle. Ein Regler entscheidet am gemessenen freien Speicher, wer starten darf: reicht er, weicht niemand, sonst weichen zuerst die leeren Rollen, die am längsten ungenutzt sind, sauber mit Zustandssicherung. Wer eine Rolle gerade benutzt, wird nie verdrängt; reicht der Speicher trotzdem nicht, kommt eine Absage im Klartext statt eines Abschusses. Ungenutzte Rollen schalten sich nach zwanzig Minuten Leerlauf selbst ab. Dasselbe gilt inzwischen für gewöhnliche Web-Dienste: 17 selten benutzte Anwendungen starten beim ersten Aufruf und schlafen danach wieder ein. Als Nächstes will ich wissen, welche Dienste diese Behandlung noch verdienen, ohne dass jemand es merkt.',
    projectId: 'ressourcen-arbiter',
  },
  {
    title: 'Offline nachschlagen und navigieren',
    status: 'aktiv',
    description:
      'Nachschlagewerk, Karte, Adress-Suche und Routenplanung liegen vollständig im Haus. Der Adress-Index war der interessante Teil: die verbreitete Standardlösung verlangt hundert Gigabyte Datenbank und mehr Arbeitsspeicher, als der Rechner hat, also liegt hier ein eigener Index, der auf genau eine Frage zugeschnitten ist. Offen ist, die Adress-Suche direkt an die Routenplanung zu hängen.',
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
  },
  {
    title: 'Den Wiederanlauf üben, nicht nur einrichten',
    status: 'aktiv',
    description:
      'Die Off-Site-Sicherung deckt inzwischen jeden Host ab, inklusive des Arbeitsrechners und des verschlüsselten Bündels mit den Zugangsdaten, und eine tägliche Vollständigkeits-Prüfung meldet jede Lücke von selbst. Zur vierteljährlichen Byte-Probe ist eine monatliche auf Dienst-Ebene gekommen: die Datenbank fährt aus der Sicherung in einem Wegwerf-Container hoch, und ihr Schema wird gegen die laufende Instanz gehalten. Als Nächstes will ich kontrollierte Ausfälle auslösen und zusehen, ob das System sie abfängt oder nur meldet.',
  },
  {
    title: 'Automatiken sollen sagen, warum sie handeln',
    status: 'als-nächstes',
    description:
      'Jede automatische Aktion im Haus soll eine Spur hinterlassen: was sie ausgelöst hat, wie sicher sie sich war, warum sie so entschieden hat. Im Moment handeln die Automatiken stillschweigend, und genau das stört mich daran. Die Bausteine sind gebaut und getestet; der Anschluss an den laufenden Melde-Pfad steht noch aus, weil er einen Umbau nah an den sicherheitskritischen Diensten bedeutet.',
  },
];

/** Sprachunabhängiger Schlüssel je Disziplin. Trägt das Icon. */
export type StackKey = 'infra' | 'backend' | 'frontend' | 'ai';

export interface StackCategory {
  /** Stabil über Sprachen hinweg. `label` wird übersetzt und taugt NICHT als
   *  Schlüssel, ein Icon-Mapping über den Label-String bräche auf /en still. */
  key: StackKey;
  label: string;
  items: string[];
}

// Admin-first: Infra & Ops zuerst, passend zur Junior-IT-Admin-Positionierung
// und deckungsgleich mit den CV-Skills. Entwicklung folgt, bleibt aber ehrlich sichtbar.
export const STACK: StackCategory[] = [
  {
    key: 'infra',
    label: 'Infra & Ops',
    items: ['Proxmox · LXC · KVM', 'Docker Compose', 'systemd · Units & Timer', 'nginx · Caddy · cloudflared', 'VPN', 'Paketfilter', 'better-auth · SSO', 'Backup & Restore', 'Prometheus · Grafana', 'Mailserver', 'Windows Server · Active Directory'],
  },
  {
    key: 'backend',
    label: 'Backend',
    items: ['Python · FastAPI', 'Node · TypeScript', 'PHP', 'PostgreSQL · SQLite', 'asyncio'],
  },
  {
    key: 'frontend',
    label: 'Frontend',
    items: ['SvelteKit', 'Next.js · App Router', 'Tailwind', 'React', 'Compose Multiplatform'],
  },
  {
    key: 'ai',
    label: 'AI / Daten',
    items: ['Claude · API & Vision', 'llama.cpp · BGE-M3', 'YOLOv5 · Edge-Vision', 'RAG · Eval-Harness'],
  },
];

// Die vier Grundsätze (PRINCIPLES) sind am 2026-11-21 mit /uber-mich entfallen
// (Entscheid aus dem Interview vom 09.11.).

// ─── Englische Varianten der Code-Konstanten + Locale-Getter ────────────────────



const CURRENT_FOCUS_EN: FocusItem[] = [
  {
    title: 'Running services when they are actually wanted',
    status: 'aktiv',
    description:
      'One host carries nine heavy roles that are rarely needed at the same time, but not enough memory for all of them. A controller decides by measured free memory who gets to start: if there is enough, nobody has to yield, otherwise the empty roles that have been unused longest yield first, cleanly and with their state saved. Anyone actually using a role is never evicted; if memory still falls short, the answer is a plain refusal rather than a kill. Idle roles switch themselves off after twenty minutes. The same now applies to ordinary web services: 17 rarely used applications start on the first request and go back to sleep afterwards. Next I want to know which further services deserve the same treatment without anyone noticing.',
    projectId: 'ressourcen-arbiter',
  },
  {
    title: 'Looking things up and navigating offline',
    status: 'aktiv',
    description:
      'Reference library, map, address lookup and route planning all live at home. The address index was the interesting part: the common off-the-shelf option wants a hundred gigabytes of database and more memory than the machine has, so there is an index of its own, cut to exactly one question. Still open is wiring address lookup straight into route planning.',
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
  },
  {
    title: 'Making recovery antifragile',
    status: 'aktiv',
    description:
      'Off-site backup now covers every host, including my workstation and the encrypted bundle holding the credentials, and a daily completeness check reports any gap on its own. Alongside the quarterly byte-level drill there is now a monthly one at service level: the database boots from the backup in a throwaway container and its schema is held against the live instance. Next come controlled failure exercises, so the system absorbs disruptions on its own and does not merely report them.',
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

/** Stack-Kategorien; Rubrik-Labels und die deutschen Begriffe werden übersetzt, die Tech-Namen bleiben. */
export function getStack(locale: Locale): StackCategory[] {
  if (locale !== 'en') return STACK;
  return STACK.map((c) => ({
    ...c,
    label: STACK_LABEL_EN[c.label] ?? c.label,
    items: c.items.map((i) => localizedStackItem(i, locale)),
  }));
}

