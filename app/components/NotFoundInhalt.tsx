/**
 * Inhalt der 404-Seite, geteilt von `app/not-found.tsx` (nicht gematchte URLs) und
 * `app/[locale]/not-found.tsx` (ausgelöstes `notFound()`, z. B. der abgeschaltete
 * Lebenslauf oder eine unbekannte Projekt-Adresse).
 *
 * ⚠️ KEIN `cookies()`/`headers()` hier und in keiner der beiden aufrufenden Dateien.
 * `not-found` liegt im Render-Baum JEDER Seite des Segments: ein Request-API darin
 * zieht das ganze Segment aus dem statischen Prerendering (verifiziert 2026-08-14).
 *
 * ★ Die Sprache kommt deshalb clientseitig aus dem ersten Pfad-Segment, nicht aus
 * einem Request-Header. Vorher stand sie in beiden Dateien fest auf Deutsch, mit der
 * Begründung, die Middleware leite ohnehin jeden unpräfixierten Pfad um. Das stimmt
 * für `/nope`, aber nicht für `/en/nope`: der Pfad IST präfixiert, landet trotzdem
 * hier, und ein englischsprachiger Besucher bekam eine komplett deutsche Seite samt
 * falschem `lang`. Bis zur Hydration steht Deutsch, das ist auf einer 404 vertretbar.
 *
 * ★★ Dieser Weg wirkte bis zum 2026-09-18 nur auf der Hälfte der 404: `app/not-found.tsx`
 * importierte diese Datei gar nicht, sondern trug eine zweite, fest deutsche Kopie
 * desselben Inhalts. Im Browser gemessen war `/en/nope` deshalb durchgehend deutsch,
 * während `/en/cv` korrekt umschaltete. Zwei Kopien einer Seite driften genau so: die
 * eine wird repariert, die andere sieht niemand an.
 */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { asLocale, localePath, type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { Footer } from './Footer';
import { SkipLink } from './SkipLink';
import { TopBar } from './TopBar';

/**
 * `mitSkipLink` nur für den Root-Aufrufer. Im Locale-Segment bringt
 * `app/[locale]/layout.tsx` den Sprunglink schon mit (im Browser gegengeprüft: auf
 * `/de/cv` steht er, auf `/nope` fehlte er). Hier fest eingebaut gäbe es ihn dort
 * doppelt, und zwei gleichlautende Sprungziele sind für die Tastatur schlechter als
 * eines.
 */
export function NotFoundInhalt({ mitSkipLink = false }: { mitSkipLink?: boolean }) {
  const [locale, setLocale] = useState<Locale>('de');

  useEffect(() => {
    const ausPfad = asLocale(window.location.pathname.split('/')[1]);
    setLocale(ausPfad);
    // `lang` am Dokument nachziehen: Screenreader lesen sonst in der falschen Sprache
    // vor. Beide aufrufenden Dateien rendern serverseitig `lang="de"`.
    document.documentElement.lang = ausPfad;
  }, []);

  return (
    <>
      {mitSkipLink ? <SkipLink locale={locale} /> : null}
      <TopBar locale={locale} />
      <main id="main" className="mx-auto max-w-3xl px-6 pb-32 pt-24 sm:px-8 sm:pt-32">
        <p className="font-mono text-sm text-accent">{t(locale, 'notfound.eyebrow')}</p>
        <h1 className="mt-6 font-display text-display-page">{t(locale, 'notfound.title')}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-text/90">
          {t(locale, 'notfound.body')}
        </p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          <NavCard
            href={localePath(locale, '/')}
            title={t(locale, 'notfound.home')}
            sub={t(locale, 'notfound.homeSub')}
          />
          <NavCard
            href={localePath(locale, '/projekte')}
            title={t(locale, 'nav.projekte')}
            sub={t(locale, 'notfound.projectsSub')}
          />
          <NavCard
            href={localePath(locale, '/kontakt')}
            title={t(locale, 'nav.kontakt')}
            sub={t(locale, 'notfound.contactSub')}
          />
          <NavCard
            href={localePath(locale, '/toolbox')}
            title={t(locale, 'nav.toolbox')}
            sub={t(locale, 'notfound.toolboxSub')}
          />
        </ul>
      </main>
      <Footer locale={locale} />
    </>
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
          <span aria-hidden className="text-term/80 transition-colors group-hover:text-accent">
            ›
          </span>
          <span className="group-hover:text-accent">{title}</span>
        </p>
        <p className="mt-1 pl-5 text-sm text-muted">{sub}</p>
      </Link>
    </li>
  );
}
