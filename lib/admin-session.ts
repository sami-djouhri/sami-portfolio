// Signierte Admin-Session-Cookies, bewusst OHNE Basic-Auth (dessen Browser-Dialog
// hakt in Kombination mit Next.js App-Router/RSC über den Tunnel). Reines Web-Crypto
// (HMAC-SHA256), damit derselbe Code in der Edge-Middleware UND im Node-Route-Handler
// läuft. Kein Buffer/btoa (in der Edge-Runtime nicht verfügbar) → Hex-Kodierung.
const encoder = new TextEncoder();

export const ADMIN_COOKIE = 'admin_session';

/**
 * Signierschlüssel der Session, bewusst NICHT zwingend das Login-Passwort.
 * Ist `ADMIN_SESSION_SECRET` gesetzt, signiert/prüft die Session damit; sonst
 * fällt sie auf `ADMIN_PASSWORD` zurück (rückwärtskompatibel, kein Deploy-Zwang).
 * So ist das Passwort nicht länger zugleich das Signier-Orakel, und ein
 * Passwortwechsel kann von der Session-Rotation entkoppelt werden.
 */
export function sessionSecret(): string | undefined {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
}

function toHex(buf: ArrayBuffer): string {
  const a = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < a.length; i++) s += a[i]!.toString(16).padStart(2, '0');
  return s;
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(message)));
}

/** Zeitkonstanter Vergleich (kein Early-Exit). */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Erzeugt ein signiertes Token `<expiry>.<hmac>` (Default-TTL 7 Tage). */
export async function signSession(secret: string, ttlMs = 7 * 24 * 3600 * 1000): Promise<string> {
  const exp = String(Date.now() + ttlMs);
  return `${exp}.${await hmacHex(secret, exp)}`;
}

/** Prüft Signatur + Ablauf eines Session-Tokens. */
export async function verifySession(secret: string, token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot < 1) return false;
  const exp = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || Date.now() > expNum) return false;
  return safeEqual(await hmacHex(secret, exp), mac);
}
