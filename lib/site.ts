// Kanonische Site-URL, einzige Quelle für die öffentliche Domain.
// Domain-Wechsel: nur hier ändern (Memory project_sami_portfolio).
export const SITE_URL = 'https://djouhri.de';
export const SITE_HOST = 'djouhri.de'; // für Anzeige-Texte / OG-Spans

/**
 * Schalter: ist der Lebenslauf öffentlich?
 *
 * ★★ Am 2026-08-31 auf `false` gesetzt, Owner-Entscheid, ausdrücklich
 * VORÜBERGEHEND und ausdrücklich als Abschalten, nicht als Löschen. Grund war
 * keine technische Panne, sondern die Zurechnung: mehrere Bullets in lib/cv.ts
 * formulierten Autorschaft („ein selbst geschriebener Regler", „self-built lean
 * auth service"). Ein Bewerbungsdokument ist die falscheste Stelle für eine
 * Zuschreibung, die man im Gespräch relativieren müsste.
 *
 * ★ Stand 2026-09-03: die Formulierungen SIND überarbeitet (DE und EN, sechs
 * Stellen in lib/cv.ts). Der Lebenslauf beschreibt jetzt Aufbau und Betrieb
 * statt Autorschaft; „auf Basis von better-auth" nennt den Fremdanteil beim
 * Namen, statt ihn in eine Klammer zu setzen. Der Schalter bleibt auf
 * Owner-Wunsch trotzdem `false`: das Scharfschalten ist eine eigene
 * Entscheidung und keine Folge des Textdurchgangs.
 *
 * Was der Schalter tut: `/de/cv`, `/en/cv` und `/cv.pdf` antworten mit 404, und
 * jeder Verweis verschwindet aus Fußzeile, Startseite, Kontaktseite,
 * Über-mich-Seite, Befehlspalette und Sitemap. Sämtliche Daten und Komponenten
 * bleiben unverändert liegen; das Zurückstellen ist genau diese eine Zeile.
 *
 * ★ Warum hier und nicht in lib/cv.ts: die Befehlspalette ist eine
 * Client-Komponente. Ein Import aus lib/cv.ts zöge die vollständigen
 * Lebenslauf-Daten ins Browser-Bundle, nur um ein Boolean zu erfahren.
 *
 * ★ Beim Zurückstellen mitziehen: `scripts/smoke.sh` prüft `/cv.pdf` derzeit
 * auf 404. Steht der Test auf 404, während der Schalter wieder `true` ist,
 * schlägt der Deploy fehl. Andersherum wäre es schlimmer: ein Test, der stur
 * 200 erwartet, hätte das Abschalten gar nicht bemerkt.
 *
 * Nicht betroffen ist `CV_ZIEL` (lib/cv.ts), das weiterhin das `seeks`-Feld der
 * strukturierten Daten speist. Das ist eine Absichtserklärung, keine
 * Leistungsbeschreibung.
 */
export const CV_OEFFENTLICH = false;

/**
 * Soziale/öffentliche Profile, bewusst kuratiert, nicht dekorativ.
 * Nur professionell relevante Plattformen. KEINE Instagram/X/etc.
 *
 * `href` ist OPTIONAL: ein Eintrag ohne href ist „pending“, der Footer rendert ihn
 * dezent ausgegraut und NICHT klickbar. Footer setzt rel="me" für
 * Indie-Web-Verifikation.
 *
 * ★ Am 2026-09-03 wurden die beiden href-losen Einträge (LinkedIn, TryHackMe)
 * ENTFERNT, nicht etwa mit URLs gefüllt. Sie standen seit Monaten als
 * ausgegraute Platzhalter in der Fußzeile. Auf einer Seite, die um eine
 * Anstellung wirbt, ist ein sichtbares, nicht klickbares LinkedIn schlechter als
 * gar keines: es sagt „gibt es, aber nicht für dich", und es ist ausgerechnet
 * das Profil, das ein Recruiter als Erstes sucht.
 * Zurückholen ist eine Zeile, sobald die echte URL vorliegt:
 *   { label: 'LinkedIn', href: 'https://www.linkedin.com/in/…' },
 * Der „pending“-Zweig im Footer bleibt bewusst erhalten, er ist nicht der
 * Fehler gewesen.
 */
/**
 * Quelltext dieser Seite. Steht im Footer, weil das Portfolio denselben Anspruch
 * an sich selbst legt wie an die gezeigten Projekte: nachlesbar statt behauptet.
 */
export const PORTFOLIO_REPO_URL = 'https://github.com/sami-djouhri/sami-portfolio';

/**
 * Öffentlich verlinkte Live-Ziele im Beweis-Streifen der Startseite.
 *
 * BEWUSSTE ALLOWLIST, KEINE Ableitung aus PROJECTS. Wer alle live erreichbaren
 * Eigen-Domains nebeneinander stellt, liefert eine fertige Landkarte der eigenen
 * Angriffsfläche und zieht nebenbei Marken in den Bewerbungskontext, die dort nichts
 * zu suchen haben. Der Beweis steckt in den extern gemessenen Zahlen daneben, nicht
 * in der Anzahl der Links.
 *
 * Neue Einträge nur einzeln und bewusst.
 *
 * ★ `status.djouhri.de` gehört hier NICHT hinein: der Block „extern gemessen“
 * direkt darüber verlinkt dieselbe Adresse bereits, und dort mit ihrer
 * Begründung (7/7 erreichbar, Uptime). Stand sie zusätzlich hier, nannte das
 * schmale Panel eine Domain zweimal untereinander, wovon die zweite Nennung
 * nichts hinzufügte. Diese Zeile zeigt PRODUKTE, nicht den Messpunkt.
 */
export const PROOF_PUBLIC_LINKS: readonly string[] = ['https://saganta.de'];

export type SocialLink = { label: string; href?: string };
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/sami-djouhri' },
];

/**
 * Sichere/direkte Kontaktkanäle, gehören auf die Kontaktseite (nicht in die
 * Footer-Profile). Signal-`me.`-Deeplink öffnet einen Chat, ohne die Nummer
 * preiszugeben. PGP für verschlüsselte Mail: Fingerprint zum Abgleich, der
 * Public Key liegt statisch unter PGP_KEY_URL (auch in security.txt referenziert).
 */
export const SIGNAL_URL =
  'https://signal.me/#eu/4enrNu43UElH-sywxUws50SLK4XjNxNvqONKEQJ4ztgpoE06rw9APKRlDtmj-U9-';
export const PGP_KEY_URL = '/pgp-key.asc';
export const PGP_FINGERPRINT = '1772 5E2E DBE1 F7D4 ADE5 8909 FD3D 1A73 F9AB 4F77';
