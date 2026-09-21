import type { Metadata } from 'next';
import Link from 'next/link';

import { getZiel } from '@/lib/cv';
import { getAbout, FEATURED_PROJECT_IDS, type Project } from '@/lib/projects';
import { previewIds } from '@/lib/previews';
import { DIENSTE_PROSA, formatAge, getProof, type Proof } from '@/lib/proof';
import { getLiveStatus, type LiveStatus } from '@/lib/live-status';
import { getNotes, type Note } from '@/lib/notes';
import { getProjects } from '@/lib/store';
import { CV_OEFFENTLICH, PROOF_PUBLIC_LINKS, SITE_URL } from '@/lib/site';
import {
  asLocale,
  localeAlternates,
  localeOpenGraph,
  localePath,
  type Locale,
} from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { CountUp } from '../components/CountUp';
import { Footer } from '../components/Footer';
import { HeroConstellation } from '../components/HeroConstellation';
import { ProjectCardCompact } from '../components/ProjectCard';
import { Reveal } from '../components/Reveal';
import { ServiceMatrix } from '../components/ServiceMatrix';
import { Spotlight } from '../components/Spotlight';
import { CommandEyebrow, Prompt, TermCursor, WindowBar } from '../components/Terminal';
import { TopBar } from '../components/TopBar';

// ISR: statisch prerendert, alle 5 min revalidiert (relativer deployed-Badge).
export const revalidate = 300;

const HOME_DESC: Record<Locale, { description: string; og: string }> = {
  de: {
    description: `Sami Djouhri baut und betreibt eigene Systeme: ein gehärtetes Homelab mit ${DIENSTE_PROSA.de.klein} Diensten, dazu eigene Suiten und lokale AI, wo sie trägt.`,
    og: `${DIENSTE_PROSA.de.gross} selbst betriebene Dienste, gehärtet und dokumentiert. Infrastruktur, Betrieb und Automation, selbst aufgebaut.`,
  },
  en: {
    description:
      'Sami Djouhri builds and runs his own systems: a hardened homelab backbone, operations and automation, plus his own suites and local AI where it earns its place. All of it set up and run myself.',
    og: `${DIENSTE_PROSA.en.gross} self-run services, visible hardening and documented care. Infrastructure, operations and automation, set up myself.`,
  },
};

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale = asLocale(params.locale);
  return {
    description: HOME_DESC[locale].description,
    openGraph: localeOpenGraph(locale, '', HOME_DESC[locale].og, getAbout(locale).name),
    alternates: localeAlternates(locale, ''),
  };
}

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const allProjects = await getProjects();
  const featured = FEATURED_PROJECT_IDS.map((id) => allProjects.find((p) => p.id === id)).filter(
    (p): p is Project => Boolean(p),
  );
  const proof = getProof();
  const live = await getLiveStatus();
  const deployedLabel = proof.deployed ? formatAge(proof.deployed.age_hours, locale) : null;
  const previewSet = new Set(previewIds(featured));
  // Zwei reichen. Drei wären eine Liste, und eine Liste will vollständig sein.
  const letzteNotizen = getNotes(locale).slice(0, 2);

  return (
    <div className="relative">
      <TopBar active="/" locale={locale} />

      <main id="main" className="mx-auto max-w-5xl px-6 pt-16 sm:px-8">
        {/* Der Beweis steht IM Hero, nicht als Dashboard darunter: die Kernzahl ist das
            Argument dieser Seite, und sie gehört neben den Namen, nicht hinter einen
            Absatz Selbstbeschreibung. Der frühere eigenständige ProofStrip ist deshalb
            in das Live-Panel der rechten Hero-Spalte aufgegangen. */}
        <Hero
          locale={locale}
          deployed={deployedLabel}
          proof={proof}
          live={live}
          // Kuratierte Allowlist statt „alles was live ist“, Begründung in lib/site.ts.
          liveUrls={PROOF_PUBLIC_LINKS}
        />
        {/* Dreisatz seit 2026-09-14: erst was läuft (Live-Panel im Hero), dann
            was zuletzt passiert ist, dann was gebaut wurde. Der mittlere Schritt
            fehlte, und mit ihm das Einzige, was Betrieb über Zeit belegt: ein
            Zustand lässt sich behaupten, eine Reihe datierter Vorfälle nicht. */}
        <AusDemBetrieb locale={locale} notes={letzteNotizen} />
        <FeaturedProjects locale={locale} projects={featured} previewSet={previewSet} />
        <Cta locale={locale} />
      </main>

      <Footer locale={locale} />
    </div>
  );
}

function Hero({
  locale,
  deployed,
  proof,
  live,
  liveUrls,
}: {
  locale: Locale;
  deployed: string | null;
  proof: Proof;
  live: LiveStatus;
  liveUrls: readonly string[];
}) {
  const about = getAbout(locale);
  return (
    <section className="pb-16 pt-4 sm:pt-8">
      {/* Orchestrierter Boot, die eine Signatur: der Prompt „tippt“ (boot-cmd),
          danach assemblieren sich Name, Rolle und eine funktionale System-Zeile
          gestaffelt (Stagger via animationDelay). whoami → Identität „bootet“ sich
          zusammen. Reines CSS, reduced-motion/print zeigen alles sofort.
          LCP-Disziplin: das H1 nutzt boot-ANCHOR (nur transform-Settle, opacity
          bleibt 1) → der LCP-Kandidat wird bei First Paint gemalt; nur die
          kleineren Zeilen darunter faden per boot-rise. */}
      <div className="mt-4">
        <Prompt path="~" command="whoami" typing className="text-sm" />
      </div>

      <div className="mt-3 border-l border-border/60 pl-4 sm:pl-5">
        <h1
          className="boot-anchor font-display text-display-hero"
          style={{ animationDelay: '0.1s' }}
        >
          {about.name}.
        </h1>

        <p
          className="boot-rise mt-3 font-mono text-sm uppercase tracking-widest text-accent/90"
          style={{ animationDelay: '0.5s' }}
        >
          <span className="text-muted-dim">// </span>
          {about.role}
          <TermCursor accent />
        </p>

        {/* ★★ Die gesuchte Position, sichtbar für Menschen.
            Sie stand bis zum 2026-08-31 ausschließlich auf /cv. Seit der
            Lebenslauf abgeschaltet ist, trug sie nur noch das `seeks`-Feld der
            strukturierten Daten, also ausschließlich Maschinen: gemessen am
            Live-HTML kamen „Festanstellung“, „Junior“ und „IT-Administrator“ auf
            KEINER öffentlichen Seite im sichtbaren Text vor. Auf einer Seite, die
            um eine Anstellung wirbt, ist das die eine Zeile, ohne die der Rest
            egal ist (ZIELBILD: „Recruiter erkennt in unter 30 Sekunden, dass die
            Rolle passt“).
            Quelle ist `getZiel()` aus lib/cv.ts, dieselbe, die das JSON-LD speist:
            eine Wahrheit, zwei Ausgaben. Sie hängt bewusst NICHT an
            CV_OEFFENTLICH, das Ziel gilt auch ohne veröffentlichten Lebenslauf. */}
        {/* ★ Hängender Einzug (`pl-5 -indent-5`) statt `flex flex-wrap`.
            Mit Flex ist der Satz EIN Flex-Item: passt er nicht neben den Marker,
            rutscht er komplett in die nächste Zeile und das `›` steht allein
            darüber. Auf 320 px war genau das der Fall. Inline im Textfluss bricht
            der Satz dagegen wortweise um, und der negative Erstzeilen-Einzug hält
            die Folgezeilen unter dem Text statt unter dem Marker. */}
        <p
          className="boot-rise mt-4 pl-5 -indent-5 text-base leading-snug"
          style={{ animationDelay: '0.65s' }}
        >
          <span aria-hidden className="font-mono text-term">
            ›{' '}
          </span>
          <span className="text-text">{getZiel(locale).satz}</span>
        </p>

        {/* System-Zeile: funktionales Phosphor-Grün (online/ok) stützt die
            Eigentums-These. Sie wiederholt bewusst NICHT die Zahlen des Live-Panels
            rechts daneben, auch nicht das Deploy-Alter, das dort gemessen steht. */}
        <p
          className="boot-rise mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[0.7rem] uppercase tracking-widest"
          style={{ animationDelay: '0.8s' }}
        >
          {/* Trennzeichen hängen HINTEN am jeweiligen Segment, nicht vorn am
              nächsten: auf schmalen Geräten bricht die Zeile um, und ein „·“ am
              Zeilenanfang liest sich wie ein verirrter Aufzählungspunkt. So kann
              es höchstens am Zeilenende stehen, wo es „geht weiter“ bedeutet.
              `whitespace-nowrap` hält jedes Segment als Einheit zusammen. */}
          {/* ★ Hier stand bis zum 2026-09-12 ein zweites Segment „selbst gehostet &
              betrieben". Das ist Haltung, keine Systemmeldung, und es war die
              zweite von neun Stellen, an denen dieselbe Seite dasselbe Motiv
              wiederholte (allein „selbst" 7 mal, Owner-Befund: wirkt zwanghaft).
              Eine Boot-Zeile meldet einen Zustand. Das Argument steht eine
              Bildschirmhoehe tiefer in Tagline und Bio, wo es begruendet wird. */}
          <span className="inline-flex items-center gap-2 whitespace-nowrap text-term">
            <span className="status-dot status-dot--live" aria-hidden />
            {t(locale, 'hero.boot.online')}
          </span>
        </p>
      </div>

      {/* Reihenfolge dreht auf Mobil: gestapelt stünde der Beweis sonst hinter Tagline,
          Bio, drei Knöpfen und der Meta-Zeile, also weit unter dem Fold, und der ganze
          Sinn des Umbaus wäre auf Telefonen genau umgekehrt. Oben zuerst der gemessene
          Zustand, danach die These und ihre Begründung. */}
      <div className="mt-10 grid gap-10 md:grid-cols-12">
        <div className="order-2 md:order-1 md:col-span-7">
          <p className="font-display text-2xl italic leading-snug text-accent glow-text sm:text-[1.75rem]">
            {about.tagline}
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">{about.bio}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={localePath(locale, '/projekte')}
              className="group inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg transition-all hover:bg-accent-bright hover:shadow-glow active:translate-y-px"
            >
              {t(locale, 'action.viewProjects')}
              <span aria-hidden className="nudge-x">→</span>
            </Link>
            <Link
              href={localePath(locale, '/kontakt')}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm text-text transition-colors hover:border-border-strong hover:text-accent"
            >
              {t(locale, 'action.contact')}
            </Link>
            {/* Dritter Knopf hängt am Schalter CV_OEFFENTLICH (lib/site.ts). */}
            {CV_OEFFENTLICH && (
              <Link
                href={localePath(locale, '/cv')}
                className="group inline-flex items-center px-2 py-2 text-sm text-muted hover:text-text"
              >
                {t(locale, 'action.cv')}
                <span aria-hidden className="nudge-x ml-1.5">→</span>
              </Link>
            )}
          </div>

          {/* Fängt die Recruiter-Angaben der früheren „~/profil“-Karte auf: dieselbe
              Information, aber als Fußnote statt als halbe Bildschirmseite. Die Karte
              war fünf Zeilen ungeprüfte Selbstauskunft an der wertvollsten Stelle der
              Seite, dort steht jetzt der gemessene Beweis. */}
          <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.7rem] uppercase tracking-widest text-muted-dim">
            <span className="whitespace-nowrap">{about.location}</span>
            <span aria-hidden>·</span>
            <span className="whitespace-nowrap">{t(locale, 'hero.meta.languages')}</span>
            <span aria-hidden>·</span>
            <span className="whitespace-nowrap">{t(locale, 'hero.row.modeValue')}</span>
          </p>
        </div>

        <aside className="relative isolate order-1 md:order-2 md:col-span-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-1 -top-24 -z-10 hidden h-60 w-80 opacity-70 [mask-image:radial-gradient(72%_72%_at_70%_26%,#000,transparent)] md:block"
          >
            <HeroConstellation />
          </div>
          <LivePanel
            locale={locale}
            proof={proof}
            live={live}
            deployedLabel={deployed}
            liveUrls={liveUrls}
          />
        </aside>
      </div>
    </section>
  );
}

/**
 * Live-Beweis als Hero-Panel (früher der eigenständige ProofStrip unter dem Hero).
 *
 * Steht bewusst in der rechten Hero-Spalte, wo vorher eine „~/profil“-Karte mit fünf
 * Zeilen Selbstauskunft saß: an der wertvollsten Stelle der Seite gehört das, was ein
 * Besucher nachprüfen kann, nicht das, was er glauben soll.
 *
 * KEIN Reveal/ScanReveal hier, das Panel steht über dem Fold (Doktrin: Reveal nur
 * unter-dem-Fold, sonst Hidden-bis-Hydration-Flash). Stattdessen läuft es als letzte
 * Stufe der Boot-Sequenz mit ein, passend zur Signatur der Landing.
 */
function LivePanel({
  locale,
  proof,
  live,
  deployedLabel,
  liveUrls,
}: {
  locale: Locale;
  proof: Proof;
  live: LiveStatus;
  deployedLabel: string | null;
  liveUrls: readonly string[];
}) {
  const { services, drift, hosts, measured } = proof;
  return (
    <div
      className="boot-rise relative z-10 overflow-hidden rounded-lg border border-border bg-surface/90 shadow-panel"
      style={{ animationDelay: '0.95s' }}
    >
      <WindowBar
        title="live --watch"
        right={
          // Ehrlichkeit: der grüne „online“-Puls erscheint NUR, wenn der externe
          // Watchdog gerade wirklich gemessen hat. Sonst ein neutraler
          // „Momentaufnahme“-Marker (statische Selbstauskunft), nie fälschlich „live“.
          live.reachable ? (
            <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-term">
              <span className="status-dot status-dot--live" aria-hidden />
              {t(locale, 'home.proof.online')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
              <span className="status-dot status-dot--pivot" aria-hidden />
              {t(locale, 'home.proof.snapshot')}
            </span>
          )
        }
      />

      {/* Kernaussage: erst das BILD, dann die Zahl als seine Beschriftung.
          Vorher stand hier nur die Zahl, man musste sie lesen und dann in eine
          Vorstellung übersetzen. Die Matrix zeigt Größenordnung und Gesundheit im
          selben Blick; die Zahl daneben belegt sie exakt. */}
      <div className="border-b border-border bg-bg/40 px-5 py-6">
        <p className="label">{t(locale, 'home.proof.running')}</p>
        <div className="mt-3">
          <ServiceMatrix services={services} drift={drift ?? 0} id="hero" />
        </div>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="stat-minor text-term glow-term">
            <CountUp to={services} />
          </span>
          {/* ★ Der Drift erscheint NUR, wenn er gemessen wurde. Bis 2026-08-27 stand
              hier fest „0 Drift in der Service-Map" aus einer Konstanten: waehrend der
              Live-Check zweistellige Abweichungen fand. Lieber keine Zahl als eine
              erfundene: fehlt die Messung, nennt die Zeile nur die Dienste. */}
          <span className="text-sm leading-snug text-muted">
            {t(locale, 'home.proof.servicesLive')}
            {drift !== null ? (
              <>
                {' · '}
                <span className={drift > 0 ? 'text-accent' : 'text-term'}>{drift}</span>{' '}
                {t(locale, 'home.proof.driftSuffix')}
              </>
            ) : null}
          </span>
        </div>
        {/* Frische der Messung. Ohne Zeitstempel ist eine Zahl eine Behauptung,
            genau der Fehler, den dieses Panel bis 2026-08-27 gemacht hat. Ist die
            Messung aelter als MAX_FRISCHE_H, sagt die Zeile „Momentaufnahme" statt
            „gemessen", damit alte Daten nicht wie frische aussehen. */}
        {measured ? (
          <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
            <span aria-hidden className={measured.stale ? 'text-muted-dim' : 'text-term'}>
              ›{' '}
            </span>
            {measured.stale
              ? `${t(locale, 'home.proof.snapshot')} · ${formatAge(measured.age_hours, locale)}`
              : `${t(locale, 'home.proof.selfMeasured')} ${formatAge(measured.age_hours, locale)}`}
          </p>
        ) : null}

        {/* Der Beweis wird nachpruefbar statt nur lesbar: dieselben Zahlen liegen
            als JSON offen. Wer einem Betriebs-Portfolio nicht glaubt, soll es
            abfragen koennen, das ist billiger als jedes weitere Adjektiv.
            `/api/proof` ist deshalb in app/robots.ts von der /api/-Sperre
            ausgenommen. `select-all` macht den Befehl mit einem Klick kopierbar. */}
        <p className="mt-4 select-all break-all rounded-md border border-border/60 bg-bg/60 px-3 py-2 font-mono text-[0.7rem] text-muted-dim">
          <span aria-hidden className="text-term">$ </span>
          curl {SITE_URL.replace(/^https?:\/\//, '')}/api/proof
        </p>
      </div>

      {/* Kontext in einer Zeile statt in eigenen Kacheln: das Panel ist schmal, und
          Hosts/Jahr stützen die Kernzahl, sie konkurrieren nicht mit ihr. */}
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-border px-5 py-3 font-mono text-[0.7rem] uppercase tracking-widest text-muted-dim">
        <span className="whitespace-nowrap">
          <span className="nums text-text/90">{hosts}</span> {t(locale, 'home.proof.hosts')}
        </span>
        <span aria-hidden>·</span>
        <span className="whitespace-nowrap">
          {t(locale, 'home.proof.since')} <span className="nums text-text/90">2024</span>
        </span>
        <span aria-hidden>·</span>
        <span className="whitespace-nowrap">{t(locale, 'home.proof.hostRoles')}</span>
      </p>

      {/* Extern gemessen: der eigentliche Beleg, weil er nicht von hier kommt. */}
      {live.reachable ? (
        <div className="border-b border-border px-5 py-3 font-mono text-xs">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span aria-hidden className="text-term">›</span>
            <span className="uppercase tracking-widest text-muted-dim">
              {t(locale, 'home.proof.measured')}
            </span>
            <span className="text-term">
              <span className="nums">
                {live.up}/{live.total}
              </span>{' '}
              {t(locale, 'home.proof.reachableLive')}
            </span>
            {live.uptimePct !== null ? (
              <span className="text-muted">
                · <span className="nums text-text/90">{live.uptimePct}%</span>
              </span>
            ) : null}
          </div>
          <a
            href={live.statusUrl}
            target="_blank"
            rel="noreferrer"
            className="group mt-1 inline-flex items-center gap-1 py-1 text-muted-dim transition-colors hover:text-accent"
          >
            {live.statusUrl.replace(/^https?:\/\//, '')}
            <span aria-hidden className="nudge-x">↗</span>
          </a>
        </div>
      ) : null}

      {/* Deploy-Alter: die Seite selbst als jüngster Betriebsnachweis. */}
      {deployedLabel ? (
        <p className="flex items-center gap-2 border-b border-border px-5 py-2.5 font-mono text-[0.7rem] uppercase tracking-widest text-muted-dim">
          <span aria-hidden className="text-term">›</span>
          {t(locale, 'home.proof.lastDeploy')} {deployedLabel}
        </p>
      ) : null}

      {liveUrls.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-3 font-mono text-xs">
          <span className="uppercase tracking-widest text-muted-dim">
            {t(locale, 'home.proof.publicReachable')}
          </span>
          {liveUrls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 py-1 text-term transition-colors hover:text-accent"
            >
              <span className="status-dot status-dot--live" aria-hidden />
              {url.replace(/^https?:\/\//, '')} ↗
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * „Aus dem Betrieb": die zwei jüngsten Logbuch-Einträge.
 *
 * Bewusst zwischen Beweis und Projekten: das Live-Panel zeigt einen Zustand,
 * und ein Zustand ist eine Momentaufnahme, die man behaupten kann. Zwei
 * datierte Vorfälle mit Ausgang zeigen dasselbe über Zeit, und das ist für
 * eine Rolle im Betrieb das eigentliche Argument.
 *
 * ★ Bis 2026-09-16 stand hier ein zweiter Ausgang zur Seite `/betrieb`. Die ist
 * entfallen (Begründung in `lib/notes.ts`), der Abschnitt führt seitdem nur noch
 * ins Logbuch. Der Name der Sektion bleibt, er benennt die Achse, nicht die Route.
 *
 * Kein eigenes Bewegungselement: `Reveal` reicht, das Budget der Landing ist
 * mit der Boot-Sequenz bereits ausgeschöpft.
 */
function AusDemBetrieb({ locale, notes }: { locale: Locale; notes: Note[] }) {
  if (notes.length === 0) return null;
  const en = locale === 'en';
  return (
    <section className="pt-24">
      <SectionHead
        command="tail -n 2 ~/logbuch"
        title={en ? 'From running it' : 'Aus dem Betrieb'}
        index="01"
      />
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
        {en
          ? 'Building it is the smaller half. These are the last two things that went wrong, what I had assumed beforehand, and what came out of it.'
          : 'Bauen ist die kleinere Hälfte. Das hier sind die letzten beiden Dinge, die schiefgingen, was ich vorher vermutet hatte und was dabei herauskam.'}
      </p>
      <Reveal as="ul" stagger className="mt-8 divide-y divide-border/60 overflow-hidden rounded-lg border border-border bg-surface/40">
        {notes.map((n) => (
          <li key={n.slug}>
            <Link
              href={localePath(locale, `/notizen/${n.slug}`)}
              className="group block p-5 transition-colors hover:bg-surface-2/40 sm:p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-display text-xl leading-snug text-text transition-colors group-hover:text-accent">
                  {n.title}
                </h3>
                <time
                  dateTime={n.date}
                  className="whitespace-nowrap font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim"
                >
                  {n.date}
                </time>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{n.teaser}</p>
            </Link>
          </li>
        ))}
      </Reveal>
      <div className="mt-6 font-mono text-xs uppercase tracking-widest">
        <Link href={localePath(locale, '/notizen')} className="group text-muted hover:text-accent">
          <span aria-hidden className="text-term group-hover:text-accent">›</span>{' '}
          {en ? 'all entries' : 'alle Einträge'}
          <span aria-hidden className="nudge-x ml-1.5">→</span>
        </Link>
      </div>
    </section>
  );
}

function SectionHead({ command, title, index }: { command: string; title: string; index: string }) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-border pb-4">
      <div>
        <CommandEyebrow>{command}</CommandEyebrow>
        <h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">{title}</h2>
      </div>
      <span aria-hidden className="hidden font-mono text-sm text-term/80 sm:block">[{index}]</span>
    </div>
  );
}

function FeaturedProjects({
  locale,
  projects,
  previewSet,
}: {
  locale: Locale;
  projects: Project[];
  previewSet: Set<string>;
}) {
  return (
    <section className="pt-24">
      <SectionHead
        command="ls projekte/ --featured"
        title={t(locale, 'home.featured.title')}
        index="02"
      />
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
        {t(locale, 'home.featured.lead')}
      </p>
      <Reveal as="div" stagger className="mt-8 grid gap-4 md:grid-cols-3">
        {projects.map((p) => (
          <ProjectCardCompact
            key={p.id}
            project={p}
            locale={locale}
            featured
            hasPreview={previewSet.has(p.id)}
          />
        ))}
      </Reveal>
      <div className="mt-6 text-right font-mono text-xs uppercase tracking-widest">
        <Link href={localePath(locale, '/projekte')} className="group text-muted hover:text-accent">
          {t(locale, 'action.allProjects')}
          <span aria-hidden className="nudge-x ml-1.5">→</span>
        </Link>
      </div>
    </section>
  );
}

function Cta({ locale }: { locale: Locale }) {
  const about = getAbout(locale);
  return (
    <section className="pt-24 pb-32">
      <Reveal>
        <Spotlight className="block overflow-hidden rounded-lg border border-border bg-surface/60">
          <WindowBar title={'mail -s "Hallo" sami'} />
          <div className="grid gap-8 p-8 sm:p-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <CommandEyebrow>./kontakt.sh</CommandEyebrow>
              <h2 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl">
                {t(locale, 'home.cta.headline')}
              </h2>
              {/* Die gesuchte Position steht hier nicht als Text, sondern kommt aus
                  getZiel() (lib/cv.ts), derselben Quelle wie Hero und JSON-LD. Ein
                  zweitgepflegter Satz wuerde beim naechsten Rollenwechsel genau an
                  einer der drei Stellen stehen bleiben. */}
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
                <span className="text-text">{getZiel(locale).satz}</span>
                {t(locale, 'home.cta.bodyZiel')} {t(locale, 'home.cta.body')}
              </p>
            </div>
            <div className="flex flex-col gap-3 md:col-span-5 md:items-stretch md:justify-center">
              <Link
                href={localePath(locale, '/kontakt')}
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-bg transition-all hover:bg-accent-bright hover:shadow-glow active:translate-y-px"
              >
                {t(locale, 'action.toContactForm')}
                <span aria-hidden className="nudge-x">→</span>
              </Link>
              <a
                href={`mailto:${about.contact.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-bg px-5 py-3 font-mono text-sm text-text transition-colors hover:border-border-strong hover:text-accent"
              >
                {about.contact.email}
              </a>
              {CV_OEFFENTLICH && (
                <Link
                  href={localePath(locale, '/cv')}
                  className="group text-center font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
                >
                  {t(locale, 'action.cv')}
                  <span aria-hidden className="nudge-x ml-1.5">→</span>
                </Link>
              )}
            </div>
          </div>
        </Spotlight>
      </Reveal>
    </section>
  );
}
