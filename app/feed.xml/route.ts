import { getProjectDetail } from '@/lib/project-details';
import { localizedProject } from '@/lib/projects';
import { SITE_URL as BASE } from '@/lib/site';
import { getProjects } from '@/lib/store';
import { asLocale, localizedSlugPath } from '@/lib/i18n/config';

export const runtime = 'nodejs';
// ISR statt force-static: der Feed zieht CMS-Projekt-Änderungen nach (revalidatePath).
export const revalidate = 300;

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Stabiles pubDate pro Projekt aus dem year-Feld ('2026' / 'seit 2024').
 * Vorher war pubDate = Renderzeit für ALLE Items, bei jedem ISR-Revalidate
 * (5 min) änderten sich sämtliche Daten und Feed-Reader markierten alle
 * Einträge erneut als ungelesen.
 */
function stablePubDate(year: string): string | null {
  const m = year.match(/\d{4}/);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[0]), 0, 1)).toUTCString();
}

const CHANNEL = {
  de: {
    title: 'Sami Djouhri, Projekt-Updates',
    description: 'Updates zu Eigen-Projekten aus dem Homelab und der Suite.',
    language: 'de-DE',
    problem: 'Problem',
  },
  en: {
    title: 'Sami Djouhri, project updates',
    description: 'Updates on self-owned projects from the homelab and the suite.',
    language: 'en',
    problem: 'Problem',
  },
} as const;

/** Feed in der gewählten Sprache: `/feed.xml` (de) bzw. `/feed.xml?lang=en`. */
export async function GET(req: Request) {
  const locale = asLocale(new URL(req.url).searchParams.get('lang'));
  const ch = CHANNEL[locale];
  const buildDate = new Date().toUTCString();
  const projects = await getProjects();
  const items = projects
    .map((p) => {
      const tx = localizedProject(p, locale);
      const detail = getProjectDetail(p.id, locale);
      const description =
        `${tx.tagline} ${tx.description}` + (detail ? ` ${ch.problem}: ${detail.problem}` : '');
      const link = `${BASE}/${locale}${localizedSlugPath(locale, `/projekte/${p.id}`)}`;
      const pubDate = stablePubDate(p.year);
      return `
    <item>
      <title>${escape(tx.title)}, ${escape(tx.tagline)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escape(description)}</description>
      <category>${escape(p.domain)}</category>${pubDate ? `\n      <pubDate>${pubDate}</pubDate>` : ''}
    </item>`;
    })
    .join('');

  const self = `${BASE}/feed.xml${locale === 'en' ? '?lang=en' : ''}`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(ch.title)}</title>
    <link>${BASE}/${locale}</link>
    <description>${escape(ch.description)}</description>
    <language>${ch.language}</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
