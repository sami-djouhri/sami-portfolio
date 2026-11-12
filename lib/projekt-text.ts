import type { Locale } from './i18n/config';
import type { Project } from './projects';

/*
 * Die Sprach-Resolver für eine Arbeit, ohne die Arbeiten selbst. Eigenes Modul seit
 * dem 2026-10-30: `ProjectCard` wird auch in der Werkliste gerendert, die eine
 * Client-Komponente ist, und ein Wert-Import aus `lib/projects.ts` legte sämtliche
 * Projekttexte beider Sprachen (rund 56 KB) in ein Paket, das jede Seite lud.
 * Hier steht deshalb nur ein Typ-Import auf `./projects`.
 */

/** Für die Anzeige aufgelöste, sprachabhängige Textfelder eines Projekts. */
export interface LocalizedProjectText {
  title: string;
  tagline: string;
  description: string;
  role: string;
  highlight: string;
}

/**
 * `year` ist eine Phrase („seit 2026“), keine Zahl, und wurde deshalb von
 * `localizedProject` nie mit übersetzt: auf /en stand das deutsche „seit“ an jeder
 * der 25 Projektkarten und zusätzlich im Zeitraum-Feld jeder Fallstudie.
 */
export function localizedYear(year: string, locale: Locale): string {
  return locale === 'en' ? year.replace(/^seit /, 'since ') : year;
}

/**
 * Löst die anzuzeigenden Textfelder für eine Sprache auf. EN fällt feldweise auf DE
 * zurück, solange keine Übersetzung vorliegt: so bleibt die Seite immer vollständig.
 */
export function localizedProject(p: Project, locale: Locale): LocalizedProjectText {
  const en = locale === 'en';
  return {
    title: en ? p.titleEn ?? p.title : p.title,
    tagline: en ? p.taglineEn ?? p.tagline : p.tagline,
    description: en ? p.descriptionEn ?? p.description : p.description,
    role: en ? p.roleEn ?? p.role : p.role,
    highlight: en ? p.highlightEn ?? p.highlight : p.highlight,
  };
}
