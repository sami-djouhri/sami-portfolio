import type { Metadata } from 'next';
import Link from 'next/link';

import {
  asLocale,
  localeAlternates,
  localeOpenGraph,
  localePath,
  type Locale,
} from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { getAbout, getFocus } from '@/lib/projects';
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
    openGraph: localeOpenGraph(
      locale,
      '/jetzt',
      locale === 'en'
        ? 'An honest snapshot: what is actively running, what comes next and what is still in design.'
        : 'Woran ich gerade arbeite und was als Nächstes ansteht.',
      getAbout(locale).name,
    ),
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
  // Nur Status zeigen, die es gerade WIRKLICH gibt. Eine Spalte, die „00“ ausweist,
  // belegt ein Drittel der Statuszeile, um mitzuteilen, dass es nichts mitzuteilen
  // gibt. Faellt ein Status weg, schrumpft das Raster mit, die Klassennamen stehen
  // literal da, weil Tailwind zusammengesetzte Namen nicht erzeugt.
  const counts = STATUS_ORDER.map((s) => ({
    status: s,
    n: focus.filter((f) => f.status === s).length,
  })).filter((c) => c.n > 0);
  const countsGrid =
    counts.length >= 3 ? 'sm:grid-cols-3' : counts.length === 2 ? 'sm:grid-cols-2' : '';

  return (
    <div className="relative">
      <TopBar active="/jetzt" locale={locale} />

      <main id="main" className="mx-auto max-w-3xl px-6 pb-32 pt-12 sm:px-8 sm:pt-16">
        {/* ★ `ml-auto w-auto` statt `w-full`: über die volle Breite gezogen lief das
            Band waagerecht durch die Überschrift und ließ sie durchgestrichen
            aussehen (gemessen auf 1440 px, die Linie kreuzte den Titel auf halber
            Versalhöhe). Dieselbe Lösung wie auf /toolbox: die Grafik
            beginnt rechts neben dem Text. */}
        <HeaderVisual visual={<PulseBand className="ml-auto h-full w-auto opacity-60" />}>
          <PageHeader
            eyebrow="systemctl status sami"
            title={en ? 'Where things stand.' : 'Wo ich gerade stehe.'}
            /* Der englische Lead nannte bis 2026-08-27 „some things in design“,
               waehrend der Zaehler direkt darunter dafuer `00` auswies. Eine Seite,
               deren Anspruch „gemessen statt behauptet“ ist, darf sich nicht auf dem
               eigenen Bildschirm widersprechen. Beide Fassungen nennen jetzt nur,
               was die Liste auch belegen kann. */
            lead={
              en
                ? 'What I am actually working on right now, and what comes next. This page changes more often than the rest of the site.'
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
          <dl className={`grid gap-px bg-border ${countsGrid}`}>
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

        {/* Prosaische Momentaufnahme: ORDNET die Liste darüber ein, wiederholt sie nicht.
            Vorher standen hier `description`-Felder WORTWÖRTLICH ein zweites Mal auf
            derselben Seite (drei Absätze, je ~50 Wörter Dopplung), auf einer Seite,
            deren Kritik „zu textlastig“ lautet, der teuerste Text überhaupt.
            Ebenfalls raus: `.toLowerCase()` auf den deutschen Zweigen. Im Englischen
            hält es den Satzfluss, im Deutschen zerstört es die Substantiv-
            Großschreibung („nachschlagewerk, karte, adress-suche“).
            Die Satzschablone nennt den Titel jetzt als eigenständige Nennung, die
            Titel sind ganze Sätze („Dienste laufen lassen, wenn sie gebraucht
            werden“), die alte Fassung setzte sie in eine Schablone für Substantive
            und ergab „… gebraucht werden weiter ausbauen, Domäne für Domäne“. */}
        <section className="mt-16">
          <CommandEyebrow>cat momentaufnahme.md</CommandEyebrow>
          <div className="prose-editorial mt-6">
            <p>
              {en
                ? 'That is the whole list, and it is deliberately short. I would rather finish a few things properly than juggle many at once. Twenty bullet points would be quicker to write and worth less to read.'
                : 'Das ist die ganze Liste, und sie ist bewusst kurz. Ich bringe lieber wenige Dinge zu Ende, als an vielen gleichzeitig zu arbeiten. Zwanzig Punkte wären schneller geschrieben und weniger wert.'}
            </p>
            {/* Verweist auf Position statt auf Titel. Bis 2026-08-27 nannte dieser
                Abschnitt `aktiv[0].title`, `aktiv[1].title` und `naechstes.title`
                woertlich: dieselben Ueberschriften, die direkt darueber in der Liste
                stehen, und der Status „als Naechstes“ zusaetzlich als Abzeichen. Die
                Runde davor hatte die `description`-Dopplung entfernt und die
                Titel-Dopplung stehen lassen. Eine Momentaufnahme soll die Liste
                einordnen; wiederholen kann sie sich selbst. */}
            <p>
              {aktiv.length > 1
                ? en
                  ? 'The first one runs through almost every working day. The second is the one I enjoy most. What is not on here is usually intent, not forgetfulness.'
                  : 'Der erste Punkt zieht sich durch fast jeden Werktag. Am meisten Spaß macht mir der zweite. Was hier nicht steht, fehlt meist mit Absicht.'
                : en
                  ? 'What is not on here is usually intent, not forgetfulness.'
                  : 'Was hier nicht steht, fehlt meist mit Absicht.'}
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
