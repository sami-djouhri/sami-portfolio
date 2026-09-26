/**
 * Kleine Helfer für Suchmaschinen-Metadaten.
 *
 * ★★ Warum es diese Datei gibt: die Beschreibung der Projektseiten entstand als
 * `${tagline} ${description}`, also aus zwei Feldern, die beide schon Fließtext
 * sind. Gemessen am 2026-09-22 im Browser über die gerenderten Seiten ergab das
 * 504 Zeichen (Homelab), 533 (dieselbe Seite auf Englisch), 606 (Lernen) und 844
 * (Saganta). Google schneidet die Anzeige bei etwa 155 bis 160 Zeichen ab, der
 * Rest ist nicht etwa Reserve, sondern wird weggeworfen, und der sichtbare Teil
 * endet mitten im Satz. Betroffen waren alle 25 Detailseiten, also der mit
 * Abstand häufigste Seitentyp der Site.
 *
 * Die anderen Seiten lagen mit 68 bis 193 Zeichen im Rahmen; das Problem ist
 * genau die Verkettung, nicht die Textlänge an sich.
 */

/** Obergrenze in Zeichen. Etwas unter dem, was Suchmaschinen zeigen. */
export const BESCHREIBUNG_MAX = 155;

/**
 * Kürzt einen Beschreibungstext auf eine Länge, die auch ankommt.
 *
 * Geschnitten wird an der letzten Wortgrenze davor, nicht mitten im Wort, und
 * ein vorhandenes Satzende innerhalb der letzten Viertelstrecke gewinnt gegen
 * die Wortgrenze: ein abgeschlossener Satz liest sich besser als ein Fragment
 * mit Auslassungszeichen. Passt der Text ohnehin, bleibt er unangetastet, und
 * dann steht auch kein Auslassungszeichen dahinter.
 */
export function kurzbeschreibung(text: string, max: number = BESCHREIBUNG_MAX): string {
  const eine_zeile = text.replace(/\s+/g, ' ').trim();
  if (eine_zeile.length <= max) return eine_zeile;

  const ausschnitt = eine_zeile.slice(0, max);

  // Ein Satzende im letzten Viertel: dort sauber abschließen.
  const satzende = Math.max(
    ausschnitt.lastIndexOf('. '),
    ausschnitt.lastIndexOf('! '),
    ausschnitt.lastIndexOf('? '),
  );
  if (satzende >= max * 0.75) return ausschnitt.slice(0, satzende + 1);

  const wortgrenze = ausschnitt.lastIndexOf(' ');
  const gekuerzt = wortgrenze > 0 ? ausschnitt.slice(0, wortgrenze) : ausschnitt;
  return `${gekuerzt.replace(/[,;:.\s]+$/, '')}…`;
}
