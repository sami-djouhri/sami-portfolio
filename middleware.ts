import { NextResponse, type NextRequest } from 'next/server';

import { ADMIN_COOKIE, sessionSecret, verifySession } from '@/lib/admin-session';
import { GERMAN_COUNTRIES, LOCALE_COOKIE, isLocale, type Locale } from '@/lib/i18n/config';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 Jahr

/** Kommt der Request über Cloudflare (öffentlich)? Spiegelt lib/lan.ts. */
function isPublicRequest(req: NextRequest): boolean {
  const h = req.headers;
  return (
    Boolean(h.get('cf-connecting-ip')) ||
    Boolean(h.get('cf-ray')) ||
    (h.get('cdn-loop') || '').toLowerCase().includes('cloudflare') ||
    Boolean(h.get('cf-worker'))
  );
}

/**
 * Cookie-Session-Gate für /admin als zweite Schicht NEBEN dem LAN-Gate. Der Admin
 * ist per WireGuard-Tunnel erreichbar — WireGuard ist die primäre Auth, dieses
 * Login die zweite. Bewusst KEIN Basic-Auth (dessen Browser-
 * Dialog hakt mit dem App-Router/RSC über den Tunnel) → signiertes Cookie + eigene
 * Login-Seite. Öffentliche Requests (Cloudflare) fasst das hier NICHT an (sie laufen
 * weiter ins 404-Gate der Seite). Ohne gesetztes ADMIN_PASSWORD ist das Gate aus.
 */
async function adminGate(req: NextRequest): Promise<NextResponse | null> {
  // Öffentlich (Cloudflare) → nicht umleiten; die Seite selbst liefert 404.
  if (isPublicRequest(req)) return null;

  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null; // Gate deaktiviert (kein Passwort gesetzt)

  const { pathname } = req.nextUrl;
  if (pathname === '/admin/login') return null; // Login-Seite selbst ist frei erreichbar

  // Signatur wird mit dem Session-Secret geprüft (fällt ohne dediziertes Secret
  // auf ADMIN_PASSWORD zurück), nicht mehr direkt mit dem Passwort.
  const ok = await verifySession(sessionSecret()!, req.cookies.get(ADMIN_COOKIE)?.value);
  if (ok) return null;

  // Nicht angemeldet → auf die Login-Seite mit Rücksprung-Ziel.
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

/** Grobe Accept-Language-Prüfung: bevorzugt der Browser Deutsch? */
function prefersGerman(header: string | null): boolean {
  if (!header) return false;
  // Erste (höchstgewichtete) Sprach-Tags reichen für die Grobwahl.
  const primary = header.split(',')[0]?.trim().toLowerCase() ?? '';
  return primary.startsWith('de');
}

/**
 * Sprachwahl: Cookie (manuelle Wahl) gewinnt. Sonst führt das Land (Cloudflare
 * CF-IPCountry), die Browser-Sprache verfeinert Randfälle. Ohne Land-Signal
 * entscheidet die Browser-Sprache.
 */
function detectLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;

  const country = (req.headers.get('cf-ipcountry') || '').toUpperCase();
  const germanBrowser = prefersGerman(req.headers.get('accept-language'));

  if (country) {
    if (GERMAN_COUNTRIES.has(country)) return 'de';
    // Land nicht deutschsprachig → Englisch, außer der Browser will klar Deutsch.
    return germanBrowser ? 'de' : 'en';
  }
  // Kein Land-Signal (z.B. lokal/ohne Cloudflare): Browser-Sprache entscheidet.
  return germanBrowser ? 'de' : 'en';
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // /admin: Cookie-Session-Gate (kein Locale-Redirect). Öffentliche Requests laufen
  // unverändert ins 404-Gate der Seite.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return (await adminGate(req)) ?? NextResponse.next();
  }

  const firstSeg = pathname.split('/')[1];

  // Bereits präfixiert: durchlassen, aber Cookie auf die aktive Sprache setzen,
  // damit ein manueller Wechsel „klebt".
  if (isLocale(firstSeg)) {
    const res = NextResponse.next();
    res.cookies.set(LOCALE_COOKIE, firstSeg, { path: '/', maxAge: COOKIE_MAX_AGE, sameSite: 'lax' });
    return res;
  }

  // Unpräfixiert: Sprache erkennen und auf /{locale}{pfad} umleiten.
  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
  url.search = search;
  const res = NextResponse.redirect(url);
  res.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: COOKIE_MAX_AGE, sameSite: 'lax' });
  return res;
}

export const config = {
  // Alles außer API, Next-Interna, OG-Bild-Routen und Dateien mit Endung
  // (robots.txt, sitemap.xml, feed.xml, cv.pdf, *.webp, favicon …). /admin ist
  // NICHT mehr ausgenommen — die Middleware macht dort das Cookie-Session-Gate
  // (aber keinen Locale-Redirect, s. o.).
  matcher: ['/((?!api|_next|opengraph-image|icon|apple-icon|manifest|sitemap|robots|feed|.*\\.).*)'],
};
