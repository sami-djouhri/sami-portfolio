import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, safeEqual, sessionSecret, signSession } from '@/lib/admin-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Kommt der Request über Cloudflare (öffentlich)? Spiegelt lib/lan.ts. */
function isPublic(req: Request): boolean {
  const h = req.headers;
  return (
    Boolean(h.get('cf-connecting-ip')) ||
    Boolean(h.get('cf-ray')) ||
    (h.get('cdn-loop') || '').toLowerCase().includes('cloudflare') ||
    Boolean(h.get('cf-worker'))
  );
}

/** Nur relative /admin-Ziele zulassen (kein Open-Redirect). */
function safeNext(raw: string): string {
  return raw.startsWith('/admin') && !raw.startsWith('//') ? raw : '/admin';
}

/**
 * Redirect mit RELATIVER Location. NextResponse.redirect() braucht eine absolute
 * URL und würde `req.url` (im Container `http://0.0.0.0:3000`) einsetzen → tote
 * Adresse im Browser. Eine relative Location löst der Browser gegen die echte
 * Origin auf (Tunnel-IP wie auch djouhri.de) → immer korrekt.
 */
function seeOther(location: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { Location: location } });
}

// ─── In-Memory-Rate-Limit gegen Passwort-Brute-Force ────────────────────────────
// Der Admin ist WireGuard-only + hinter dem 404/Origin-Gate, aber ein Login ohne
// jede Drosselung lädt zum Durchprobieren ein. Ein Prozess-lokaler Zähler reicht
// (Single-User, ein Container): nur FEHLversuche zählen, ein Erfolg setzt zurück,
// damit ein Vertipper den legitimen Nutzer nicht aussperrt.
const RL_WINDOW_MS = 15 * 60 * 1000;
const RL_MAX_FAILS = 8;
const attempts = new Map<string, { fails: number; first: number }>();

function clientKey(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || '';
  return xff.split(',')[0]?.trim() || 'local';
}

/** true = blockiert (Limit erreicht, Fenster noch offen). Prunt nebenbei. */
function isRateLimited(key: string, now: number): boolean {
  const e = attempts.get(key);
  if (!e) return false;
  if (now - e.first > RL_WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return e.fails >= RL_MAX_FAILS;
}

function recordFailure(key: string, now: number): void {
  const e = attempts.get(key);
  if (!e || now - e.first > RL_WINDOW_MS) {
    attempts.set(key, { fails: 1, first: now });
  } else {
    e.fails += 1;
  }
  // Gelegentliches Aufräumen abgelaufener Einträge (Map bleibt klein).
  if (attempts.size > 64) {
    for (const [k, v] of attempts) if (now - v.first > RL_WINDOW_MS) attempts.delete(k);
  }
}

export async function POST(req: Request) {
  // Login existiert nur im LAN/Tunnel — öffentlich unsichtbar (wie /admin selbst).
  if (isPublic(req)) return new NextResponse('Not found', { status: 404 });

  const password = process.env.ADMIN_PASSWORD;

  const form = await req.formData();
  const input = String(form.get('password') ?? '');
  const next = safeNext(String(form.get('next') ?? '/admin'));

  // Kein Passwort gesetzt = Gate aus → direkt durchlassen.
  if (!password) return seeOther(next);

  const now = Date.now();
  const key = clientKey(req);

  if (isRateLimited(key, now)) {
    return seeOther(`/admin/login?error=rate&next=${encodeURIComponent(next)}`);
  }

  if (!safeEqual(input, password)) {
    recordFailure(key, now);
    return seeOther(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  // Erfolg → Zähler zurücksetzen und Session ausstellen (mit dem Session-Secret
  // signiert, nicht mit dem Passwort selbst).
  attempts.delete(key);
  const res = seeOther(next);
  res.cookies.set(ADMIN_COOKIE, await signSession(sessionSecret()!), {
    httpOnly: true,
    sameSite: 'lax',
    // KEIN Secure: der Admin läuft über einen Klartext-HTTP-WireGuard-Tunnel;
    // ein Secure-Cookie würde dort nie gesendet. Öffentlich ist /admin ohnehin 404.
    path: '/',
    maxAge: 7 * 24 * 3600,
  });
  return res;
}
