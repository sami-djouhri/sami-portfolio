'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LOCALES, isLocale, type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';

/**
 * DE/EN-Umschalter: verlinkt die aktuelle Seite in der jeweils anderen Sprache
 * (gleicher Pfad, getauschtes Locale-Prefix). Die middleware.ts setzt beim Navigieren
 * das NEXT_LOCALE-Cookie, sodass die Wahl „klebt".
 */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || `/${locale}`;

  function hrefFor(target: Locale): string {
    const parts = pathname.split('/');
    if (isLocale(parts[1])) parts[1] = target;
    else parts.splice(1, 0, target);
    return parts.join('/') || `/${target}`;
  }

  return (
    <div
      className="inline-flex items-center font-mono text-[0.65rem] uppercase tracking-widest"
      role="group"
      aria-label={t(locale, 'lang.switch')}
    >
      {/* Tap-Targets: jedes Locale bekommt min-h/px → ~36×36px statt der früheren
          ~16×10px reinen Textglyphen (unter WCAG-2.2-AA). Padding ersetzt das alte
          gap-1/mx-1 → gleiche „DE / EN"-Optik, aber mobil sicher treffbar. */}
      {LOCALES.map((l, i) => (
        <span key={l} className="inline-flex items-center">
          {i > 0 ? <span aria-hidden className="text-border-strong">/</span> : null}
          {l === locale ? (
            <span
              aria-current="true"
              className="inline-flex min-h-[2.25rem] items-center px-2.5 text-accent"
            >
              {l.toUpperCase()}
            </span>
          ) : (
            <Link
              href={hrefFor(l)}
              hrefLang={l}
              className="inline-flex min-h-[2.25rem] items-center rounded-sm px-2.5 text-muted-dim transition-colors hover:text-accent"
            >
              {l.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
