// Kanonische Site-URL, einzige Quelle für die öffentliche Domain.
// Domain-Wechsel: nur hier ändern (Memory project_sami_portfolio).
export const SITE_URL = 'https://djouhri.de';
export const SITE_HOST = 'djouhri.de'; // für Anzeige-Texte / OG-Spans

/**
 * Soziale/öffentliche Profile — bewusst kuratiert, nicht dekorativ.
 * Nur professionell relevante Plattformen (GitHub, LinkedIn für Recruiter-Vertrauen,
 * TryHackMe als Security-Praxis-Nachweis). KEINE Instagram/X/etc.
 *
 * `href` ist OPTIONAL: ein Eintrag ohne href ist „pending" — der Footer rendert ihn
 * dezent ausgegraut und NICHT klickbar (Position + Icon sichtbar, aber kein toter
 * Link auf der Bewerbungsseite). Sobald die echte URL hier steht, wird daraus ein
 * echter Link. Footer setzt rel="me" für Indie-Web-Verifikation.
 */
export type SocialLink = { label: string; href?: string };
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/sami-djouhri' },
  { label: 'LinkedIn' }, // TODO Owner: echte Profil-URL eintragen
  { label: 'TryHackMe' }, // TODO Owner: https://tryhackme.com/p/<user>
];

/**
 * Sichere/direkte Kontaktkanäle — gehören auf die Kontaktseite (nicht in die
 * Footer-Profile). Signal-`me.`-Deeplink öffnet einen Chat, ohne die Nummer
 * preiszugeben. PGP für verschlüsselte Mail: Fingerprint zum Abgleich, der
 * Public Key liegt statisch unter PGP_KEY_URL (auch in security.txt referenziert).
 */
export const SIGNAL_URL =
  'https://signal.me/#eu/4enrNu43UElH-sywxUws50SLK4XjNxNvqONKEQJ4ztgpoE06rw9APKRlDtmj-U9-';
export const PGP_KEY_URL = '/pgp-key.asc';
export const PGP_FINGERPRINT = '1772 5E2E DBE1 F7D4 ADE5 8909 FD3D 1A73 F9AB 4F77';
