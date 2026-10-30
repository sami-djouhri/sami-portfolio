import { NextResponse, type NextRequest } from 'next/server';

import { ADMIN_COOKIE, safeEqual, sessionSecret, verifySession } from '@/lib/admin-session';
import {
  EN_SLUGS,
  EN_SLUGS_REVERSE,
  GERMAN_COUNTRIES,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from '@/lib/i18n/config';
import { DURCHLASS_COOKIE, DURCHLASS_PARAM, istWartung } from '@/lib/modus';
import { wartungsSeite } from '@/lib/wartung';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 Jahr

/**
 * Marker gegen eine Weiterleitungsschleife, gemessen am 2026-09-16.
 *
 * Next 16 ruft diese Funktion nach einem `NextResponse.rewrite()` ERNEUT auf,
 * und zwar mit dem bereits umgeschriebenen Pfad. Die beiden Zweige unten sind
 * exakte Gegenstücke, und ohne Marker drehen sie sich gegenseitig im Kreis:
 * `/en/projects` wird intern auf `/en/projekte` umgeschrieben, der zweite
 * Durchlauf sieht dort den deutschen Slug, hält ihn für eine veraltete URL und
 * leitet per 301 zurück auf `/en/projects`. Gemessen waren es fünfzig Sprünge,
 * danach bricht der Client ab.
 *
 * Betroffen war JEDE englische Unterseite mit übersetztem Slug (projects,
 * about, now, contact, notes); nur `/en` selbst und `/en/toolbox` liefen, weil
 * Toolbox in beiden Sprachen gleich heißt und deshalb gar nicht in EN_SLUGS
 * steht. Genau diese Auswahl macht den Fehler im Alltag unsichtbar: die
 * Startseite funktioniert, und wer deutsch surft, merkt nie etwas.
 *
 * Der Marker reist als Request-Header mit dem Rewrite mit (dokumentiertes
 * Muster „Setting Headers" der Proxy-Referenz) und sagt dem zweiten Durchlauf,
 * dass die Übersetzung schon passiert ist. Wer die Zweige unten anfasst, prüft
 * danach `/en/projects` mit `curl -L` und schaut auf die Zahl der Sprünge, nicht
 * nur auf den Statuscode: eine Schleife meldet brav 301.
 */
const SLUG_REWRITE_MARKER = 'x-slug-rewritten';

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
 * ist per WireGuard-Tunnel erreichbar, WireGuard ist die primäre Auth, dieses
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

/**
 * Wartungsmodus: schließt die öffentliche Seite mit Status 503.
 *
 * Gibt `null` zurück, wenn der Aufruf durchgelassen wird, sonst die Antwort.
 *
 * Drei Wege kommen durch:
 *
 * 1. **Alles, was nicht über Cloudflare kommt.** Das ist der WireGuard-Tunnel,
 *    also der Owner selbst. Er braucht für den Normalweg keinen Schlüssel.
 * 2. **Der Schlüssel in der Adresse** (`?durchlass=…`). Gedacht für die Probe
 *    vom Telefon aus dem Mobilfunknetz, wo der Tunnel nicht liegt. Der
 *    Parameter wird gegen ein Cookie getauscht und verschwindet aus der
 *    Adresszeile: sonst stünde der Schlüssel im Verlauf, in jeder weiteren
 *    Adresse und im `Referer` nach draußen.
 * 3. **Das Cookie aus Schritt 2**, zwölf Stunden lang.
 *
 * Ohne gesetzten `WARTUNG_SCHLUESSEL` gibt es Weg 2 und 3 nicht. Die Wartung
 * wirkt trotzdem; der Owner kommt über den Tunnel. Fail-closed ist hier richtig,
 * ein leerer Schlüssel darf nicht jeden durchlassen.
 *
 * ⚠️ Das ist **kein Zugriffsschutz**. Hinter der Wartungsseite liegt dieselbe
 * öffentliche Seite, die sonst jeder sieht. Der Schlüssel verhindert, dass ein
 * Besucher einen halben Stand zu sehen bekommt, und nichts weiter.
 *
 * ⚠️ API-Pfade und Dateien mit Endung liegen außerhalb des `matcher` unten und
 * sind in Wartung weiter erreichbar. Für `/api/health` ist das Absicht, daran
 * hängt der Healthcheck des Containers. Seiteninhalt liefert keiner davon.
 */
function wartungsGate(req: NextRequest): NextResponse | null {
  if (!isPublicRequest(req)) return null;

  const schluessel = process.env.WARTUNG_SCHLUESSEL;

  const gereicht = req.nextUrl.searchParams.get(DURCHLASS_PARAM);
  if (schluessel && gereicht && safeEqual(gereicht, schluessel)) {
    const url = req.nextUrl.clone();
    url.searchParams.delete(DURCHLASS_PARAM);
    const res = NextResponse.redirect(url);
    res.cookies.set(DURCHLASS_COOKIE, schluessel, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 12 * 60 * 60,
    });
    return res;
  }

  const cookie = req.cookies.get(DURCHLASS_COOKIE)?.value;
  if (schluessel && cookie && safeEqual(cookie, schluessel)) return null;

  // Die Sprache kommt zuerst aus dem PFAD und erst dann aus der Erkennung.
  // Gemessen am 2026-10-25 mit `scripts/modus-probe.mjs`: mit `detectLocale`
  // allein antwortete `/de` auf Englisch, sobald der Browser keine Sprache
  // mitschickte und Cloudflare kein Land nannte. Die Erkennung ist für
  // unpräfixierte Adressen gebaut, und genau dort bleibt sie auch. Wer `/de`
  // aufruft, hat die Sprache schon gewählt.
  const seg = req.nextUrl.pathname.split('/')[1];
  const sprache = isLocale(seg) ? seg : detectLocale(req);

  return new NextResponse(wartungsSeite(sprache), {
    status: 503,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Eine halbe Stunde ist die Größenordnung eines Deploys mit Nachsehen.
      'retry-after': '1800',
      // Damit Cloudflare die geschlossene Seite nicht über das Ende der
      // Wartung hinaus ausliefert.
      'cache-control': 'no-store',
    },
  });
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

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // /admin: Cookie-Session-Gate (kein Locale-Redirect). Öffentliche Requests laufen
  // unverändert ins 404-Gate der Seite.
  // Steht VOR dem Wartungsgate und ist bewusst davon ausgenommen: der Admin
  // ist der Posteingang, und der soll gerade dann erreichbar sein, wenn die
  // öffentliche Seite zu ist. Er liegt ohnehin nur am WireGuard-Tunnel.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return (await adminGate(req)) ?? NextResponse.next();
  }

  // Wartungsmodus (lib/modus.ts). Vor allem anderen, damit in Wartung keine
  // Weiterleitung und kein Rewrite mehr stattfindet.
  if (istWartung) {
    const zu = wartungsGate(req);
    if (zu) return zu;
  }

  const firstSeg = pathname.split('/')[1];

  // Bereits präfixiert: durchlassen, aber Cookie auf die aktive Sprache setzen,
  // damit ein manueller Wechsel „klebt“.
  if (isLocale(firstSeg)) {
    let res = NextResponse.next();

    // EN-URLs tragen englische Slugs, die physischen Routen bleiben deutsch:
    // /en/projects → intern /en/projekte (Rewrite, URL im Browser bleibt);
    // alte /en/projekte-URLs → 301 auf die neue englische URL.
    if (firstSeg === 'en' && !req.headers.get(SLUG_REWRITE_MARKER)) {
      const segs = pathname.split('/');
      const second = segs[2];
      if (second && EN_SLUGS_REVERSE[second]) {
        const url = req.nextUrl.clone();
        segs[2] = EN_SLUGS_REVERSE[second];
        url.pathname = segs.join('/');
        const headers = new Headers(req.headers);
        headers.set(SLUG_REWRITE_MARKER, '1');
        res = NextResponse.rewrite(url, { request: { headers } });
      } else if (second && EN_SLUGS[second]) {
        const url = req.nextUrl.clone();
        segs[2] = EN_SLUGS[second];
        url.pathname = segs.join('/');
        res = NextResponse.redirect(url, 301);
      }
    }

    // Cookie NUR setzen, wenn er fehlt oder abweicht. Ein `Set-Cookie` auf jeder
    // Antwort macht die Seite für geteilte Caches unbrauchbar und stand zudem im
    // Widerspruch zur Datenschutzerklärung, die genau ein Cookie ausweist.
    if (req.cookies.get(LOCALE_COOKIE)?.value !== firstSeg) {
      res.cookies.set(LOCALE_COOKIE, firstSeg, { path: '/', maxAge: COOKIE_MAX_AGE, sameSite: 'lax' });
    }
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
  // NICHT ausgenommen, der Proxy macht dort das Cookie-Session-Gate (aber
  // keinen Locale-Redirect, s. o.).
  // `icon` deckt als Präfix auch `icon1`/`icon2` mit ab (die 192er- und
  // 512er-Symbole fürs Manifest); eine eigene Regel brauchen sie nicht.
  matcher: ['/((?!api|_next|opengraph-image|icon|apple-icon|manifest|sitemap|robots|feed|.*\\.).*)'],
};
