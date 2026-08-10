'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { localePath, type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Prompt } from './Terminal';

const NAV = [
  { href: '/projekte', key: 'nav.projekte' },
  { href: '/uber-mich', key: 'nav.uber' },
  { href: '/toolbox', key: 'nav.toolbox' },
  { href: '/kontakt', key: 'nav.kontakt' },
] as const;

/** Aktive Route als Prompt-Pfad: '/' → '~', '/projekte' → '~/projekte'. */
function promptPath(active?: string): string {
  if (!active || active === '/') return '~';
  return `~${active}`;
}

export function TopBar({ active, locale }: { active?: string; locale: Locale }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-bg/80 backdrop-blur-sm no-print">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3 sm:px-8">
        <Link
          href={localePath(locale, '/')}
          aria-label={t(locale, 'nav.startseite')}
          className="group rounded-sm focus-visible:ring-offset-0"
          onClick={() => setOpen(false)}
        >
          {/* Das Prompt-Wortzeichen ist hier Marke, nicht Text: „sami@djouhri:~/projekte$"
              als Linkname vorgelesen zu bekommen hilft niemandem, und wer die Seite per
              Sprache bedient, kann so einen Namen nicht aussprechen. Deshalb bleibt der
              sichtbare Teil aus dem Accessible Name heraus, der Link heißt schlicht
              „Startseite" (Lighthouse label-content-name-mismatch). */}
          <span aria-hidden>
            <Prompt
              path={promptPath(active)}
              className="text-[0.78rem] transition-opacity group-hover:opacity-80"
            />
          </span>
        </Link>

        <nav
          aria-label="Navigation"
          className="hidden items-center gap-6 font-mono text-xs uppercase tracking-widest text-muted sm:flex"
        >
          {NAV.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={localePath(locale, item.href)}
                aria-current={isActive ? 'page' : undefined}
                className={`group transition-colors ${isActive ? 'text-accent' : 'text-muted hover:text-text'}`}
              >
                <span
                  aria-hidden
                  className={
                    isActive
                      ? 'text-accent'
                      : 'text-transparent transition-colors group-hover:text-accent/60'
                  }
                >
                  ›
                </span>{' '}
                {t(locale, item.key)}
              </Link>
            );
          })}
          <LanguageSwitcher locale={locale} />
          <button
            type="button"
            aria-label="Command Palette"
            onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
            className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-surface/60 px-2 py-1 text-[0.65rem] text-muted-dim transition-colors hover:border-border-strong hover:text-accent"
          >
            <span aria-hidden className="font-mono">⌘K</span>
          </button>
        </nav>

        <button
          type="button"
          aria-label={open ? t(locale, 'topbar.menuClose') : t(locale, 'topbar.menuOpen')}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-md border border-border bg-surface/60 font-mono text-base text-text hover:border-border-strong sm:hidden"
        >
          <span aria-hidden>{open ? '✕' : '≡'}</span>
        </button>
      </div>

      {open ? (
        <>
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[3.25rem] z-10 bg-bg/80 backdrop-blur-sm sm:hidden"
          />
          <nav
            id="mobile-nav"
            aria-label="Navigation"
            className="absolute inset-x-0 top-full z-20 border-b border-border bg-bg sm:hidden"
          >
            <ul className="mx-auto max-w-5xl px-6 py-4">
              <li className="flex items-center justify-between border-b border-border/40 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    window.dispatchEvent(new Event('open-command-palette'));
                  }}
                  className="flex items-center gap-2 py-1 text-left font-mono text-sm uppercase tracking-widest text-text/90 hover:text-accent"
                >
                  <span aria-hidden className="mr-2 text-accent/70">⌘K</span>
                  {t(locale, 'palette.open')}
                </button>
                <LanguageSwitcher locale={locale} />
              </li>
              {NAV.map((item) => {
                const isActive = active === item.href;
                return (
                  <li key={item.href} className="border-b border-border/40 last:border-0">
                    <Link
                      href={localePath(locale, item.href)}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setOpen(false)}
                      className={
                        'block py-3 font-mono text-sm uppercase tracking-widest ' +
                        (isActive ? 'text-accent' : 'text-text/90 hover:text-accent')
                      }
                    >
                      <span aria-hidden className="mr-2 text-muted-dim">›</span>
                      {t(locale, item.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      ) : null}
    </div>
  );
}
