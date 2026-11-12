import { istBewerbung } from '@/lib/modus';

// Kanonische Site-URL, einzige Quelle für die öffentliche Domain.
// Domain-Wechsel: nur hier ändern.
export const SITE_URL = 'https://djouhri.de';
export const SITE_HOST = 'djouhri.de'; // für Anzeige-Texte / OG-Spans

/**
 * Schalter: ist der Lebenslauf freigegeben?
 *
 * Am 2026-10-25 auf `false`, Entscheid aus der Fragerunde. Dazu
 * gehört ein Satz auf der Kontaktseite, dass der Lebenslauf auf Anfrage kommt:
 * ohne ihn sucht ein Personaler und findet gar nichts. Der kompakte Ein-Seiter
 * als PDF ist damit vom Tisch.
 *
 * Was der Schalter tut: `/de/cv`, `/en/cv` und `/cv.pdf` antworten mit 404, und
 * jeder Verweis verschwindet aus Fußzeile, Startseite, Kontaktseite,
 * Über-mich-Seite, Befehlspalette und Sitemap. Sämtliche Daten und Komponenten
 * bleiben unverändert liegen; das Zurückstellen ist genau diese eine Zeile.
 *
 * Warum hier und nicht in lib/cv.ts: die Befehlspalette ist eine
 * Client-Komponente. Ein Import aus lib/cv.ts zöge die vollständigen
 * Lebenslauf-Daten ins Browser-Bundle, nur um ein Boolean zu erfahren.
 *
 * ⚠️ `lib/cv.ts` stand bis zum 2026-10-18 in keiner Prüfliste des Stilprüfers.
 * Eine abgeschaltete Datei wird nicht geprüft, und genau sie geht beim
 * Einschalten als Erstes live. Sie steht jetzt drin, und das bleibt so, obwohl
 * der Lebenslauf wieder aus ist.
 *
 * `scripts/smoke.sh` leitet seine Erwartung aus den beiden Schaltern unten ab
 * und muss beim Zurückstellen nicht angefasst werden.
 */
export const CV_FREIGEGEBEN = false;

/**
 * Der wirksame Zustand: freigegeben UND im Bewerbungsmodus.
 *
 * Zwei Schalter, weil es zwei verschiedene Gründe sind, den Lebenslauf
 * wegzulassen. `CV_FREIGEGEBEN` ist das Urteil über den Text selbst (ist er
 * soweit, dass er draußen stehen kann). Der Modus ist die Frage, ob diese Seite
 * überhaupt um eine Stelle wirbt. Ein Schaufenster zeigt keinen Lebenslauf,
 * auch wenn der Text in Ordnung ist, und das soll nicht davon abhängen, dass
 * jemand beim Moduswechsel an eine zweite Zeile denkt.
 *
 * Alle Verwender lesen weiterhin `CV_OEFFENTLICH` und brauchen den Modus nicht
 * zu kennen.
 */
export const CV_OEFFENTLICH = CV_FREIGEGEBEN && istBewerbung;

/**
 * Soziale/öffentliche Profile, bewusst kuratiert, nicht dekorativ.
 * Nur professionell relevante Plattformen. KEINE Instagram/X/etc.
 *
 * `href` ist OPTIONAL: ein Eintrag ohne href ist „pending“, der Footer rendert ihn
 * dezent ausgegraut und NICHT klickbar. Footer setzt rel="me" für
 * Indie-Web-Verifikation.
 *
 * Am 2026-09-03 wurden die beiden href-losen Einträge (LinkedIn, TryHackMe)
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
 * `status.djouhri.de` gehört hier NICHT hinein: der Block „extern gemessen“
 * direkt darüber verlinkt dieselbe Adresse bereits, und dort mit ihrer
 * Begründung (7/7 erreichbar, Uptime). Stand sie zusätzlich hier, nannte das
 * schmale Panel eine Domain zweimal untereinander, wovon die zweite Nennung
 * nichts hinzufügte. Diese Zeile zeigt PRODUKTE, nicht den Messpunkt.
 */
// Seit dem 2026-10-30 leer, die Zeile im Panel faellt damit weg: saganta.de
// ist seit dem 21.10. privat und antwortet gewollt mit 404. Ein Produkt-Link,
// der ins Leere fuehrt, wiegt schwerer als einer, der fehlt.
export const PROOF_PUBLIC_LINKS: readonly string[] = [];

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
