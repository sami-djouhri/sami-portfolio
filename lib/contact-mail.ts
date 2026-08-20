/**
 * Optionaler SMTP-Versand für Kontaktanfragen, env-gated, best-effort.
 *
 * Seit dem Umzug in die DMZ ist der interne life-ops-Upstream NICHT
 * erreichbar. Der Host betreibt aber selbst Mailcow → eine Anfrage kann lokal per
 * SMTP an den eigenen Posteingang zugestellt werden. Ohne gesetzte ENV passiert
 * nichts (Funktion meldet `false`); die Anfrage liegt dann weiterhin im CMS-Store.
 *
 * Benötigte ENV (vom Owner zu setzen, z.B. Mailcow-App-Passwort):
 *   CONTACT_SMTP_HOST   z.B. mail.djouhri.de (oder 127.0.0.1 / mailcow-nginx)
 *   CONTACT_SMTP_PORT   465 (SSL) oder 587 (STARTTLS), Default 587
 *   CONTACT_SMTP_USER   Mailbox-Login
 *   CONTACT_SMTP_PASS   Mailbox-/App-Passwort
 *   CONTACT_SMTP_FROM   Absender (Default = USER)
 *   CONTACT_SMTP_TO     Empfänger (Default = sami@djouhri.de)
 *   CONTACT_SMTP_INSECURE_TLS  "1" → Server-Zertifikat NICHT prüfen. NUR für den
 *                       lokalen, vertrauenswürdigen Mailserver auf demselben Host
 *                       gedacht (z.B. Mailcow ohne öffentliches Mail-Zertifikat).
 */
import nodemailer from 'nodemailer';

export interface ContactMail {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipHash: string;
  /**
   * Gesetzt: der Mail-Body trägt NUR diesen PGP-Armor (kein Klartext von
   * Betreff/Name/Nachricht landet im Postfach). Entschlüsselt wird offline mit
   * dem privaten Schlüssel (OpenKeychain o. Ä.) oder im LAN-Admin.
   */
  encrypted?: string | null;
}

export function smtpConfigured(): boolean {
  return Boolean(
    process.env.CONTACT_SMTP_HOST &&
      process.env.CONTACT_SMTP_USER &&
      process.env.CONTACT_SMTP_PASS,
  );
}

/**
 * Header-sicher: Zeilenumbrüche und Adress-Sonderzeichen aus User-Input
 * entfernen, bevor er in replyTo/subject landet (trim() der Route fängt
 * nur Rand-Whitespace, nicht Newlines mitten im String).
 */
function headerSafe(v: string): string {
  return v.replace(/[\r\n<>"]/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function sendContactMail(m: ContactMail): Promise<boolean> {
  if (!smtpConfigured()) return false;

  const host = process.env.CONTACT_SMTP_HOST!;
  const port = Number(process.env.CONTACT_SMTP_PORT ?? '587');
  const user = process.env.CONTACT_SMTP_USER!;
  const pass = process.env.CONTACT_SMTP_PASS!;
  const from = process.env.CONTACT_SMTP_FROM ?? user;
  const to = process.env.CONTACT_SMTP_TO ?? 'sami@djouhri.de';

  const insecure = process.env.CONTACT_SMTP_INSECURE_TLS === '1';
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    ...(insecure ? { tls: { rejectUnauthorized: false } } : {}),
  });

  // Verschlüsselter Pfad: der Body trägt AUSSCHLIESSLICH den PGP-Armor. Kein
  // Klartext (Name/Betreff/Nachricht/Adresse) landet im Postfach oder in den
  // Kopfzeilen, auch kein reply-To, da die Adresse im Ciphertext steckt. Zum
  // Antworten wird die Anfrage einmal entschlüsselt (Handy: OpenKeychain, oder
  // LAN-Admin), dann kennt man die Absenderadresse.
  if (m.encrypted) {
    const body = [
      'Neue Kontaktanfrage über djouhri.de (verschlüsselt).',
      'Entschlüsseln mit deinem privaten PGP-Schlüssel. Der Inhalt (inkl.',
      'Absenderadresse zum Antworten) liegt im folgenden Block.',
      '',
      m.encrypted,
    ].join('\n');
    await transporter.sendMail({
      from: `djouhri.de <${from}>`,
      to,
      subject: 'Portfolio-Anfrage (verschlüsselt)',
      text: body,
    });
    return true;
  }

  // Klartext-Pfad (nur wenn Verschlüsselung bewusst abgeschaltet ist).
  const text = [
    `Neue Kontaktanfrage über djouhri.de`,
    '',
    `Name:    ${m.name}`,
    `E-Mail:  ${m.email}`,
    m.subject ? `Betreff: ${m.subject}` : null,
    `IP-Hash: ${m.ipHash}`,
    '',
    m.message,
  ]
    .filter((v) => v !== null)
    .join('\n');

  const safeName = headerSafe(m.name);
  await transporter.sendMail({
    from: `djouhri.de <${from}>`,
    to,
    replyTo: `${safeName} <${m.email}>`,
    subject: `Portfolio-Anfrage: ${headerSafe(m.subject) || safeName}`,
    text,
  });
  return true;
}
