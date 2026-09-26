/**
 * Globale 404 (Root), zuständig für jede URL, die auf gar keine Route passt
 * (`/nope`, `/en/nope`, `/fr/xyz`). Das Root-Layout ist ein Passthrough (rendert
 * kein <html>/<body>), deshalb bringt diese Seite ihr eigenes Dokument mit und
 * importiert globals.css + Fonts selbst (gleiches Muster wie app/admin/layout).
 * Der sichtbare Inhalt kommt aus `NotFoundInhalt`, derselben Quelle wie bei der
 * 404 im Locale-Segment.
 *
 * ★★ Bis zum 2026-09-18 stand der Inhalt hier ein ZWEITES Mal im Quelltext, mit
 * fest verdrahtetem `asLocale('de')`, und die Begründung dafür lautete, die
 * Middleware leite ohnehin jeden unpräfixierten Pfad auf `/de` oder `/en` um,
 * diese Seite werde also gar nicht erreicht. Das gilt für `/nope`, aber nicht für
 * `/en/nope`: der Pfad IST präfixiert, passt auf keine Route und landet genau
 * hier. Im Browser gemessen bekam ein englischsprachiger Besucher dort eine
 * komplett deutsche Seite samt falschem `lang`, während `/en/cv` über die andere
 * 404 korrekt auf Englisch umschaltete. Der Fix für die eine Hälfte hatte die
 * andere nie erreicht, weil es zwei Kopien gab.
 *
 * ⚠️ KEIN `cookies()`/`headers()` hier. Diese Datei liegt im Render-Baum aller
 * Routen: ein Request-API darin hat bis 2026-08-14 SÄMTLICHE 64 Inhaltsseiten aus
 * dem statischen Prerendering gezogen (`ƒ Dynamic`, `cache-control: no-store`).
 * Per Build-Vergleich verifiziert; dasselbe gilt für `app/[locale]/not-found.tsx`.
 * Die Sprache kommt deshalb clientseitig aus dem Pfad, siehe `NotFoundInhalt`.
 */
import { IBM_Plex_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google';

import { NotFoundInhalt } from './components/NotFoundInhalt';
import './globals.css';

const serif = Instrument_Serif({ subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'], display: 'swap', variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', variable: '--font-mono' });
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap', variable: '--font-sans' });

export default function NotFound() {
  // `lang` steht serverseitig auf Deutsch und wird nach der Hydration auf die
  // Sprache des Pfades nachgezogen. `mitSkipLink`, weil über dieser Seite kein
  // Layout steht, das den Sprunglink mitbrächte.
  //
  // ★ Der Titel steht als Element im Baum, nicht als `metadata`-Export: für
  // `not-found.tsx` ist der Export laut der mitgelieferten Doku nur bei
  // `global-not-found` vorgesehen, und `global-not-found` greift hier nicht
  //. React hebt ein `<title>` von selbst in den Kopf.
  // Gemessen am 2026-09-22 im Browser: `/de/nixda` und `/en/nixda` hatten
  // überhaupt keinen Titel, der Reiter zeigte die nackte Adresse.
  // Bewusst sprachneutral, weil die Sprache hier erst im Browser feststeht und
  // ein Request-API in dieser Datei alle Inhaltsseiten aus dem statischen
  // Vorrendern zöge (siehe Kopf der Datei).
  // ★ KEIN eigenes `robots`-Meta: Next setzt für eine 404 von sich aus
  // `noindex`. Ein zusätzliches daneben ergab drei robots-Angaben in einem
  // Dokument, gemessen im Browser, und die dritte sagte nichts Neues.
  return (
    <html lang="de" className={`dark ${serif.variable} ${mono.variable} ${sans.variable}`}>
      <body>
        <title>404 · Sami Djouhri</title>
        <NotFoundInhalt mitSkipLink />
      </body>
    </html>
  );
}
