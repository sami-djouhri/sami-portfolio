/**
 * Die Lebenslauf-PDFs als feste Dateien (seit 2026-10-30).
 *
 * Bis dahin gab es EINE Adresse `/cv.pdf`, und Sprache und Format kamen als
 * Parameter (`?lang=en&format=kompakt`). Bei statischer Auslieferung gibt es keine
 * Laufzeit, die Parameter liest; aus vier Varianten werden vier Dateien.
 *
 * Diese Tabelle ist die eine Quelle fuer die Route (`app/cv/[datei]/route.ts`),
 * fuer die Verweise und fuer den Caddy-Block (`scripts/caddy-block.mjs` setzt
 * daraus den Download-Namen, den vorher die Route im `Content-Disposition`
 * mitschickte). Deshalb ohne Importe: der Generator laedt die Datei ohne Next.
 *
 * Ob es die Dateien gibt, entscheidet `CV_OEFFENTLICH` in `lib/site.ts`, und zwar
 * beim Bau: ist der Lebenslauf nicht freigegeben, entsteht keine Datei und die
 * Adressen antworten 404 (Entscheid aus der Fragerunde vom 30.10.).
 */
export type CvSprache = 'de' | 'en';
export type CvVariant = 'voll' | 'kompakt';

export interface CvDatei {
  /** Dateiname unter `/cv/`, zugleich der Routenparameter. */
  datei: string;
  sprache: CvSprache;
  variante: CvVariant;
  /** Name beim Herunterladen, wie ihn die alte Route vergab. */
  downloadName: string;
}

export const CV_DATEIEN: readonly CvDatei[] = [
  { datei: 'de.pdf', sprache: 'de', variante: 'voll', downloadName: 'Lebenslauf-Sami-Djouhri.pdf' },
  { datei: 'de-kompakt.pdf', sprache: 'de', variante: 'kompakt', downloadName: 'Lebenslauf-Kompakt-Sami-Djouhri.pdf' },
  { datei: 'en.pdf', sprache: 'en', variante: 'voll', downloadName: 'Resume-Sami-Djouhri.pdf' },
  { datei: 'en-kompakt.pdf', sprache: 'en', variante: 'kompakt', downloadName: 'Resume-1page-Sami-Djouhri.pdf' },
];

/** Adresse der PDF-Fassung. */
export function cvPdfPfad(sprache: CvSprache, variante: CvVariant = 'voll'): string {
  const d = CV_DATEIEN.find((x) => x.sprache === sprache && x.variante === variante);
  return `/cv/${d ? d.datei : 'de.pdf'}`;
}
