/**
 * Globale 404 (Root). Das Root-Layout ist ein Passthrough (rendert kein
 * <html>/<body>), deshalb bringt diese Seite ihr eigenes Dokument mit und
 * importiert globals.css + Fonts selbst (gleiches Muster wie app/admin/layout).
 * Seit 2026-08-15 mit Site-Chrome (TopBar/Footer): eine 404 ist genau die
 * Seite, die Orientierung braucht — beide brauchen nur eine Locale, keinen Context.
 *
 * ⚠️ KEIN `cookies()`/`headers()` hier. Diese Datei fängt jede nicht
 * gematchte URL der ganzen App ab und liegt damit im Render-Baum aller
 * Routen: ein Request-API darin hat bis 2026-08-14 SÄMTLICHE 64
 * Inhaltsseiten aus dem statischen Prerendering gezogen (`ƒ Dynamic`,
 * `cache-control: no-store`). Per Build-Vergleich verifiziert; dasselbe
 * gilt für `app/[locale]/not-found.tsx`.
 *
 * Sprache fest Deutsch: die Middleware leitet jeden unpräfixierten Pfad auf
 * `/de` bzw. `/en` um, diese Seite wird im Normalbetrieb also gar nicht
 * erreicht. Die sprachrichtige 404 ist die im Locale-Segment.
 */
import Link from 'next/link';
import { IBM_Plex_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google';

import { asLocale, localePath } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { Footer } from './components/Footer';
import { TopBar } from './components/TopBar';
import './globals.css';

const serif = Instrument_Serif({ subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'], display: 'swap', variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', variable: '--font-mono' });
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap', variable: '--font-sans' });

export default function NotFound() {
  const locale = asLocale('de');

  return (
    <html lang={locale} className={`dark ${serif.variable} ${mono.variable} ${sans.variable}`}>
      <body>
        <TopBar locale={locale} />
        <main id="main" className="mx-auto max-w-3xl px-6 pb-32 pt-24 sm:px-8 sm:pt-32">
          <p className="font-mono text-sm text-accent">{t(locale, 'notfound.eyebrow')}</p>
          <h1 className="mt-6 font-display text-display-page">
            {t(locale, 'notfound.title')}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text/90">
            {t(locale, 'notfound.body')}
          </p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            <NavCard href={localePath(locale, '/')} title={t(locale, 'notfound.home')} sub={t(locale, 'notfound.homeSub')} />
            <NavCard href={localePath(locale, '/projekte')} title={t(locale, 'nav.projekte')} sub={t(locale, 'notfound.projectsSub')} />
            <NavCard href={localePath(locale, '/kontakt')} title={t(locale, 'nav.kontakt')} sub={t(locale, 'notfound.contactSub')} />
            <NavCard href={localePath(locale, '/toolbox')} title={t(locale, 'nav.toolbox')} sub={t(locale, 'notfound.toolboxSub')} />
          </ul>
        </main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}

function NavCard({ href, title, sub }: { href: string; title: string; sub: string }) {
  return (
    <li>
      <Link
        href={href}
        className="card-interactive group block rounded-lg border border-border bg-surface/60 p-5"
      >
        <p className="flex items-baseline gap-2 font-mono text-base font-medium text-text">
          <span aria-hidden className="text-accent/70 transition-colors group-hover:text-accent">›</span>
          <span className="group-hover:text-accent">{title}</span>
        </p>
        <p className="mt-1 pl-5 text-sm text-muted">{sub}</p>
      </Link>
    </li>
  );
}
