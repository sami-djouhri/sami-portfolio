import { NextResponse } from 'next/server';

import { captchaOk } from '@/lib/captcha';
import { sendContactMail, smtpConfigured } from '@/lib/contact-mail';
import { encryptToOwner } from '@/lib/pgp';
import { addMessage } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipBuckets = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  // Eviction beim Write: abgelaufene Buckets anderer IPs entfernen, sonst
  // wächst die Map über die Container-Laufzeit unbegrenzt.
  for (const [key, times] of ipBuckets) {
    if (key !== ip && !times.some((t) => t > cutoff)) ipBuckets.delete(key);
  }
  const hits = (ipBuckets.get(ip) ?? []).filter((t) => t > cutoff);
  hits.push(now);
  ipBuckets.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
  captchaToken?: unknown;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte später erneut.' },
      { status: 429 },
    );
  }

  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: 'Ungültiges JSON.' }, { status: 400 });
  }

  if (typeof body.website === 'string' && body.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  if (!captchaOk(typeof body.captchaToken === 'string' ? body.captchaToken : null)) {
    return NextResponse.json({ error: 'Captcha-Prüfung fehlgeschlagen.' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : '';
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 320) : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim().slice(0, 300) : '';
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : '';

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Name, E-Mail und Nachricht sind Pflicht.' },
      { status: 422 },
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: 'E-Mail wirkt ungültig.' }, { status: 422 });
  }

  const ipHash = hashIp(ip);
  const receivedAt = new Date().toISOString();

  // Der gesamte personenbezogene Inhalt wird mit dem ÖFFENTLICHEN PGP-Schlüssel
  // verschlüsselt, BEVOR er den Prozess irgendwo (Store/Mail) verlässt. Der private
  // Schlüssel liegt nicht auf diesem Server → selbst bei Host-Kompromittierung
  // liegt kein Klartext einer Anfrage vor.
  const plaintextBlock = [
    `Name:    ${name}`,
    `E-Mail:  ${email}`,
    `Betreff: ${subject || '(ohne Betreff)'}`,
    `IP-Hash: ${ipHash}`,
    `Zeit:    ${receivedAt}`,
    '',
    message,
  ].join('\n');
  const encrypted = await encryptToOwner(plaintextBlock);

  // Eine Anfrage gilt als "erfasst", sobald sie an mindestens EINER Stelle landet:
  // CMS-Posteingang (immer) oder optionaler SMTP-Versand (netcup/Mailcow). Erst wenn
  // keiner greift, ist es ein echter Fehler. (Der frühere life-ops-Upstream ist in
  // der DMZ nicht erreichbar und wurde als toter Pfad entfernt.)
  let captured = false;

  // 1) CMS-Posteingang. Bei erfolgreicher Verschlüsselung NUR den Ciphertext ablegen
  //    (Klartextfelder leer). Nur wenn die Verschlüsselung ausnahmsweise scheitert,
  //    als Fallback Klartext speichern, damit die Anfrage nicht verloren geht.
  try {
    if (encrypted) {
      await addMessage({
        name: '',
        email: '',
        subject: '',
        message: '',
        encrypted,
        ip_hash: ipHash,
        received_at: receivedAt,
      });
    } else {
      console.error('[contact] PGP-Verschlüsselung fehlgeschlagen, Klartext-Fallback');
      await addMessage({ name, email, subject, message, ip_hash: ipHash, received_at: receivedAt });
    }
    captured = true;
  } catch (err) {
    console.error('[contact] local store failed', err);
  }

  // 2) Optionaler SMTP-Versand (env-gated). Standardmäßig trägt der Mail-Body NUR den
  //    Ciphertext; CONTACT_MAIL_PLAINTEXT=1 erzwingt bewusst Klartext-Mail (Notausgang,
  //    falls kein PGP-fähiger Mail-Client verfügbar ist).
  if (smtpConfigured()) {
    const mailPlaintext = process.env.CONTACT_MAIL_PLAINTEXT === '1';
    try {
      await sendContactMail({
        name,
        email,
        subject,
        message,
        ipHash,
        encrypted: mailPlaintext ? null : encrypted,
      });
      captured = true;
    } catch (err) {
      console.error('[contact] smtp send failed', err);
    }
  }

  if (!captured) {
    return NextResponse.json(
      { error: 'Empfang gerade nicht möglich. Bitte direkt per E-Mail.' },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

function hashIp(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = (hash * 31 + ip.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}
