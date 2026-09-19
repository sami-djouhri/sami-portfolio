import type { MetadataRoute } from 'next';

import { LOCALES, localizedSlugPath } from '@/lib/i18n/config';
import { getNote, getNoteSlugs } from '@/lib/notes';
import { CV_OEFFENTLICH, SITE_URL as BASE } from '@/lib/site';
import { getProjects } from '@/lib/store';

/** Datum eines Logbuch-Eintrags als Date, oder null bei ungültigem Wert. */
function noteDate(slug: string): Date | null {
  const note = getNote(slug, 'de');
  if (!note) return null;
  const d = new Date(note.date);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ISR, damit neue CMS-Projekte in der Sitemap landen, ohne Rebuild.
export const revalidate = 300;

// Locale-neutrale Pfade (ohne /de|/en). '' = Root. Für jeden Eintrag werden
// unten beide Sprach-URLs plus hreflang-alternates ausgegeben.
const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '', changeFrequency: 'monthly', priority: 1.0 },
  { path: '/projekte', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/uber-mich', changeFrequency: 'yearly', priority: 0.7 },
  { path: '/toolbox', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/jetzt', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/notizen', changeFrequency: 'weekly', priority: 0.8 },
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Stabil pro Deploy statt Renderzeit: lastModified = jetzt bei jedem
  // Revalidate meldet Suchmaschinen dauernd "alles geändert" und entwertet
  // das Signal. BUILD_TIME ändert sich nur bei echten Deploys.
  const build = process.env.BUILD_TIME ? new Date(process.env.BUILD_TIME) : null;
  const now = build && !Number.isNaN(build.getTime()) ? build : new Date();
  const projects = await getProjects();
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
    // Logbuch-Einträge tragen ihr eigenes Datum: sie ändern sich nach dem
    // Schreiben nicht mehr, und ein „heute geändert" bei einem Eintrag vom
    // Juli wäre genau das falsche Signal.
    ...getNoteSlugs().flatMap((slug) =>
      entriesFor(`/notizen/${slug}`, {
        lastModified: noteDate(slug) ?? now,
        changeFrequency: 'yearly' as const,
        priority: 0.6,
      }),
    ),
  ];
}
