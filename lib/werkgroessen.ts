/**
 * Je Arbeit eine Groesse, gemessen statt geschaetzt.
 *
 * ## Warum diese Datei existiert
 *
 * Das Werkfeld des Entwurfs zog seine Zahl bis zum 2026-10-17 aus
 * `metrics[0]` der Fallstudie, also aus einem freien Text mit einer
 * Regel davor („nimm den ersten Wert mit fuehrender Ziffer"). Gemessen
 * hatte das drei Folgen, alle drei am Bild sichtbar:
 *
 * 1. **12 von 25 Zellen trugen gar keine Zahl** und behalfen sich mit dem
 *    Satz zur Sache. Ein Katalog, dessen Haelfte keine Groesse nennt, ist
 *    halb Prosa.
 * 2. **Drei Zellen fuehrten mit Zeilen Code** (`9.600 Zeilen`,
 *    `13.800 Zeilen`, und bei der Suite stand es im Resttext). Zeilen Code
 *    sind messbar und trotzdem die falsche Zahl: sie betonen
 *    Schreibleistung, und das soll die Seite nicht sagen.
 * 3. **Ausgeschriebene Zahlen waren unsichtbar.** Beim Regler stand
 *    „sieben, dazu ein Windows-Lab", die Regel sucht aber eine Ziffer.
 *    Dieselbe Zeile war zugleich veraltet: gemessen sind es neun.
 *
 * Die Zahl steht deshalb jetzt hier, nicht in einem Fliesstext, und jede
 * traegt mit, **wann** und **wie** sie gemessen wurde. Wer sie nachpruefen
 * will, findet den Weg daneben.
 *
 * ## Zwei Regeln, die beim Befuellen galten
 *
 * - **Die Zahl muss eine Menge sein, die die Arbeit selbst fuehrt**
 *   (Raeume, Quellen, Modelle, Buecher, Spiele, Bereiche). Keine
 *   Hilfsgroesse von aussen, keine Schaetzung, keine Zeilen Code.
 * - **Lieber keine Zahl als eine erfundene.** `OHNE_GROESSE` fuehrt die
 *   Arbeiten, die bewusst keine bekommen, mit Begruendung. Eine Zelle ohne
 *   Zahl ist dann ein Ergebnis und kein Loch.
 *
 * ## ⚠️ `einheit_de` ist sichtbarer deutscher Text, nicht Doku
 *
 * Die Datei war in der ASCII-Umschrift geschrieben, in der die Kommentare
 * dieses Hauses stehen (`ueber`, `waere`, `Raeume`). Bei `wie` und in den
 * Kommentaren ist das folgenlos, bei `einheit_de` nicht: am 2026-10-18 stand
 * am laufenden Dienst „Raeume auf einer Datenschicht", „Buecher im Regal" und
 * „jede Woche zurueckgespielt" unter den Zahlen. Auf einer deutschen
 * Bewerberseite liest sich das wie ein Zeichensatzfehler. Fuenf Stellen
 * korrigiert. **Wer hier eine Einheit ergaenzt, schreibt sie mit Umlauten**,
 * auch wenn die Kommentare daneben ohne auskommen.
 *
 * ## Warum als eigenes Modul und nicht als Feld am Projekt
 *
 * Die Projektdaten der Startseite kommen aus dem CMS-Speicher im Volume,
 * der nur bei fehlender Datei neu aus `lib/projects.ts` aufgebaut wird. Ein
 * neues Feld dort erreicht die laufende Seite erst nach einem Neuaufbau des
 * Speichers, und zwar lautlos: Build gruen, Deploy gruen, Seite alt. Ein
 * eigenes Modul, das ueber die `id` zugeordnet wird, umgeht das.
 */

import type { Locale } from './i18n/config';

export interface Werkgroesse {
  /**
   * Die Zahl als Zeichenkette, nicht als `number`: `0,13 s` und `19,3 Mio.`
   * sollen genau so dastehen, wie sie gemessen wurden. Eine Umrechnung im
   * Browser waere eine zweite Stelle, an der sich die Darstellung aendern
   * kann.
   */
  zahl: string;
  /**
   * Dieselbe Zahl in englischer Schreibweise, nur wo sie sich unterscheidet.
   *
   * Gemessen an der laufenden englischen Fassung: dort stand „19,3 Mio."
   * und „1.278". Im Englischen trennt der Punkt die Nachkommastelle und das
   * Komma die Tausender, die Zahl sagt dort also etwas anderes, als sie
   * meint. `1.278` liest ein englischer Leser als eins Komma drei.
   * Die Pruefung unten besteht darauf, sobald `zahl` ein Trennzeichen oder
   * eine deutsche Abkuerzung traegt.
   */
  zahl_en?: string;
  /**
   * Wovon. Steht klein unter oder neben der Schaugroesse.
   *
   * Zwei flache Felder statt eines verschachtelten Objekts, und zwar wegen
   * des Stilpruefers: der liest sichtbaren Text an seinem Feldnamen. Ein
   * `einheit: { de, en }` haette ihn gezwungen, auf `de:` und `en:` zu passen,
   * und solche Namen stehen in anderen Dateien in ganz anderer Bedeutung.
   * Diese beiden Namen sind eindeutig und damit pruefbar.
   */
  einheit_de: string;
  einheit_en: string;
  /** Tag der Messung (ISO). Steht nicht auf der Seite, sondern belegt sie. */
  gemessen: string;
  /** Wie gemessen. Bewusst ohne interne Namen, die Datei geht nach draussen. */
  wie: string;
}

/**
 * Alle Messungen vom 2026-10-17, ausser wo anders vermerkt. Gemessen wurde
 * gegen die laufenden Dienste und die Quellbaeume, nicht gegen Doku: in zwei
 * Faellen lag die Doku daneben (siehe `offline-wissen` und
 * `ressourcen-arbiter`).
 */
export const WERKGROESSEN: Record<string, Werkgroesse> = {
  saganta: {
    zahl: '12',
    einheit_de: 'Apps unter einer Anmeldung',
    einheit_en: 'apps behind one login',
    gemessen: '2026-10-17',
    wie: 'Anwendungsverzeichnisse im Quellbaum gezaehlt; die Compose-Datei fuehrt dazu 23 Dienste.', // zahlen-gate:fremd
  },
  homelab: {
    // Bewusst NICHT die Dienstzahl: sie steht seit dem 2026-10-30 nirgends mehr
    // auf der Seite (Begruendung in lib/proof.ts). Die Rueckspielprobe ist die Zahl, die zur gesuchten Rolle passt:
    // nicht „wie viel laeuft", sondern „wie viel ist nachweislich
    // wiederherstellbar".
    zahl: '10',
    einheit_de: 'Wirte, jede Woche zurückgespielt',
    einheit_en: 'hosts, restored weekly',
    gemessen: '2026-10-17',
    wie: 'Soll-Liste der woechentlichen Rueckspielprobe, gezaehlt.',
  },
  lernen: {
    zahl: '6',
    einheit_de: 'Lern-Apps auf einem Kern',
    einheit_en: 'learning apps on one core',
    gemessen: '2026-10-17',
    wie: 'Fach-Repositories neben dem geteilten Kern gezaehlt.',
  },
  'home-digital-twin': {
    zahl: '7',
    einheit_de: 'Räume auf einer Datenschicht',
    einheit_en: 'rooms on one data layer',
    gemessen: '2026-10-17',
    wie: 'Datenbank des Dienstes: 7 Raeume, 22 Geraete, 44.272 gespeicherte Zustaende.',
  },
  'homelab-app': {
    // Eine App fuehrt keine Menge, deshalb zaehlt hier, was sie sicher macht.
    // Das ist die Aussage der Arbeit: eine Fernbedienung, die Dienste stoppen
    // kann, darf nicht an einem einzigen Riegel haengen.
    zahl: '3',
    einheit_de: 'Schranken vor jedem Eingriff',
    einheit_en: 'gates before any action',
    gemessen: '2026-10-17',
    wie: 'Im Quelltext nachgesehen: nur ueber das eigene VPN erreichbar, Geraete-Paarung mit beidseitigem Zertifikat, Bestaetigung am Geraet vor der Aktion.',
  },
  'homelab-sentinel': {
    zahl: '12',
    einheit_de: 'Module im Dienst',
    einheit_en: 'modules in production',
    gemessen: '2026-10-17',
    wie: 'Modulverzeichnis des Bots gezaehlt, ohne die Sammeldatei.',
  },
  marktwatch: {
    zahl: '14',
    einheit_de: 'Fehlerbilder hinterlegt',
    einheit_en: 'fault patterns on file',
    gemessen: '2026-10-17',
    wie: 'Zwei Tabellen im Quelltext (Fehlerprofile und Grundkosten), beide 14 Eintraege, Schluessel deckungsgleich.',
  },
  'ai-vision': {
    zahl: '0,13 s',
    zahl_en: '0.13 s',
    einheit_de: 'je Bild auf der Edge-GPU',
    einheit_en: 'per image on the edge GPU',
    gemessen: '2026-10-17',
    wie: 'Sechs Laeufe gegen den laufenden Dienst, Median ohne den ersten (der laedt das Modell): 145 ms, warm 129 ms, inklusive Uebertragung.',
  },
  'wissens-foederation': {
    zahl: '7',
    einheit_de: 'Quellen hinter einer Suche',
    einheit_en: 'sources behind one search',
    gemessen: '2026-10-17',
    wie: 'Quellenliste des laufenden Dienstes abgefragt.',
  },
  'offline-wissen': {
    // Hier lag die Fallstudie daneben: sie sagte „20 Mio. mit Hausnummer".
    // Gemessen sind es 19.274.091 Hausnummern; die 20 Mio. entstehen erst,
    // wenn man die 1.031.036 Strassen dazuzaehlt. Nach unten korrigiert, nach
    // der Hausregel „im Zweifel untertreiben".
    zahl: '19,3 Mio.',
    zahl_en: '19.3 M',
    einheit_de: 'Adressen mit Hausnummer',
    einheit_en: 'addresses with house number',
    gemessen: '2026-10-17',
    wie: 'Zeilen der Hausnummern-Tabelle gezaehlt: 19.274.091, dazu 1.031.036 Strassen und 16.392 Orte.',
  },
  bibliothek: {
    zahl: '1.278',
    zahl_en: '1,278',
    einheit_de: 'Bücher im Regal',
    einheit_en: 'books on the shelf',
    gemessen: '2026-10-17',
    wie: 'Gesundheitsabfrage des laufenden Dienstes, Feld „aktive Ausgaben".',
  },
  postfach: {
    // Loest die Zeilen Code ab, die hier vorher die Schaugroesse waren.
    zahl: '5',
    einheit_de: 'Stationen vom Foto zum Datensatz',
    einheit_en: 'stations from photo to record',
    gemessen: '2026-10-17',
    wie: 'Im Quelltext nachgezaehlt: Entzerren, Texterkennung, Auswertung, Bedeutungs-Index, Fristen in den Kalender.',
  },
  'news-engine': {
    // Ebenfalls statt Zeilen Code.
    zahl: '53',
    einheit_de: 'Quellen in einer Engine',
    einheit_en: 'feeds in one engine',
    gemessen: '2026-10-17',
    wie: 'Feed-Liste des laufenden Dienstes: 53 aktive von 57 eingetragenen.',
  },
  concierge: {
    zahl: '0,33 s',
    zahl_en: '0.33 s',
    einheit_de: 'je Sprachbefehl erkannt',
    einheit_en: 'per voice command recognised',
    gemessen: '2026-08-22',
    wie: 'Messung beim Wechsel des Erkennungsmodells, vorher 5,08 s. An diesem Tag nicht neu gemessen, sie steht so in der Fallstudie.',
  },
  'defense-in-depth': {
    zahl: '10',
    einheit_de: 'Prüfbereiche je Lauf',
    einheit_en: 'audit areas per run',
    gemessen: '2026-10-17',
    wie: 'Pruefmodule des Audit-Werkzeugs gezaehlt, ohne die Sammeldatei.',
  },
  'ops-cockpit': {
    zahl: '19',
    einheit_de: 'Bereiche in einer Oberfläche',
    einheit_en: 'areas in one interface',
    gemessen: '2026-10-17',
    wie: 'Bereichsmodule der Oberflaeche gezaehlt, ohne die Sammeldatei.',
  },
  'windows-ad-lab': {
    zahl: '2',
    einheit_de: 'Rechner, eine Gesamtstruktur',
    einheit_en: 'machines, one forest',
    gemessen: '2026-10-17',
    wie: 'Gaesteliste des Verbunds: ein Domaenen-Controller und ein Arbeitsplatz, beide auf Abruf.',
  },
  'modell-vermittlung': {
    zahl: '12',
    einheit_de: 'Modelle unter einer Adresse',
    einheit_en: 'models behind one address',
    gemessen: '2026-10-17',
    wie: 'Modell-Liste der Vermittlung gezaehlt, 12 Eintraege mit 12 verschiedenen Namen.',
  },
  gartiko: {
    zahl: '101',
    einheit_de: 'Diagnosen im Pflanzen-Doktor',
    einheit_en: 'diagnoses in the plant doctor',
    gemessen: '2026-10-17',
    wie: 'Diagnose-Datei des Dienstes gezaehlt, dazu ein Entscheidungsbaum darueber.',
  },
  rackforge: {
    zahl: '13',
    einheit_de: 'Teile im Programm',
    einheit_en: 'parts in the catalogue',
    gemessen: '2026-10-17',
    wie: 'Produktseiten im Quellbaum gezaehlt. Bestellungen sind null, der Laden steht vor dem Start.',
  },
  'cms-baukasten': {
    zahl: '2',
    einheit_de: 'Seiten aus einem Bauteil',
    einheit_en: 'sites from one build',
    gemessen: '2026-10-17',
    wie: 'Zwei Auslieferungen desselben Images, eine davon oeffentlich erreichbar.',
  },
  'edge-hosting': {
    zahl: '23',
    einheit_de: 'Container am Netz-Rand',
    einheit_en: 'containers at the edge',
    gemessen: '2026-10-17',
    wie: 'Containerliste des oeffentlichen Wirts: 23 laufend, dazu zwei Mail-Domaenen und drei Postfaecher.',
  },
  'ressourcen-arbiter': {
    // Die Fallstudie sagte „sieben, dazu ein Windows-Lab". Gemessen sind es
    // neun Rollen in der Registry: eine davon traegt drei Instanzen desselben
    // Spiels mit verschiedenen Erweiterungssaetzen. Die Zahl war nicht falsch
    // geraten, sie ist nachgewachsen.
    zahl: '9',
    einheit_de: 'schwere Rollen im Regler',
    einheit_en: 'heavy roles under the governor',
    gemessen: '2026-10-17',
    wie: 'Registry des Reglers gezaehlt: 9 Rollen, dazu das Windows-Lab auf einem zweiten Wirt.',
  },
  spielserver: {
    zahl: '7',
    einheit_de: 'Spiele, neun Server',
    einheit_en: 'games, nine servers',
    gemessen: '2026-10-17',
    wie: 'Registry gezaehlt: 7 verschiedene Spiele in 9 Serverrollen, eines davon dreifach mit verschiedenen Erweiterungssaetzen.',
  },
};

/**
 * Arbeiten, die bewusst keine Zahl bekommen.
 *
 * Seit dem 2026-10-18 steht der Grund **auf der Seite**, nicht nur in
 * dieser Datei (Entscheid vom 17.10.). Gemessen blieben an der Stelle
 * der Zahl 90 px leer am Telefon und 125 px am Breitbild, und eine leere
 * Flaeche sagt nichts, auch nicht „hier fehlt nichts". Jetzt steht dort ein
 * Satz, und damit ist die Zelle die staerkste des Feldes: eine Arbeit, die
 * bewusst nichts ueber sich verraet, auf einer Seite, die sonst alles misst.
 *
 * Zwei Felder, zwei Zwecke, und sie sind bewusst getrennt:
 * - `grund_de`/`grund_en` ist **sichtbarer Text** und steht in der Zelle.
 *   Kurz, weil er den Platz einer Zahl einnimmt und nicht den eines Absatzes.
 * - `warum` ist die lange Begruendung fuer den naechsten Leser dieser Datei
 *   und steht nirgends auf der Seite.
 */
export interface OhneGroesse {
  grund_de: string;
  grund_en: string;
  /** Nicht sichtbar. Fuer den, der die Zahl spaeter „nachtragen" will. */
  warum: string;
}

export const OHNE_GROESSE: Record<string, OhneGroesse> = {
  'media-vault': {
    grund_de: 'Keine Zahl. Jede wäre eine Aussage über einen verschlüsselten Inhalt.',
    grund_en: 'No number. Any number would state something about encrypted content.',
    warum:
      'Die Bibliothek ist verschluesselt, und wer ihren Umfang nennt, verraet genau das, was die Verschluesselung schuetzt. Gilt fuer jede Groesse: Zahl der Titel, belegter Platz, Zahl der Dateien. Auch eine Groessenordnung ist eine Aussage.',
  },
};

export function getWerkgroesse(id: string, locale: Locale) {
  const g = WERKGROESSEN[id];
  if (!g) return null;
  const zahl = locale === 'en' ? (g.zahl_en ?? g.zahl) : g.zahl;
  return { zahl, einheit: locale === 'en' ? g.einheit_en : g.einheit_de };
}

/**
 * Der sichtbare Grund fuer eine fehlende Zahl, oder `null`.
 *
 * ⚠️ Eine Arbeit steht entweder in `WERKGROESSEN` oder in `OHNE_GROESSE`,
 * nie in beiden und nie in keinem. Das Gate `scripts/werkgroessen-pruefen.mjs`
 * haelt das, es laeuft ueber die Arbeiten statt ueber diese Tabellen.
 */
export function getOhneGroesse(id: string, locale: Locale): string | null {
  const o = OHNE_GROESSE[id];
  if (!o) return null;
  return locale === 'en' ? o.grund_en : o.grund_de;
}
