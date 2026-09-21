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

/**
 * Absender-Adresse aus der ENV, an einer Stelle statt in jeder Funktion neu.
 */
function absender(): string {
  return process.env.CONTACT_SMTP_FROM ?? process.env.CONTACT_SMTP_USER!;
}

/**
 * Transporter mit Fristen.
 *
 * ★ Die Fristen sind der Punkt. Ohne sie gilt der nodemailer-Standard von zwei
 * Minuten allein für den Verbindungsaufbau, und seit die Route zusätzlich eine
 * Empfangsbestätigung verschickt, laufen zwei solche Versuche nacheinander vor
 * der HTTP-Antwort. Ein hängender Mailserver hielte den Absender damit vier
 * Minuten im Ladezustand fest, obwohl seine Nachricht längst im Posteingang
 * liegt. Abbrechen ist hier folgenlos: beide Aufrufe sind best-effort, der
 * Empfang hängt am CMS-Store, nicht am SMTP-Weg.
 */
function transport() {
  const port = Number(process.env.CONTACT_SMTP_PORT ?? '587');
  const insecure = process.env.CONTACT_SMTP_INSECURE_TLS === '1';
  return nodemailer.createTransport({
    host: process.env.CONTACT_SMTP_HOST!,
    port,
    secure: port === 465,
    auth: { user: process.env.CONTACT_SMTP_USER!, pass: process.env.CONTACT_SMTP_PASS! },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
    ...(insecure ? { tls: { rejectUnauthorized: false } } : {}),
  });
}

export async function sendContactMail(m: ContactMail): Promise<boolean> {
  if (!smtpConfigured()) return false;

  const from = absender();
  const to = process.env.CONTACT_SMTP_TO ?? 'sami@djouhri.de';
  const transporter = transport();

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

/**
 * Missbrauchsbremse für die Empfangsbestätigung, auf das ZIEL statt auf die Quelle.
 *
 * ★★ Die Bestätigung ist die einzige Mail dieser Seite, deren Empfänger der
 * ABSENDER bestimmt: die Mail an den Betreiber geht immer an `CONTACT_SMTP_TO`.
 * Damit ist das Formular prinzipiell ein Weg, Fremden Post von djouhri.de zu
 * schicken, indem man ihre Adresse einträgt. Das IP-Limit der Route greift dagegen
 * nicht: es begrenzt die Quelle, und genau die wechselt bei verteilten Anfragen,
 * während die Adresse des Opfers dieselbe bleibt.
 *
 * Der Absender bekommt deshalb höchstens eine Bestätigung je Stunde. Seine
 * Nachricht wird davon nicht berührt, sie ist zu diesem Zeitpunkt längst erfasst;
 * gedrosselt wird allein die Quittung. Zweitwirkung ist der Ruf des Mailservers,
 * der auch die saganta.de-Postfächer trägt.
 */
const ACK_FENSTER_MS = 60 * 60 * 1000;
const ackGesendet = new Map<string, number>();

function ackGedrosselt(empfaenger: string): boolean {
  const jetzt = Date.now();
  // Aufräumen beim Schreiben, sonst wächst die Map über die Container-Laufzeit
  // unbegrenzt (dieselbe Bauart wie der IP-Eimer in app/api/contact/route.ts).
  for (const [adresse, zeit] of ackGesendet) {
    if (jetzt - zeit > ACK_FENSTER_MS) ackGesendet.delete(adresse);
  }
  const schluessel = empfaenger.toLowerCase();
  const letzte = ackGesendet.get(schluessel);
  if (letzte !== undefined && jetzt - letzte < ACK_FENSTER_MS) return true;
  ackGesendet.set(schluessel, jetzt);
  return false;
}

/**
 * Empfangsbestätigung an den ABSENDER, best-effort.
 *
 * ★ Warum: bis 2026-09-03 bekam ein Absender nur eine Bildschirmmeldung. Wer das
 * Formular abschickt und den Tab schliesst, hat danach keinen Beleg, dass die
 * Nachricht angekommen ist, und die Seite verspricht zugleich eine Antwort
 * binnen 24 Stunden. Auf einer Seite, die um eine Anstellung wirbt, ist der
 * Absender oft jemand, der gerade zehn Bewerbungen parallel bearbeitet.
 *
 * ★★ Der Text gibt die Anfrage NICHT wieder, weder Betreff noch Nachricht.
 * Grund ist nicht Kürze: die Anfrage wird auf diesem Host mit dem öffentlichen
 * PGP-Schlüssel verschlüsselt, BEVOR sie irgendwo landet (lib/pgp.ts). Eine
 * Bestätigung, die den Inhalt zurückzitiert, schriebe genau diesen Klartext
 * wieder in eine unverschlüsselte Mail und hebelte die Verschlüsselung an ihrem
 * eigenen Ausgang aus.
 *
 * Fehler werden geschluckt: ob die Anfrage als „erfasst" gilt, entscheidet allein
 * der Weg zum Betreiber. Eine gescheiterte Bestätigung darf dem Absender nie eine
 * Fehlermeldung zeigen, obwohl seine Nachricht angekommen ist.
 */
export async function sendContactAck(to: string, locale: 'de' | 'en'): Promise<boolean> {
  if (!smtpConfigured()) return false;
  const empfaenger = headerSafe(to);
  if (!empfaenger) return false;
  if (ackGedrosselt(empfaenger)) return false;

  const from = absender();
  const en = locale === 'en';
  const text = en
    ? [
        'Thank you for your message.',
        '',
        'It arrived and is in my inbox. I read every message myself, and a reply',
        'usually follows within 24 hours.',
        '',
        'This confirmation is automatic, but the address is real: replying to it',
        'reaches me directly.',
        '',
        'Sami Djouhri',
        'https://djouhri.de',
      ].join('\n')
    : [
        'Danke für Ihre Nachricht.',
        '',
        'Sie ist angekommen und liegt in meinem Postfach. Ich lese jede Nachricht',
        'selbst, eine Antwort folgt in der Regel innerhalb von 24 Stunden.',
        '',
        'Diese Bestätigung ist automatisch, die Adresse ist aber echt: eine Antwort',
        'darauf erreicht mich direkt.',
        '',
        'Sami Djouhri',
        'https://djouhri.de',
      ].join('\n');

  try {
    await transport().sendMail({
      from: `Sami Djouhri <${from}>`,
      to: empfaenger,
      subject: en
        ? 'Your message to djouhri.de arrived'
        : 'Ihre Nachricht an djouhri.de ist angekommen',
      text,
    });
    return true;
  } catch (err) {
    console.error('[contact] Empfangsbestätigung fehlgeschlagen', err);
    return false;
  }
}
