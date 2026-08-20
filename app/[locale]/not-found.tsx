/**
 * Lokalisierte 404 innerhalb des Locale-Layouts. Das Layout rendert bereits
 * <html>/<body> + globals.css, daher hier KEIN eigenes Dokument.
 *
 * ⚠️ KEIN `cookies()`/`headers()` hier, und auch nicht in `app/not-found.tsx`.
 * `not-found` liegt im Render-Baum JEDER Seite des Segments: ein Request-API
 * darin zieht das ganze Segment aus dem statischen Prerendering (verifiziert
 * 2026-08-14, beide Dateien zusammen — eine allein zu entschärfen reicht nicht).
 * Vorher waren dadurch alle 64 Inhaltsseiten `ƒ Dynamic`.
 *
 * not-found bekommt keine params → die Sprache kommt clientseitig aus dem
 * `lang`-Attribut, das das Locale-Layout ohnehin auf <html> setzt. Bis zur
 * Hydration steht Deutsch, das ist auf einer 404 vertretbar.
 */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { asLocale, localePath, type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { Footer } from '../components/Footer';
import { TopBar } from '../components/TopBar';

export default function LocaleNotFound() {
  const [locale, setLocale] = useState<Locale>('de');

  useEffect(() => {
    setLocale(asLocale(document.documentElement.lang));
  }, []);

  return (
    <>
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
          <span aria-hidden className="text-accent/70 transition-colors group-hover:text-accent">›</span>
          <span className="group-hover:text-accent">{title}</span>
        </p>
        <p className="mt-1 pl-5 text-sm text-muted">{sub}</p>
      </Link>
    </li>
  );
}
