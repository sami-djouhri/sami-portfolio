import type { Metadata } from 'next';
import Link from 'next/link';

import { asLocale, localeAlternates, localePath, type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { getFocus } from '@/lib/projects';
import { Footer } from '../../components/Footer';
import { Reveal } from '../../components/Reveal';
import { PageHeader } from '../../components/SectionHeader';
import { HeaderVisual } from '../../components/graphics/HeaderVisual';
import { PulseBand } from '../../components/graphics/PulseBand';
import { CommandEyebrow, Prompt, WindowBar } from '../../components/Terminal';
import { TopBar } from '../../components/TopBar';

// ISR: seit 2026-08-14 werden diese Seiten statisch vorgerendert. Ohne revalidate
// wuerden sie genau einmal zur Build-Zeit gebaut und das Copyright-Jahr im Footer
// (new Date().getFullYear()) bliebe bis zum naechsten Deploy stehen.
export const revalidate = 3600;

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale = asLocale(params.locale);
  return {
    title: t(locale, 'nav.jetzt'),
    description:
      locale === 'en'
        ? 'Where I stand right now: what is actively running, what comes next, what is still in design, plus an honest snapshot.'
        : 'Woran ich gerade arbeite und was als Nächstes ansteht. Ändert sich häufiger als der Rest der Seite.',
    alternates: localeAlternates(locale, '/jetzt'),
    openGraph: {
      description:
        locale === 'en'
          ? 'An honest snapshot: what is actively running, what comes next and what is still in design.'
          : 'Woran ich gerade arbeite und was als Nächstes ansteht.',
    },
  };
}

type FocusStatus = 'aktiv' | 'als-nächstes' | 'design';

// Status-Treatment: 'aktiv' = Live/OK → Phosphor-grün (term, pulsiert).
// 'als-nächstes' = in Vorbereitung → Amber. 'design' = noch unscharf →
// gedämpft/neutral. Keine weitere Akzentfarbe.
const STATUS: Record<
  FocusStatus,
  { label: string; labelEn: string; tag: string; dot: string; tagClass: string }
> = {
  aktiv: {
    label: 'gerade aktiv',
    labelEn: 'active now',
    tag: 'RUNNING',
    dot: 'status-dot status-dot--live',
    tagClass: 'text-term',
  },
  'als-nächstes': {
    label: 'als nächstes',
    labelEn: 'next up',
    tag: 'QUEUED',
    dot: 'status-dot status-dot--build',
    tagClass: 'text-accent',
  },
  design: {
    label: 'in design',
    labelEn: 'in design',
    tag: 'DRAFT',
    dot: 'status-dot status-dot--pivot',
    tagClass: 'text-muted-dim',
  },
};

function statusLabel(status: FocusStatus, locale: Locale): string {
  const s = STATUS[status];
  return locale === 'en' ? s.labelEn : s.label;
}

const STATUS_ORDER: FocusStatus[] = ['aktiv', 'als-nächstes', 'design'];

function buildLabel(): string | null {
  const raw = process.env.BUILD_TIME;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export default async function JetztPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const en = locale === 'en';
  const focus = getFocus(locale);
  const lastBuild = buildLabel();
  const aktiv = focus.filter((f) => f.status === 'aktiv');
  const naechstes = focus.find((f) => f.status === 'als-nächstes');
  const counts = STATUS_ORDER.map((s) => ({
    status: s,
    n: focus.filter((f) => f.status === s).length,
  }));

  return (
    <div className="relative">
      <TopBar active="/jetzt" locale={locale} />

      <main id="main" className="mx-auto max-w-3xl px-6 pb-32 pt-12 sm:px-8 sm:pt-16">
        <HeaderVisual visual={<PulseBand className="h-full w-full" />}>
          <PageHeader
            eyebrow="systemctl status sami"
            title={en ? 'Where things stand.' : 'Wo ich gerade stehe.'}
            lead={
              en
                ? 'An honest snapshot: some things under construction, some in design, some in the queue. Status changes land here the moment they happen.'
                : 'Hier steht, woran ich gerade tatsächlich arbeite und was als Nächstes ansteht. Der Inhalt ändert sich entsprechend häufiger als der Rest der Website.'
            }
            command
          />
        </HeaderVisual>

        {/* Zusammenfassung als Status-Zeile, wie ein Daemon-Readout. */}
        <div className="mt-12 overflow-hidden rounded-lg border border-border bg-surface/40">
          <WindowBar
            title="~/fokus"
            right={
              <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-term">
                <span className="status-dot status-dot--live" aria-hidden />
                {en ? 'active' : 'aktiv'}
              </span>
            }
          />
          <dl className="grid gap-px bg-border sm:grid-cols-3">
            {counts.map(({ status, n }) => {
              const s = STATUS[status];
              return (
                <div key={status} className="bg-bg p-5">
                  <dt className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
                    <span className={s.dot} aria-hidden />
                    {statusLabel(status, locale)}
                  </dt>
                  <dd className="mt-2 font-mono text-2xl text-text/90">
                    {n.toString().padStart(2, '0')}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        {/* Liste der Fokus-Punkte als Prozess-Readout. */}
        <section className="mt-10">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            <span aria-hidden className="text-muted-dim">$ </span>
            ps --fokus
          </p>
          <Reveal
            as="ul"
            stagger
            className="mt-5 divide-y divide-border/60 overflow-hidden rounded-lg border border-border bg-surface/40"
          >
            {focus.map((f) => {
              const s = STATUS[f.status as FocusStatus];
              return (
                <li
                  key={f.title}
                  className="p-5 transition-colors hover:bg-surface-2/40 sm:p-6"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                    <h2 className="flex items-baseline gap-2 font-mono text-base font-medium uppercase tracking-wide text-text">
                      <span aria-hidden className="text-accent">
                        ›
                      </span>
                      {f.title}
                    </h2>
                    <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest">
                      <span className={s.dot} aria-hidden />
                      <span className={s.tagClass}>{s.tag}</span>
                      <span className="text-muted-dim">· {statusLabel(f.status as FocusStatus, locale)}</span>
                    </span>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                    {f.description}
                  </p>
                  {f.projectId ? (
                    <Link
                      href={localePath(locale, `/projekte/${f.projectId}`)}
                      className="mt-3 inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-widest text-muted transition-colors hover:text-accent"
                    >
                      {en ? 'view project' : 'zum Projekt'}
                      <span aria-hidden>→</span>
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </Reveal>
        </section>

        {/* Prosaischer Momentaufnahme-Absatz, persönlicher als der Status-Readout. */}
        <section className="mt-16">
          <CommandEyebrow>cat momentaufnahme.md</CommandEyebrow>
          <div className="prose-editorial drop-cap mt-6">
            <p>
              {en ? (
                <>
                  Right now one thread runs through almost every working day:{' '}
                  {aktiv[0]?.title ?? 'my own suite'}, building it out further, one domain at a
                  time. {aktiv[0]?.description ?? ''}
                </>
              ) : (
                <>
                  Gerade zieht sich ein roter Faden durch fast jeden Werktag:{' '}
                  {aktiv[0]?.title ?? 'die eigene Suite'} weiter ausbauen, Domäne für Domäne.{' '}
                  {aktiv[0]?.description ?? ''}
                </>
              )}
            </p>
            {aktiv[1] ? (
              <p>
                {en ? (
                  <>
                    Alongside it, {aktiv[1].title} keeps running. That one is the discipline I enjoy
                    most: {aktiv[1].description?.toLowerCase()}
                  </>
                ) : (
                  <>
                    Daneben läuft {aktiv[1].title} weiter. Das ist die Disziplin, die mir am meisten
                    Spaß macht: {aktiv[1].description?.toLowerCase()}
                  </>
                )}
              </p>
            ) : null}
            {naechstes ? (
              <p>
                {en ? (
                  <>
                    What comes next is already on the table: {naechstes.title.toLowerCase()}.{' '}
                    {naechstes.description}
                  </>
                ) : (
                  <>
                    Was als Nächstes ansteht, liegt schon auf dem Tisch: {naechstes.title.toLowerCase()}.
                    {' '}
                    {naechstes.description}
                  </>
                )}
              </p>
            ) : null}
            <p>
              {en
                ? 'Beyond that I deliberately keep it quiet: better to finish a few things cleanly than juggle many balls at once. What is not listed here is usually intent, not forgetfulness.'
                : 'Mehr steht hier nicht. Ich bringe lieber wenige Dinge zu Ende, als an vielen gleichzeitig zu arbeiten. Was fehlt, fehlt meist mit Absicht.'}
            </p>
          </div>
        </section>

        {/* "Letzte Aktualisierung" als Terminal-Fußzeile. */}
        <div className="mt-14 overflow-hidden rounded-lg border border-border/60 bg-surface/40">
          <WindowBar title="~/jetzt --meta" />
          <div className="space-y-3 p-5 text-sm">
            <Prompt path="~/jetzt" command="stat --format='%y'" className="text-xs" />
            <p className="leading-relaxed text-muted-dim">
              {en
                ? 'Update rhythm: roughly monthly, by hand. If this page feels stale, it probably is. Feel free to give me a nudge.'
                : 'Aktualisierungs-Rhythmus: ca. monatlich, manuell. Wirkt diese Seite alt, ist sie es wahrscheinlich auch, dann gerne kurz anstupsen.'}
            </p>
            {lastBuild ? (
              <p className="flex items-baseline gap-2 font-mono text-xs uppercase tracking-widest text-muted-dim">
                <span aria-hidden className="text-accent/70">
                  ›
                </span>
                {en ? 'Last update' : 'Letzte Aktualisierung'}
                <span className="text-text/80">{lastBuild}</span>
              </p>
            ) : null}
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
