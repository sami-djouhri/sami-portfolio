/**
 * Zentrale i18n-Konfiguration. Bewusst dependency-frei (kein next-intl), passend
 * zur „Eigen-System statt Baukasten“-Linie und zum ohnehin schlanken Setup.
 *
 * URL-Modell: Pfad pro Sprache (/de, /en). DE ist Default. Die middleware.ts leitet
 * unpräfixierte Pfade auf die erkannte Sprache um; jeder interne Link wird über
 * `localePath()` präfixiert.
 */
export const LOCALES = ['de', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'de';

/** Cookie, in dem die manuelle Sprachwahl gemerkt wird (überschreibt Auto-Erkennung). */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

/** Länder, in denen Deutsch Amts-/Hauptsprache ist → Auto-DE (Cloudflare CF-IPCountry). */
export const GERMAN_COUNTRIES = new Set(['DE', 'AT', 'CH', 'LI']);

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Fällt auf DEFAULT_LOCALE zurück, wenn der Wert keine gültige Sprache ist. */
export function asLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * EN-URLs tragen englische Segment-Slugs, die physischen Routen unter
 * app/[locale]/ bleiben deutsch: middleware.ts rewritet /en/<en-slug> intern auf
 * die deutsche Route und leitet alte /en/<de-slug>-URLs per 301 auf die neuen um.
 * toolbox und cv sind in beiden Sprachen identisch und fehlen deshalb hier.
 */
export const EN_SLUGS: Record<string, string> = {
  projekte: 'projects',
  'uber-mich': 'about',
  kontakt: 'contact',
  jetzt: 'now',
  notizen: 'notes',
  impressum: 'legal-notice',
  datenschutz: 'privacy',
};
export const EN_SLUGS_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(EN_SLUGS).map(([de, en]) => [en, de]),
);

/**
 * Übersetzt das erste Segment eines locale-neutralen Pfads in den Slug der
 * Ziel-Sprache ('/projekte/lager' → '/projects/lager' für en, unverändert für de).
 */
export function localizedSlugPath(locale: Locale, path: string): string {
  if (locale !== 'en' || !path) return path;
  const parts = path.split('/');
  const seg = parts[1];
  const mapped = seg ? EN_SLUGS[seg] : undefined;
  if (mapped) parts[1] = mapped;
  return parts.join('/');
}

/**
 * Präfixiert einen internen Pfad mit der Locale. Externe URLs (http/mailto) und
 * bereits präfixierte Pfade bleiben unangetastet.
 *   localePath('de', '/')          → '/de'
 *   localePath('en', '/projekte')  → '/en/projects'
 */
export function localePath(locale: Locale, path: string): string {
  if (/^https?:\/\//.test(path) || path.startsWith('mailto:') || path.startsWith('#')) {
    return path;
  }
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean === '/') return `/${locale}`;
  // Schon präfixiert? (z.B. versehentlich /de/... übergeben)
  const seg = clean.split('/')[1];
  if (isLocale(seg)) return clean;
  return `/${locale}${localizedSlugPath(locale, clean)}`;
}

/** Sprache aus dem ersten Pfad-Segment lesen (oder DEFAULT_LOCALE). */
export function localeFromPath(pathname: string): Locale {
  const seg = pathname.split('/')[1];
  return asLocale(seg);
}

/**
 * Metadata-`alternates` für eine Seite: locale-korrekte canonical + hreflang
 * (de/en/x-default). `path` ist der locale-neutrale Pfad ('' = Root, '/toolbox' …).
 * Verhindert stale, unpräfixierte Canonicals auf den Unterseiten.
 */
export function localeAlternates(
  locale: Locale,
  path: string,
): { canonical: string; languages: Record<string, string> } {
  const suffix = path === '/' || path === '' ? '' : path;
  const enSuffix = localizedSlugPath('en', suffix);
  return {
    canonical: `/${locale}${locale === 'en' ? enSuffix : suffix}`,
    languages: {
      de: `/de${suffix}`,
      en: `/en${enSuffix}`,
      'x-default': `/de${suffix}`,
    },
  };
}

/** Menschliche Labels für den Umschalter. */
export const LOCALE_LABELS: Record<Locale, { short: string; name: string }> = {
  de: { short: 'DE', name: 'Deutsch' },
  en: { short: 'EN', name: 'English' },
};
