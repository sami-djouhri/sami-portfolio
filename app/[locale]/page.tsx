import type { Metadata } from 'next';
import Link from 'next/link';

import { getAbout, FEATURED_PROJECT_IDS, type Project } from '@/lib/projects';
import { previewIds } from '@/lib/previews';
import { formatAge, getProof, type Proof } from '@/lib/proof';
import { getLiveStatus, type LiveStatus } from '@/lib/live-status';
import { getProjects } from '@/lib/store';
import { asLocale, localePath, type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { CountUp } from '../components/CountUp';
import { Footer } from '../components/Footer';
import { HeroConstellation } from '../components/HeroConstellation';
import { ProjectCardCompact } from '../components/ProjectCard';
import { Reveal } from '../components/Reveal';
import { ScanReveal } from '../components/ScanReveal';
import { Spotlight } from '../components/Spotlight';
import { CommandEyebrow, Prompt, TermCursor, WindowBar } from '../components/Terminal';
import { TopBar } from '../components/TopBar';

// ISR: statisch prerendert, alle 5 min revalidiert (relativer deployed-Badge).
export const revalidate = 300;

const HOME_DESC: Record<Locale, { description: string; og: string }> = {
  de: {
    description:
      'Sami Djouhri baut eigentumsfähige Eigen-Systeme: Productivity-Suiten, ein gehärtetes Homelab-Backbone und AI-gestützte Automation, selbst gebaut, selbst betrieben, statt Cloud-Mietabhängigkeit.',
    og: 'Eigentum statt Mietabhängigkeit: über hundert selbst betriebene Services, sichtbare Härtung und dokumentierte Sorgfalt. Infrastruktur, Suiten und Automation, selbst gebaut und betrieben.',
  },
  en: {
    description:
      'Sami Djouhri builds systems he actually owns: productivity suites, a hardened homelab backbone and AI-assisted automation, self-built and self-run instead of rented from the cloud.',
    og: 'Ownership over rental dependency: over a hundred self-run services, visible hardening and documented care. Infrastructure, suites and automation, self-built and self-run.',
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
    openGraph: { description: HOME_DESC[locale].og },
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

  return (
    <div className="relative">
      <TopBar active="/" locale={locale} />

      <main id="main" className="mx-auto max-w-5xl px-6 pt-16 sm:px-8">
        <Hero locale={locale} deployed={deployedLabel} />
        <ProofStrip
          locale={locale}
          proof={proof}
          live={live}
          deployedLabel={deployedLabel}
          liveUrls={allProjects
            .filter((p) => p.href && p.status === 'live')
            .map((p) => p.href as string)}
        />
        <FeaturedProjects locale={locale} projects={featured} previewSet={previewSet} />
        <Cta locale={locale} />
      </main>

      <Footer locale={locale} />
    </div>
  );
}

function Hero({ locale, deployed }: { locale: Locale; deployed: string | null }) {
  const about = getAbout(locale);
  return (
    <section className="pb-16 pt-4 sm:pt-8">
      {/* Orchestrierter Boot — die eine Signatur: der Prompt „tippt" (boot-cmd),
          danach assemblieren sich Name, Rolle und eine funktionale System-Zeile
          gestaffelt (Stagger via animationDelay). whoami → Identität „bootet" sich
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

        {/* System-Zeile: funktionales Phosphor-Grün (online/ok) stützt die
            Eigentums-These und wiederholt bewusst NICHT die Zahlen des
            Proof-Streifens direkt darunter. */}
        <p
          className="boot-rise mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[0.7rem] uppercase tracking-widest"
          style={{ animationDelay: '0.75s' }}
        >
          <span className="inline-flex items-center gap-2 text-term">
            <span className="status-dot status-dot--live" aria-hidden />
            {t(locale, 'hero.boot.online')}
          </span>
          <span className="text-muted-dim">· {t(locale, 'hero.boot.selfRun')}</span>
          {deployed ? (
            <span className="text-muted-dim">
              · {t(locale, 'hero.deployed')} {deployed}
            </span>
          ) : null}
        </p>
      </div>

      <div className="mt-10 grid gap-10 sm:grid-cols-12">
        <div className="sm:col-span-7">
          <p className="font-display text-2xl italic leading-snug text-accent glow-text sm:text-[1.75rem]">
            {about.tagline}
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">{about.bio}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={localePath(locale, '/projekte')}
              className="group inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg transition-all hover:bg-accent-bright hover:shadow-glow"
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
            <Link
              href={localePath(locale, '/cv')}
              className="group inline-flex items-center px-2 py-2 text-sm text-muted hover:text-text"
            >
              {t(locale, 'action.cv')}
              <span aria-hidden className="nudge-x ml-1.5">→</span>
            </Link>
          </div>
        </div>

        <aside className="relative isolate sm:col-span-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-1 -top-24 -z-10 hidden h-60 w-80 opacity-70 [mask-image:radial-gradient(72%_72%_at_70%_26%,#000,transparent)] sm:block"
          >
            <HeroConstellation />
          </div>
          <div className="relative z-10 overflow-hidden rounded-lg border border-border bg-surface/90 shadow-panel">
            <WindowBar title="~/profil" />
            <dl className="space-y-3 p-5 text-sm">
              <Row label={t(locale, 'hero.row.role')} value={about.role} />
              <Row label={t(locale, 'hero.row.location')} value={about.location} />
              <Row label={t(locale, 'hero.row.language')} value={t(locale, 'hero.row.languageValue')} />
              <Row label={t(locale, 'hero.row.mode')} value={t(locale, 'hero.row.modeValue')} />
              <Row label={t(locale, 'hero.row.focus')} value={t(locale, 'hero.row.focusValue')} />
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <dt className="font-mono text-xs uppercase tracking-widest text-muted-dim">{label}</dt>
      <dd className="text-right text-text/90">{value}</dd>
    </div>
  );
}

function ProofStrip({
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
  liveUrls: string[];
}) {
  const { services, drift, hosts } = proof;
  return (
    <ScanReveal as="section" className="overflow-hidden rounded-lg border border-border shadow-panel">
      <WindowBar
        title="live --watch"
        right={
          // Ehrlichkeit: der grüne „online"-Puls erscheint NUR, wenn Gatus die Dienste
          // gerade wirklich extern gemessen hat. Sonst ein neutraler „Momentaufnahme"-
          // Marker (statische Selbstauskunft) — nie fälschlich „live" behaupten.
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
      <div className="flex items-center gap-2 border-b border-border bg-bg/40 px-4 py-2 font-mono text-xs text-muted-dim">
        <span aria-hidden className="text-term">›</span>
        <span>
          {deployedLabel ? `${t(locale, 'home.proof.lastDeploy')} ${deployedLabel}, ` : ''}
          {t(locale, 'home.proof.selfRun')}
        </span>
      </div>
      <div className="grid gap-px bg-border sm:grid-cols-12">
        <div className="bg-bg p-6 sm:col-span-6 sm:p-8">
          <p className="label">{t(locale, 'home.proof.running')}</p>
          <div className="mt-3 stat-major text-accent glow-text">
            <CountUp to={services} />
          </div>
          <div className="mt-2 text-sm text-muted">
            {t(locale, 'home.proof.servicesLive')} · {drift} {t(locale, 'home.proof.driftSuffix')}
          </div>
        </div>
        <div className="bg-bg p-5 sm:col-span-3 sm:p-6">
          <p className="label">{t(locale, 'home.proof.hosts')}</p>
          <div className="mt-2 stat-minor nums">{hosts}</div>
          <div className="mt-1 text-xs text-muted-dim">{t(locale, 'home.proof.hostRoles')}</div>
        </div>
        <div className="bg-bg p-5 sm:col-span-3 sm:p-6">
          <p className="label">{t(locale, 'home.proof.since')}</p>
          <div className="mt-2 stat-minor nums">2024</div>
          <div className="mt-1 text-xs text-muted-dim">{t(locale, 'home.proof.sinceNote')}</div>
        </div>
      </div>
      {/* D1 Live-Beweis: echte, extern gemessene Erreichbarkeit (Gatus auf netcup). Nur
          sichtbar wenn wirklich gemessen — sonst zeigt der Streifen oben „Momentaufnahme". */}
      {live.reachable ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border bg-bg/40 px-4 py-2.5 font-mono text-xs">
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
              · {t(locale, 'home.proof.availability')}{' '}
              <span className="nums text-text/90">{live.uptimePct}%</span>
            </span>
          ) : null}
          <a
            href={live.statusUrl}
            target="_blank"
            rel="noreferrer"
            className="group ml-auto inline-flex items-center gap-1 text-muted-dim transition-colors hover:text-accent"
          >
            {live.statusUrl.replace(/^https?:\/\//, '')}
            <span aria-hidden className="nudge-x">↗</span>
          </a>
        </div>
      ) : null}
      {liveUrls.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border bg-bg/40 px-4 py-2.5 font-mono text-xs">
          <span className="uppercase tracking-widest text-muted-dim">
            {t(locale, 'home.proof.publicReachable')}
          </span>
          {liveUrls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-term transition-colors hover:text-accent"
            >
              <span className="status-dot status-dot--live" aria-hidden />
              {url.replace(/^https?:\/\//, '')} ↗
            </a>
          ))}
        </div>
      ) : null}
    </ScanReveal>
  );
}

function SectionHead({ command, title, index }: { command: string; title: string; index: string }) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-border pb-4">
      <div>
        <CommandEyebrow>{command}</CommandEyebrow>
        <h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">{title}</h2>
      </div>
      <span className="hidden font-mono text-sm text-accent/60 sm:block">[{index}]</span>
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
        index="01"
      />
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
        {t(locale, 'home.featured.lead')}
      </p>
      <Reveal as="div" stagger className="mt-8 grid gap-4 sm:grid-cols-3">
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
          <div className="grid gap-8 p-8 sm:grid-cols-12 sm:p-12">
            <div className="sm:col-span-7">
              <CommandEyebrow>./sag-hallo.sh</CommandEyebrow>
              <h2 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl">
                {t(locale, 'home.cta.headline')}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
                {t(locale, 'home.cta.body')}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:col-span-5 sm:items-stretch sm:justify-center">
              <Link
                href={localePath(locale, '/kontakt')}
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-bg transition-all hover:bg-accent-bright hover:shadow-glow"
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
              <Link
                href={localePath(locale, '/cv')}
                className="group text-center font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
              >
                {t(locale, 'action.cv')}
                <span aria-hidden className="nudge-x ml-1.5">→</span>
              </Link>
            </div>
          </div>
        </Spotlight>
      </Reveal>
    </section>
  );
}
