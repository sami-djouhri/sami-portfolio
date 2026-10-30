/**
 * Die Wartungsseite. Ein HTML-Dokument als Zeichenkette, ausgeliefert von
 * `proxy.ts` mit Status **503**.
 *
 * Warum nicht als Route mit einer `.tsx`-Komponente: eine Route kann der
 * Proxy nur per `rewrite` erreichen, und ein Rewrite behält den Status 200.
 * Genau der ist hier falsch. Eine Suchmaschine, die 200 sieht, nimmt den
 * Wartungstext als Inhalt der Seite auf; bei 503 kommt sie später wieder.
 * Deshalb antwortet der Proxy selbst, und dafür muss das Dokument eine
 * Zeichenkette sein.
 *
 * Die Folge daraus ist wichtiger als sie aussieht: diese Seite kann kein
 * Tailwind benutzen. Das Stilblatt entsteht im Bau und liegt unter `/_next/`,
 * und ob der Browser es bekommt, ist bei einer 503 nicht die Frage, die man
 * sich stellen will. Alles steht deshalb inline, mit den Farbwerten aus
 * `tailwind.config.ts` (bg, text, muted, term). Wer dort die Palette ändert,
 * ändert sie hier mit; es sind vier Werte.
 *
 * Zweisprachig, weil sichtbarer Text auf dieser Seite zweisprachig ist
 * (Regel vom 15.10.). Die Sprache kommt aus derselben Erkennung wie der
 * normale Betrieb, der Proxy gibt sie herein.
 *
 * ⚠️ Kein Kontaktweg darauf, und das ist eine Entscheidung: die Mailadresse
 * steht in `lib/projects.ts` (ABOUT) und in `security.txt`. Eine dritte Kopie
 * hier wäre eine, die beim Wechsel niemand findet, und die Wartung dauert
 * Minuten, nicht Tage.
 */
import type { Locale } from '@/lib/i18n/config';

/**
 * Die sichtbaren Texte. Als Objekt mit `de`/`en`, damit `stilpruefer.mjs` sie
 * findet: er liest Objektfelder und kennt genau diese beiden Namen. Stünde der
 * Text direkt in der Vorlage unten, wäre er wieder einmal unsichtbar für die
 * Prüfung (siebte Ausprägung derselben Lücke).
 */
const TEXTE = {
  titel: {
    de: 'Wartung',
    en: 'Maintenance',
  },
  satz: {
    de: 'An dieser Seite wird gerade gearbeitet. Sie ist in Kürze wieder da.',
    en: 'This site is being worked on. It will be back shortly.',
  },
  hinweis: {
    de: 'Ihr Browser muss nichts tun. Laden Sie die Seite später neu.',
    en: 'Nothing to do on your end. Just load the page again later.',
  },
} as const;

function text(feld: keyof typeof TEXTE, locale: Locale): string {
  return locale === 'en' ? TEXTE[feld].en : TEXTE[feld].de;
}

/** Das vollständige HTML-Dokument der Wartungsseite. */
export function wartungsSeite(locale: Locale): string {
  const titel = text('titel', locale);
  const satz = text('satz', locale);
  const hinweis = text('hinweis', locale);
  // Der Prompt ist das Wortzeichen der Seite und bleibt auch hier stehen. `host`
  // ist immer `djouhri`, nie ein echter Hostname (Privacy-Regel).
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${titel} · Sami Djouhri</title>
<style>
  :root { color-scheme: dark; }
  html, body { margin: 0; height: 100%; }
  body {
    background: #0b0c0e;
    color: #ece9e0;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    line-height: 1.6;
  }
  main { max-width: 34rem; }
  .prompt { color: #5ac56f; font-size: 0.8rem; letter-spacing: 0.08em; }
  h1 {
    margin: 1.25rem 0 0;
    font-size: 1.5rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  p { margin: 1rem 0 0; color: #a3a39e; font-size: 0.95rem; }
  .leise { color: #8f9199; font-size: 0.8rem; }
  hr { margin: 1.5rem 0 0; border: 0; border-top: 1px solid #26282f; }
</style>
</head>
<body>
<main>
  <p class="prompt">sami@djouhri:~$ systemctl status djouhri.de</p>
  <h1>${titel}</h1>
  <p>${satz}</p>
  <hr>
  <p class="leise">${hinweis}</p>
</main>
</body>
</html>
`;
}
