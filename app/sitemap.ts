import type { MetadataRoute } from 'next';

import { LOCALES, localizedSlugPath } from '@/lib/i18n/config';
import { PROJECTS } from '@/lib/projects';
import { CV_OEFFENTLICH, SITE_URL as BASE } from '@/lib/site';

// Kein `revalidate`: die Liste der Arbeiten steht in lib/projects.ts und
// ändert sich nur beim Bau. Bis zum 2026-10-26 trug das ISR-Fenster neue
// Einträge aus dem CMS-Speicher nach, den es nicht mehr gibt.

// Locale-neutrale Pfade (ohne /de|/en). '' = Root. Für jeden Eintrag werden
// unten beide Sprach-URLs plus hreflang-alternates ausgegeben.
const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '', changeFrequency: 'monthly', priority: 1.0 },
  { path: '/projekte', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/uber-mich', changeFrequency: 'yearly', priority: 0.7 },
  { path: '/toolbox', changeFrequency: 'monthly', priority: 0.7 },
  // '/jetzt' und '/notizen' sind am 2026-10-15 entfallen. Beide Adressen
  // antworten jetzt mit 301 auf die Werkliste; eine Sitemap, die eine
  // Weiterleitung anmeldet, ist derselbe Indexierungsfehler wie eine, die eine
  // 404 anmeldet, und genau deshalb steht '/cv' unten am Schalter statt hier.
  // '/cv' steht bewusst NICHT fest in dieser Liste, sondern wird unten am
  // Schalter angehängt: eine Sitemap, die eine 404 anmeldet, ist ein
  // Indexierungsfehler und nicht bloß ein toter Link.
  { path: '/kontakt', changeFrequency: 'yearly', priority: 0.8 },
  { path: '/impressum', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/datenschutz', changeFrequency: 'yearly', priority: 0.2 },
  ...(CV_OEFFENTLICH
    ? [{ path: '/cv', changeFrequency: 'monthly' as const, priority: 0.6 }]
    : []),
];

/** hreflang-Alternates: pro Sprache die absolute URL mit dem Slug der Sprache. */
function languageAlternates(path: string): Record<string, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, `${BASE}/${l}${localizedSlugPath(l, path)}`]));
}

/** Ein Sitemap-Eintrag pro Sprache mit gegenseitigen alternates. */
function entriesFor(
  path: string,
  rest: Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>,
): MetadataRoute.Sitemap {
  const languages = languageAlternates(path);
  return LOCALES.map((l) => ({
    url: `${BASE}/${l}${localizedSlugPath(l, path)}`,
    alternates: { languages },
    ...rest,
  }));
}

// Statisch exportierbar, sonst bricht `output: 'export'` hier ab (seit 2026-10-30).
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Stabil pro Deploy statt Renderzeit: lastModified = jetzt bei jedem
  // Revalidate meldet Suchmaschinen dauernd "alles geändert" und entwertet
  // das Signal. BUILD_TIME ändert sich nur bei echten Deploys.
  const build = process.env.BUILD_TIME ? new Date(process.env.BUILD_TIME) : null;
  const now = build && !Number.isNaN(build.getTime()) ? build : new Date();
  const projects = PROJECTS;
  return [
    ...STATIC_ROUTES.flatMap((r) =>
      entriesFor(r.path, {
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
      }),
    ),
    ...projects.flatMap((p) =>
      entriesFor(`/projekte/${p.id}`, {
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }),
    ),
  ];
}
