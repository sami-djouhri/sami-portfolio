/**
 * Lab-Note, Detailseite.
 *
 * ⚠️ BEWUSST UNVERÖFFENTLICHT, siehe Kopf von `app/[locale]/notizen/page.tsx`.
 *
 * Struktur bewusst identisch zu den Projekt-Fallstudien: Problem → Vorgehen →
 * Ergebnis → Erkenntnis, mit denselben Bausteinen (WindowBar, Reveal, Anker,
 * Lesefortschritt). Keine neue Design-Sprache.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { asLocale, localeAlternates, localePath, LOCALES, type Locale } from '@/lib/i18n/config';
import { getNote, getNoteSlugs } from '@/lib/notes';
import { AnchorCopy } from '../../../components/AnchorCopy';
import { Footer } from '../../../components/Footer';
import { ReadingProgress } from '../../../components/ReadingProgress';
import { Reveal } from '../../../components/Reveal';
import { SectionHeader } from '../../../components/SectionHeader';
import { CommandEyebrow, WindowBar } from '../../../components/Terminal';
import { TopBar } from '../../../components/TopBar';

export function generateStaticParams() {
  const slugs = getNoteSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

// ISR: seit 2026-08-14 werden diese Seiten statisch vorgerendert. Ohne revalidate
// wuerden sie genau einmal zur Build-Zeit gebaut und das Copyright-Jahr im Footer
// (new Date().getFullYear()) bliebe bis zum naechsten Deploy stehen.
export const revalidate = 3600;

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const note = getNote(params.slug, locale);
  if (!note) return { title: 'Not found', robots: { index: false, follow: false } };
  return {
    title: note.title,
    description: note.teaser,
    alternates: localeAlternates(locale, `/notizen/${note.slug}`),
    // Unveröffentlicht: nicht indexieren, solange die Freigabe aussteht.
    robots: { index: false, follow: false },
  };
}

function formatDate(iso: string, en: boolean): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(en ? 'en-GB' : 'de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Nummerierte Sektion mit kopierbarem Anker, wie auf den Projekt-Detailseiten. */
function Section({
  id,
  index,
  eyebrow,
  title,
  locale,
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pt-20">
      <SectionHeader index={index} eyebrow={eyebrow} title={title} />
      <div className="mt-3 flex justify-end">
        <AnchorCopy id={id} label={locale === 'en' ? 'copy link' : 'Link kopieren'} />
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** Liste mit Akzent-Marker statt Bullet, die sitewide Listen-Konvention. */
function MarkerList({ items }: { items: string[] }) {
  return (
    <Reveal as="ul" stagger className="space-y-4">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-base leading-relaxed text-muted">
          <span aria-hidden className="mt-1 font-mono text-accent">
            ›
          </span>
          <span>{item}</span>
        </li>
      ))}
    </Reveal>
  );
}

export default async function NotizPage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const en = locale === 'en';
  const note = getNote(params.slug, locale);
  if (!note) notFound();

  return (
    <div className="relative">
      <ReadingProgress />
      <TopBar locale={locale} />

      <main id="main" className="mx-auto max-w-3xl px-6 pb-32 pt-12 sm:px-8 sm:pt-16">
        <header className="border-b border-border pb-10">
          <CommandEyebrow>cat ~/notizen/{note.slug}.md</CommandEyebrow>
          <h1 className="mt-4 font-display text-display-page">{note.title}</h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-text/90">{note.teaser}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <time
              dateTime={note.date}
              className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim"
            >
              {formatDate(note.date, en)}
            </time>
            <ul className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </header>

        <Section
          id="problem"
          index="01"
          eyebrow="problem"
          title={en ? 'The problem' : 'Das Problem'}
          locale={locale}
        >
          <p className="prose-editorial text-base leading-relaxed text-muted">{note.problem}</p>
        </Section>

        <Section
          id="vorgehen"
          index="02"
          eyebrow="approach"
          title={en ? 'How I narrowed it down' : 'Wie ich es eingegrenzt habe'}
          locale={locale}
        >
          <MarkerList items={note.vorgehen} />
        </Section>

        <Section
          id="ergebnis"
          index="03"
          eyebrow="result"
          title={en ? 'What came out' : 'Was dabei herauskam'}
          locale={locale}
        >
          <MarkerList items={note.ergebnis} />
        </Section>

        <Section
          id="erkenntnis"
          index="04"
          eyebrow="lesson"
          title={en ? 'What stuck' : 'Was bleibt'}
          locale={locale}
        >
          <div className="overflow-hidden rounded-lg border border-border bg-surface/40">
            <WindowBar title="~/erkenntnis" />
            <blockquote className="lesson-quote p-6 text-base leading-relaxed text-text/90">
              {note.lesson}
            </blockquote>
          </div>
        </Section>

        <div className="mt-20 border-t border-border pt-8">
          <Link
            href={localePath(locale, '/notizen')}
            className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-widest text-muted transition-colors hover:text-accent"
          >
            <span aria-hidden>←</span>
            {en ? 'all notes' : 'alle Notizen'}
          </Link>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
