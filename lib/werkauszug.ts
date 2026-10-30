/**
 * Je Arbeit ein Satz, der sagt, worum es geht.
 *
 * ## Warum die Saetze hier stehen und nicht abgeleitet werden
 *
 * Der naheliegende Weg waere, den ersten Satz aus `problem` der Fallstudie zu
 * ziehen. Am 2026-10-17 gegen den Bestand gemessen, und dreimal daneben:
 *
 * 1. **Die Laenge laeuft auseinander, und zwar je Sprache verschieden.**
 *    Gemessen schwanken die ersten Saetze zwischen 53 und 283 Zeichen. Dabei
 *    ist nicht dieselbe Arbeit in beiden Sprachen lang: `marktwatch` hat auf
 *    Deutsch 93 Zeichen und auf Englisch 225, `postfach` 53 gegen 253. Eine
 *    Zelle, die auf Deutsch passt, laeuft auf Englisch ueber.
 * 2. **Eine Fallstudie fehlt auf Englisch.** `bibliothek` hat keinen
 *    englischen Eintrag, und `getProjectDetail` faellt dort auf Deutsch
 *    zurueck. Ein abgeleiteter Auszug haette also stillschweigend einen
 *    deutschen Satz auf `/en` gesetzt, ohne Fehler und ohne Spur.
 * 3. **Eine Arbeit hat gar keine Fallstudie.** `spielserver` ist die einzige
 *    der 25 ohne, ihre Zelle waere leer geblieben.
 *
 * Dieselbe Lehre wie bei `lib/werkgroessen.ts` einen Tag zuvor: eine Regel
 * auf freier Prosa sieht aus wie eine Messung und ist keine.
 *
 * ## Die Regeln, nach denen die Saetze geschrieben sind
 *
 * - **Der Satz nennt die Ausgangslage, nicht das Ergebnis.** Was gebaut
 *   wurde, steht in der Fallstudie. Die Zelle sagt, warum es gebaut wurde.
 * - **Hoechstens 165 Zeichen.** Der Satz sitzt an der Stelle, an der eine
 *   andere Zelle ihr Bildschirmfoto hat, und diese Flaeche ist am Telefon
 *   rund 150 px breit. Die Pruefung haelt die Grenze.
 * - **Nuechtern, Gegenwart, ein Gedanke.** Keine Dreier-Aufzaehlung nach
 *   Doppelpunkt, kein pointierter Schlusssatz (Textstil-Regel in die Projektregeln).
 * - **Beide Sprachen gleichwertig**, Entscheid vom 2026-10-15 und am
 *   2026-10-17 bestaetigt.
 *
 * Gate: `scripts/werkauszug-pruefen.mjs`, haengt in `scripts/gates.sh` als 1g. Es
 * laeuft ueber die **Arbeiten** und sieht nach, ob diese Tabelle sie kennt,
 * nicht umgekehrt.
 */

import type { Locale } from './i18n/config';

export interface Werkauszug {
  de: string;
  en: string;
}

/**
 * Obergrenze in Zeichen. Steht hier und nicht im Pruefer, damit Regel und
 * Daten an derselben Stelle liegen.
 */
export const AUSZUG_MAX = 165;

export const WERKAUSZUEGE: Record<string, Werkauszug> = {
  saganta: {
    de: 'Meine Werkzeuge lagen bei fünf verschiedenen Anbietern.',
    en: 'My tools lived with five different providers.',
  },
  homelab: {
    de: 'In einem Heimlabor sammeln sich dreißig Container an, jeder mit eigener Compose-Datei und ohne gemeinsame Liste.',
    en: 'A home lab grows to thirty containers, each with its own compose file and no shared map.',
  },
  lernen: {
    de: 'Lernplattformen am Markt sind generisch, entweder schwere Lern-Systeme oder Karteikarten-Apps.',
    en: 'Learning platforms on the market are generic, either heavyweight systems or flashcard apps.',
  },
  marktwatch: {
    de: 'Der Bot durchsucht Kleinanzeigen und eBay nach Hardware unter Wert. Fehlalarme waren das eigentliche Problem.',
    en: 'The watcher scans classifieds and eBay for hardware below value. False alarms were the real problem.',
  },
  'wissens-foederation': {
    de: 'Mein Wissen liegt über viele Dienste verstreut, von Dokumenten im Archiv bis zu Büchern im Regal.',
    en: 'My knowledge sits scattered across many services, from documents in an archive to books on a shelf.',
  },
  'offline-wissen': {
    de: 'Karte, Nachschlagewerk und Routenplanung braucht man genau dann, wenn die Leitung weg ist.',
    en: 'A map, a reference work and route planning are what you need the moment the line goes down.',
  },
  bibliothek: {
    // Die einzige Arbeit ohne englische Fallstudie. Haette man den Satz
    // abgeleitet, stuende hier auf /en deutscher Text.
    de: 'Der Leser von calibre-web ist eine Vorlage von 2015, und ein Lesestand ohne Anmeldung landet auf einem geteilten Konto.',
    en: 'The reader in calibre-web is a 2015 template, and reading progress without a login lands on a shared account.',
  },
  postfach: {
    de: 'Briefe stapeln sich, und man findet sie nicht wieder.',
    en: 'Letters pile up, and you cannot find them again.',
  },
  'news-engine': {
    de: 'Wer mehrere Nachrichtenquellen ernst nimmt, ertrinkt in Dubletten.',
    en: 'Take several news sources seriously and you drown in duplicates.',
  },
  concierge: {
    de: 'Ein fertiger Assistent schickt jede Anfrage in die Cloud, auch die belanglose.',
    en: 'An off-the-shelf assistant sends every request to the cloud, including the trivial ones.',
  },
  'defense-in-depth': {
    de: 'Eine selbst betriebene Infrastruktur ist nur so sicher wie ihre schwächste Schicht.',
    en: 'A self-operated infrastructure is only as secure as its weakest layer.',
  },
  'ops-cockpit': {
    de: 'Eine wachsende Flotte aus mehreren Wirten steuert man irgendwann nicht mehr über einzelne Anmeldungen.',
    en: 'A growing fleet of several hosts eventually outgrows logging into each one.',
  },
  gartiko: {
    de: 'Pflanzen-Pflege-Wissen lebte verstreut, im Community-Bot, in Notizen und in Köpfen.',
    en: 'Plant-care knowledge lived scattered, in a community bot, in notes and in people’s heads.',
  },
  'home-digital-twin': {
    de: 'Home Assistant hat eine starke Datenbasis, aber sein Frontend bleibt eine endlose Karten-Wand.',
    en: 'Home Assistant holds a strong data base, but the frontend it ships stays an endless wall of cards.',
  },
  'homelab-app': {
    de: 'Ein Homelab im Dauerbetrieb will bedient werden, auch wenn ich nicht am Rechner sitze.',
    en: 'A homelab running around the clock wants to be operated even when I am not at the desk.',
  },
  'homelab-sentinel': {
    de: 'Ein Homelab im Dauerbetrieb braucht eine Bereitschaft, und das bin ausschließlich ich.',
    en: 'A home lab running around the clock needs an on-call person, and that is me alone.',
  },
  'ai-vision': {
    de: 'Edge-Hardware der ersten Generation ist eigensinnig, mit knappem Speicher und alter Werkzeugkette.',
    en: 'First-generation edge hardware is stubborn, with tight memory and an old toolchain.',
  },
  rackforge: {
    de: 'Für einen Shop mit 3D-gedruckten Teilen passt kein Standard-System, weil dieselbe Form in vielen Farben existiert.',
    en: 'No standard shop system fits a 3D-printing shop, because the same shape comes in many colors.',
  },
  'cms-baukasten': {
    de: 'Kleine Websites brauchen ein Content-Management, aber ein schweres Fremd-CMS ist dafür überdimensioniert.',
    en: 'Small websites need content management, but a heavyweight third-party CMS is oversized for them.',
  },
  'edge-hosting': {
    de: 'Öffentlich erreichbare Dienste und das eigene Heimnetz gehören nicht in dasselbe Netzsegment.',
    en: 'Publicly reachable services and a private home network do not belong in the same segment.',
  },
  'modell-vermittlung': {
    de: 'Jeder Dienst trug seinen eigenen Schlüssel und sein fest verdrahtetes Modell, und niemand hatte ein Kostenbild.',
    en: 'Each service carried its own key and its own hard-wired model, and nobody had a cost picture.',
  },
  'windows-ad-lab': {
    de: 'Linux betreibe ich täglich. Windows Server und Active Directory kannte ich aus der Theorie.',
    en: 'I run Linux every day. Windows Server and Active Directory I knew mostly from theory.',
  },
  'media-vault': {
    de: 'Eine Medien-Bibliothek liegt normalerweise entschlüsselt auf der Platte, rund um die Uhr.',
    en: 'A media library normally sits decrypted on disk, around the clock.',
  },
  'ressourcen-arbiter': {
    // Neun, nicht sieben. Am 2026-10-17 an der Registrierdatei des Reglers
    // nachgezaehlt. Der Fliesstext der Seite sagte an sieben Stellen „sieben"
    // und stammt aus der Zeit, als es sieben waren.
    de: 'Ein Knoten soll neun schwere Rollen tragen, deren Speicherbedarf zusammen nicht hineinpasst.',
    en: 'One node is meant to carry nine heavy roles whose memory does not fit together.',
  },
  spielserver: {
    // Die einzige Arbeit ohne Fallstudie. Ohne diese Tabelle bliebe ihre
    // Zelle leer.
    de: 'Sieben Spiele auf neun Servern, und als einziger Teil meiner Anlage stört ihr Ausfall andere Leute.',
    en: 'Seven games on nine servers, and the only part of my setup whose downtime bothers other people.',
  },
};

/** Der Satz zur Arbeit in der gewaehlten Sprache, oder `null`. */
export function getWerkauszug(id: string, locale: Locale): string | null {
  const a = WERKAUSZUEGE[id];
  if (!a) return null;
  return locale === 'en' ? a.en : a.de;
}
