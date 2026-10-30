/**
 * Die drei Schriften der Seite, an genau einer Stelle definiert.
 *
 * Die Dateien liegen im Repo (seit 2026-10-30), nicht mehr bei Google. Bis
 * dahin lud `next/font/google` sie bei JEDEM Bau herunter, und genau das hat am
 * 2026-10-21 einen Deploy abbrechen lassen, mit einer Fehlermeldung, die auf
 * eine seit Wochen unveraenderte Datei zeigte. Am 2026-10-30 trat es erneut auf,
 * sobald der Bau-Cache leer war: der Bau hing also nur deshalb nicht an Google,
 * weil `.next` die Dateien noch hielt.
 *
 * Herkunft: `@fontsource/{ibm-plex-sans,instrument-serif,jetbrains-mono}` 5.3.0,
 * Teilmenge `latin` (dieselbe, die vorher von Google kam; Umlaute sind darin).
 * Lizenz jeweils SIL OFL 1.1, Text daneben in `LICENSE-*.txt`.
 *
 * Body: IBM Plex Sans (ruhig-technisch), Mono fuer Struktur, Instrument Serif
 * fuer die menschlichen Momente. Wer einen Schnitt ergaenzt, legt die Datei
 * dazu; ein Gewicht ohne Datei faellt still auf eine Systemschrift zurueck.
 */
import localFont from 'next/font/local';

export const serif = localFont({
  src: [
    { path: './instrument-serif-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './instrument-serif-latin-400-italic.woff2', weight: '400', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-display',
});

export const mono = localFont({
  src: [
    { path: './jetbrains-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './jetbrains-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-mono',
});

export const sans = localFont({
  src: [
    { path: './ibm-plex-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './ibm-plex-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './ibm-plex-sans-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-sans',
});

/** Die drei CSS-Variablen fuer das `className` am `<html>`. */
export const schriftKlassen = `${serif.variable} ${mono.variable} ${sans.variable}`;
