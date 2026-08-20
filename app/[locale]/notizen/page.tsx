/**
 * Lab-Notes, Übersicht.
 *
 * ⚠️ BEWUSST UNVERÖFFENTLICHT (Owner-Review ausstehend, Stand 2026-08-10):
 * `robots: noindex` hier und auf der Detailseite, kein Nav-Eintrag im TopBar,
 * kein Eintrag in app/sitemap.ts, kein Eintrag im Feed. Wer die URL kennt,
 * kommt rein, das ist für einen Review-Zwischenstand gewollt. Freischalten =
 * diese vier Stellen ergänzen und `noindex` entfernen.
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { asLocale, localeAlternates, localePath, LOCALES } from '@/lib/i18n/config';
import { getNotes } from '@/lib/notes';
import { Footer } from '../../components/Footer';
import { Reveal } from '../../components/Reveal';
import { PageHeader } from '../../components/SectionHeader';
import { HeaderVisual } from '../../components/graphics/HeaderVisual';
import { PulseBand } from '../../components/graphics/PulseBand';
import { WindowBar } from '../../components/Terminal';
import { TopBar } from '../../components/TopBar';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// ISR: seit 2026-08-14 werden diese Seiten statisch vorgerendert. Ohne revalidate
// wuerden sie genau einmal zur Build-Zeit gebaut und das Copyright-Jahr im Footer
// (new Date().getFullYear()) bliebe bis zum naechsten Deploy stehen.
export const revalidate = 3600;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const en = locale === 'en';
  return {
    title: en ? 'Lab notes' : 'Notizen',
    description: en
      ? 'Short operations notes from real sessions: problem, approach, result, and what stuck.'
      : 'Kurze Betriebs-Notizen aus echten Sessions: Problem, Vorgehen, Ergebnis, und was hängen blieb.',
    alternates: localeAlternates(locale, '/notizen'),
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

export default async function NotizenPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const en = locale === 'en';
  const notes = getNotes(locale);

  return (
    <div className="relative">
      <TopBar locale={locale} />

      <main id="main" className="mx-auto max-w-3xl px-6 pb-32 pt-12 sm:px-8 sm:pt-16">
        <HeaderVisual visual={<PulseBand className="h-full w-full" />}>
          <PageHeader
            eyebrow="tail -f ~/notizen"
            title={en ? 'What broke, and what I did about it.' : 'Was kaputt war, und was ich getan habe.'}
            lead={
              en
                ? 'Short notes from real sessions. Each one follows the same shape: the problem, how I narrowed it down, what came out, and the part worth remembering. No war stories, no heroics, and the wrong turns stay in.'
                : 'Kurze Notizen aus echten Sessions. Jede folgt derselben Form: das Problem, wie ich es eingegrenzt habe, was dabei herauskam, und der Teil, der bleibt. Keine Heldengeschichten, und die Irrwege bleiben drin.'
            }
            command
          />
        </HeaderVisual>

        <section className="mt-12">
          <div className="overflow-hidden rounded-lg border border-border bg-surface/40">
            <WindowBar
              title="~/notizen"
              right={
                <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
                  {notes.length.toString().padStart(2, '0')} {en ? 'entries' : 'Einträge'}
                </span>
              }
            />
            <Reveal as="ul" stagger className="divide-y divide-border/60">
              {notes.map((n) => (
                <li key={n.slug} className="transition-colors hover:bg-surface-2/40">
                  <Link href={localePath(locale, `/notizen/${n.slug}`)} className="block p-5 sm:p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h2 className="flex items-baseline gap-2 font-mono text-base font-medium text-text">
                        <span aria-hidden className="text-accent">
                          ›
                        </span>
                        {n.title}
                      </h2>
                      <time
                        dateTime={n.date}
                        className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim"
                      >
                        {formatDate(n.date, en)}
                      </time>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{n.teaser}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {n.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-md border border-border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </Link>
                </li>
              ))}
            </Reveal>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
