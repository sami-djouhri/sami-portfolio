/**
 * 404 für ein ausgelöstes `notFound()` im Locale-Segment: der abgeschaltete
 * Lebenslauf (`/de/cv`, `/en/cv`) und unbekannte Projekt-Adressen.
 *
 * ★★★ Diese Seite SIEHT im Quelltext kaputt aus und ist es nicht. `curl` auf
 * `/de/cv` liefert `<html id="__next_error__">` ohne `lang`, ohne `h1` und ohne
 * einen einzigen Link. Das ist kein Defekt, sondern Nexts Client-Rendering-
 * Rückfall: bei einem ausgelösten `notFound()` reist der Fehler als
 * `NEXT_HTTP_ERROR_FALLBACK;404` in einem `<template>` mit, der vollständige Baum
 * liegt im RSC-Payload, und der Browser baut die 404 beim Hydrieren auf.
 * Im Browser gemessen am 2026-09-18 (headless Chrome, nach `networkidle`):
 * Status 404, `lang="de"` bzw. `lang="en"`, eine Überschrift, 22 Links,
 * Sprunglink vorhanden. Dasselbe gilt für `/en/cv` und für unbekannte Projekt-
 * und Notiz-Adressen.
 *
 * ⚠️ Wer hier etwas ändert, prüft im BROWSER nach, nicht mit `curl`. Eine reine
 * Quelltext-Messung hat diese Seite am 2026-09-16 für eine unformatierte
 * Sackgasse gehalten und drei Reparaturversuche ausgelöst, die alle nichts
 * bewirken konnten, weil nichts kaputt war. Ebenfalls gegengeprüft: KEINE
 * Umbauvariante ändert den Quelltext. Getestet wurden Boundary auf Root-Ebene,
 * Boundary direkt neben der Route, mit und ohne eigenes `<html>`, `<html>` im
 * Root-Layout und `experimental.globalNotFound`. Letzteres greift ausschließlich
 * bei URLs, die auf gar keine Route passen, also nie bei einem `notFound()`.
 *
 * Das eigene `<html>/<body>` unten bleibt trotzdem stehen: es kostet nichts und
 * deckt den Fall ab, dass Next die Hülle doch einmal von hier nimmt.
 *
 * ⚠️ KEIN `cookies()`/`headers()` hier, siehe Kommentar in NotFoundInhalt.
 */
import { IBM_Plex_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google';

import { NotFoundInhalt } from '../components/NotFoundInhalt';

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});
const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-sans',
});

export default function LocaleNotFound() {
  return (
    <html lang="de" className={`dark ${serif.variable} ${mono.variable} ${sans.variable}`}>
      <body>
        <NotFoundInhalt />
      </body>
    </html>
  );
}
