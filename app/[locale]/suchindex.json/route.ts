import { LOCALES, asLocale } from '@/lib/i18n/config';
import { PROJECTS, localizedProject } from '@/lib/projects';

/**
 * Volltext der Befehlspalette (⌘K) je Sprache, als Datei im Export.
 *
 * Bis 2026-11-01 gab das Layout die Beschreibungen aller Arbeiten als Prop an
 * die Palette, und damit stand rund 15 KB Text in JEDER ausgelieferten Seite
 * (HTML und RSC-Payload), auch wenn niemand die Palette oeffnet. Jetzt traegt
 * das Layout nur Titel, Tagline, Stack und Domaene; diese Datei laedt die
 * Palette beim ersten Oeffnen nach. Form: `{ [id]: beschreibung }`.
 */
export const dynamic = 'force-static';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function GET(_req: Request, { params: alle }: { params: Promise<{ locale: string }> }) {
  const locale = asLocale((await alle).locale);
  const index: Record<string, string> = {};
  for (const p of PROJECTS) index[p.id] = localizedProject(p, locale).description;
  return Response.json(index);
}
