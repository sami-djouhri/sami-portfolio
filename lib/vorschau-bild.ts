/**
 * `srcset` fuer ein Vorschaubild unter `/previews/`: kleine Fassung (640 px,
 * `public/previews/klein/`, erzeugt von `scripts/vorschau-klein.mjs`) plus die
 * volle. Ohne Client-Abhaengigkeiten, darf aus jeder Komponente kommen.
 *
 * Bilder ausserhalb von `/previews/` bekommen kein `srcset` (dafuer gibt es
 * keine kleine Fassung, und ein Verweis darauf waere ein 404).
 */
export function vorschauSrcSet(bild: string): string | undefined {
  const m = /^\/previews\/([^/]+\.webp)$/.exec(bild);
  if (!m) return undefined;
  // 1120 ist die Breite aus capture-previews.sh; ein breiteres Original
  // (Beleg) wird dadurch nur etwas spaeter gewaehlt, nicht falsch dargestellt.
  return `/previews/klein/${m[1]} 640w, ${bild} 1120w`;
}

/** Werk-Zelle: zwei Spalten am Handy, drei ab 768 px, vier ab 1024 px. */
export const WERKZELLE_SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw';
