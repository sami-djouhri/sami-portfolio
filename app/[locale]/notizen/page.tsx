/**
 * Logbuch, Übersicht.
 *
 * Seit 2026-09-14 veröffentlicht: Nav-Eintrag im TopBar, in app/sitemap.ts, im
 * Feed, ohne `noindex`. Vorher lag die Route absichtlich unverlinkt als
 * Review-Zwischenstand herum.
 *
 * Diese Rubrik trägt die Betriebs-Achse der Seite: der Rest zeigt, was gebaut
 * wurde, hier steht, was im Betrieb passiert ist und wie damit umgegangen
 * wurde. Ein Eintrag alle paar Wochen ist normal und richtig; was diese Seite
 * nicht verspricht, ist Echtzeit.
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import { asLocale, localeAlternates, localePath, LOCALES } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { BETRIEB_GRENZEN, getNotes } from '@/lib/notes';
import { Footer } from '../../components/Footer';
import { Reveal } from '../../components/Reveal';
import { PageHeader } from '../../components/SectionHeader';
import { HeaderVisual } from '../../components/graphics/HeaderVisual';
import { PulseBand } from '../../components/graphics/PulseBand';
import { CommandEyebrow, WindowBar } from '../../components/Terminal';
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
    title: en ? 'Logbook' : 'Logbuch',
    description: en
      ? 'Operations notes from real incidents: problem, approach, result, and what stuck. Detours included.'
      : 'Betriebs-Notizen aus echten Vorfällen: Problem, Vorgehen, Ergebnis, und was hängen blieb. Die Irrwege bleiben drin.',
    alternates: localeAlternates(locale, '/notizen'),
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
  const grenzen = BETRIEB_GRENZEN[locale];

  return (
    <div className="relative">
      <TopBar active="/notizen" locale={locale} />

      <main id="main" className="mx-auto max-w-3xl px-6 pb-32 pt-12 sm:px-8 sm:pt-16">
        {/* ★ `ml-auto w-auto` statt `w-full`: über die volle Breite gezogen lief das
            Band waagerecht durch die Überschrift und ließ sie durchgestrichen
            aussehen (gemessen auf 1440 px, die Linie kreuzte den Titel auf halber
            Versalhöhe). Dieselbe Lösung wie auf /toolbox: die Grafik beginnt
            rechts neben dem Text. */}
        <HeaderVisual visual={<PulseBand className="ml-auto h-full w-auto opacity-60" />}>
          <PageHeader
            eyebrow="ls -lt ~/logbuch"
            title={en ? 'What broke, and what I did about it.' : 'Was kaputt war, und was ich getan habe.'}
            lead={
              en
                ? 'Notes from real incidents while running all this. Each one follows the same shape: the problem, how I narrowed it down, what came out, and the part worth remembering. No heroics, and the wrong turns stay in. An entry every few weeks, not a feed.'
                : 'Notizen aus echten Vorfällen im laufenden Betrieb. Jede folgt derselben Form: das Problem, wie ich es eingegrenzt habe, was dabei herauskam, und der Teil, der bleibt. Keine Heldengeschichten, die Irrwege bleiben drin. Ein Eintrag alle paar Wochen, kein Ticker.'
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
                    {/* ★ `sm:flex-nowrap` + `shrink-0` am Datum: mit reinem
                        flex-wrap sprang das Datum bei langen Überschriften unter
                        den Titel und stand dann linksbündig, während es bei allen
                        anderen Einträgen rechts saß. Im Quelltext sah die Zeile
                        einheitlich aus, sichtbar wurde es erst im gerenderten
                        Bild. Auf schmalen Breiten darf es weiter umbrechen, dort
                        ist nebeneinander kein Platz. */}
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 sm:flex-nowrap">
                      <h2 className="flex min-w-0 items-baseline gap-2 font-mono text-base font-medium text-text">
                        <span aria-hidden className="text-accent">
                          ›
                        </span>
                        {n.title}
                      </h2>
                      <time
                        dateTime={n.date}
                        className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim sm:shrink-0"
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

        {/* Grenzen. Kam am 2026-09-16 von der entfallenen Seite /betrieb herüber
            und ist dort der einzige Abschnitt gewesen, der nicht beschrieb, was
            gut läuft, sondern was fehlt. Steht bewusst direkt unter den
            Einträgen: wer einstellt, fragt ohnehin danach, und die Antwort ist
            besser, wenn sie nicht erst herausgefragt werden muss. */}
        <section className="mt-16">
          <CommandEyebrow>cat grenzen.md</CommandEyebrow>
          <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface/40">
            <WindowBar title={en ? '~/limits' : '~/grenzen'} />
            <div className="p-5 sm:p-6">
              <p className="text-sm leading-relaxed text-text/90">
                {en
                  ? 'What this does not cover, stated before anyone has to ask:'
                  : 'Was das hier nicht abdeckt, gesagt bevor jemand fragen muss:'}
              </p>
              <ul className="mt-4 space-y-3">
                {grenzen.map((g) => (
                  <li key={g} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <span aria-hidden className="mt-1 font-mono text-muted-dim">
                      ›
                    </span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <Link
            href={localePath(locale, '/kontakt')}
            className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
          >
            {t(locale, 'nav.kontakt')}
            <span aria-hidden className="nudge-x ml-1.5">
              →
            </span>
          </Link>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
