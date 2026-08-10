import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';

import { AnchorCopy } from '../../../components/AnchorCopy';
import { ArchitectureDiagram } from '../../../components/ArchitectureDiagram';
import { Footer } from '../../../components/Footer';
import { JsonLd } from '../../../components/JsonLd';
import { ProjectCardCompact } from '../../../components/ProjectCard';
import { ReadingProgress } from '../../../components/ReadingProgress';
import { Reveal } from '../../../components/Reveal';
import { ScanReveal } from '../../../components/ScanReveal';
import { StatusChip } from '../../../components/StatusBadge';
import { CommandEyebrow, WindowBar } from '../../../components/Terminal';
import { TopBar } from '../../../components/TopBar';
import { asLocale, localePath, LOCALES, type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { getProjectDetail, PROJECT_DETAILS } from '@/lib/project-details';
import { localizedProject, type Architecture, type Project, type ProjectDetail, type RepoLink } from '@/lib/projects';
import { SITE_URL as SITE } from '@/lib/site';
import { getProject, getProjects } from '@/lib/store';

// ISR + dynamicParams: zur Build-Zeit aus dem Store prerendert, neue CMS-Projekte
// werden on-demand gerendert, gelöschte fallen nach Revalidation auf 404.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const ids = (await getProjects()).map((p) => p.id);
  return LOCALES.flatMap((locale) => ids.map((id) => ({ locale, id })));
}

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string; id: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const p = await getProject(params.id);
  if (!p) return { title: locale === 'en' ? 'Project not found' : 'Projekt nicht gefunden' };
  const tx = localizedProject(p, locale);
  const path = `/${locale}/projekte/${p.id}`;
  return {
    title: tx.title,
    description: `${tx.tagline} ${tx.description}`,
    alternates: {
      canonical: path,
      languages: {
        de: `/de/projekte/${p.id}`,
        en: `/en/projekte/${p.id}`,
        'x-default': `/de/projekte/${p.id}`,
      },
    },
    openGraph: {
      title: `${tx.title}, ${tx.tagline}`,
      description: tx.description,
      url: path,
      type: 'article',
      locale: locale === 'en' ? 'en_US' : 'de_DE',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tx.title}, ${tx.tagline}`,
      description: tx.description,
    },
  };
}

function estimateReadingMinutes(project: Project) {
  const detail = PROJECT_DETAILS[project.id];
  const chunks: string[] = [project.tagline, project.description];
  if (detail) {
    chunks.push(detail.problem, ...detail.approach, ...detail.result);
    chunks.push(...detail.decisions.flatMap((d) => [d.title, d.body]));
    if (detail.lessons) chunks.push(...detail.lessons);
    if (detail.metrics) chunks.push(...detail.metrics.map((m) => `${m.label} ${m.value}`));
    if (detail.timeline) chunks.push(...detail.timeline.map((t) => `${t.when} ${t.what}`));
    if (detail.architecture) {
      chunks.push(detail.architecture.summary);
      chunks.push(
        ...detail.architecture.tiers.flatMap((t) => [
          t.label,
          ...t.nodes.map((n) => `${n.label} ${n.note ?? ''}`),
        ]),
      );
      if (detail.architecture.flows) {
        chunks.push(...detail.architecture.flows.map((f) => f.label ?? ''));
      }
    }
  }
  const words = chunks.join(' ').trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

function relatedProjects(project: Project, all: Project[]) {
  const others = all.filter((p) => p.id !== project.id);
  return others
    .map((p) => {
      let score = 0;
      if (p.domain === project.domain) score += 4;
      for (const s of p.stack) if (project.stack.includes(s)) score += 1;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.title.localeCompare(b.p.title))
    .slice(0, 3)
    .map((x) => x.p);
}

interface SectionDef {
  id: string;
  label: string;
  render: (index: string) => React.ReactNode;
}

/**
 * Single Source of Truth für Section-Reihenfolge UND TOC. Optionale Sektionen
 * erscheinen nur, wenn ihr Feld existiert; die Nummerierung läuft danach
 * lückenlos durch (behebt den alten 05→07-Sprung bei fehlenden Sektionen).
 */
function buildSections(detail: ProjectDetail, locale: Locale): SectionDef[] {
  const en = locale === 'en';
  const defs: SectionDef[] = [
    {
      id: 'problem',
      label: en ? 'Problem' : 'Problem',
      render: (i) => <Problem index={i} text={detail.problem} locale={locale} />,
    },
    {
      id: 'vorgehen',
      label: en ? 'Approach' : 'Vorgehen',
      render: (i) => <Approach index={i} steps={detail.approach} locale={locale} />,
    },
  ];
  if (detail.architecture) {
    const arch = detail.architecture;
    defs.push({
      id: 'architektur',
      label: en ? 'Architecture' : 'Architektur',
      render: (i) => <ArchitectureSection index={i} architecture={arch} locale={locale} />,
    });
  }
  if (detail.metrics) {
    const metrics = detail.metrics;
    defs.push({
      id: 'kennzahlen',
      label: en ? 'Metrics' : 'Kennzahlen',
      render: (i) => <Metrics index={i} metrics={metrics} locale={locale} />,
    });
  }
  defs.push({
    id: 'ergebnis',
    label: en ? 'Result' : 'Ergebnis',
    render: (i) => <Result index={i} lines={detail.result} locale={locale} />,
  });
  defs.push({
    id: 'entscheidungen',
    label: en ? 'Decisions' : 'Entscheidungen',
    render: (i) => <Decisions index={i} decisions={detail.decisions} locale={locale} />,
  });
  if (detail.timeline) {
    const timeline = detail.timeline;
    defs.push({
      id: 'timeline',
      label: 'Timeline',
      render: (i) => <Timeline index={i} items={timeline} locale={locale} />,
    });
  }
  if (detail.lessons) {
    const lessons = detail.lessons;
    defs.push({
      id: 'erkenntnisse',
      label: en ? 'Lessons' : 'Erkenntnisse',
      render: (i) => <Lessons index={i} lessons={lessons} locale={locale} />,
    });
  }
  return defs;
}

export default async function ProjectDetailPage(
  props: {
    params: Promise<{ locale: string; id: string }>;
  }
) {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const projects = await getProjects();
  const project = projects.find((p) => p.id === params.id);
  if (!project) notFound();
  const tx = localizedProject(project, locale);
  const detail = getProjectDetail(project.id, locale);
  const readingMin = estimateReadingMinutes(project);
  const related = relatedProjects(project, projects);
  const sections = detail ? buildSections(detail, locale) : [];

  const idx = projects.findIndex((p) => p.id === project.id);
  const prev = idx > 0 ? projects[idx - 1] : undefined;
  const next = idx < projects.length - 1 ? projects[idx + 1] : undefined;

  // project.year ist eine Phrase ('seit 2026'), kein ISO, Jahr extrahieren.
  const createdYear = project.year.match(/\d{4}/)?.[0];
  const buildIso = process.env.BUILD_TIME;
  const buildModified =
    buildIso && !Number.isNaN(new Date(buildIso).getTime())
      ? new Date(buildIso).toISOString()
      : undefined;

  const projectJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: tx.title,
    headline: tx.title,
    description: `${tx.tagline} ${tx.description}`,
    creator: { '@type': 'Person', name: 'Sami Djouhri' },
    author: { '@type': 'Person', name: 'Sami Djouhri' },
    inLanguage: locale,
    keywords: project.stack.join(', '),
    url: `${SITE}/${locale}/projekte/${project.id}`,
    ...(createdYear
      ? { dateCreated: `${createdYear}-01-01`, datePublished: `${createdYear}-01-01` }
      : {}),
    ...(buildModified ? { dateModified: buildModified } : {}),
    ...(detail?.architecture ? { abstract: detail.architecture.summary } : {}),
    ...(project.href || project.repo || (project.repos && project.repos.length > 0)
      ? {
          sameAs: [
            project.href,
            project.repo,
            ...(project.repos?.map((r) => r.url) ?? []),
          ].filter((u): u is string => Boolean(u)),
        }
      : {}),
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t(locale, 'nav.startseite'), item: `${SITE}/${locale}` },
      {
        '@type': 'ListItem',
        position: 2,
        name: t(locale, 'nav.projekte'),
        item: `${SITE}/${locale}/projekte`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tx.title,
        item: `${SITE}/${locale}/projekte/${project.id}`,
      },
    ],
  };

  return (
    <div className="relative">
      <ReadingProgress />
      <TopBar active="/projekte" locale={locale} />

      <main id="main" className="mx-auto max-w-7xl px-6 pt-12 sm:px-8 sm:pt-16 xl:grid xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-12">
        {sections.length > 0 ? <Toc sections={sections} locale={locale} /> : <div className="hidden xl:block" />}

        <article className="mx-auto max-w-4xl xl:mx-0">
          <Crumbs title={tx.title} locale={locale} />
          <Header project={project} readingMin={readingMin} locale={locale} />
          <LivePreview project={project} locale={locale} />
          {detail?.modules && detail.modules.length > 0 ? (
            <SuiteModules modules={detail.modules} locale={locale} />
          ) : null}

          {/* Aktuell hat jedes Projekt in lib/projects.ts einen Eintrag in
              PROJECT_DETAILS, dieser else-Zweig ist also der bewusste Fallback
              fuer kuenftige Projekte OHNE Fall-Studie (nicht toter Code). */}
          {detail ? (
            sections.map((s, i) => (
              <Fragment key={s.id}>{s.render((i + 1).toString().padStart(2, '0'))}</Fragment>
            ))
          ) : (
            <EmptyDetail project={project} locale={locale} />
          )}

          {related.length > 0 && <Related projects={related} locale={locale} />}

          <DomainLead domain={project.domain} excludeId={project.id} projects={projects} locale={locale} />

          <PrevNext prev={prev} next={next} locale={locale} />
        </article>
      </main>

      <Footer locale={locale} />
      <JsonLd data={projectJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
    </div>
  );
}

/**
 * Intrinsische Bildmaße eines WebP aus dem Datei-Header lesen (VP8/VP8L/VP8X),
 * damit der Live-Screenshot mit `width`/`height` gerendert wird und keinen
 * Layout-Shift beim Nachladen verursacht. Kein `next/image` im read-only-Container
 * (kein sharp), deshalb der schlanke Header-Parser. `undefined` = Maße unbekannt,
 * dann rendert das Bild wie bisher ohne feste Maße.
 */
function readWebpDimensions(absPath: string): { width: number; height: number } | undefined {
  try {
    const buf = readFileSync(absPath);
    if (buf.length < 30 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
      return undefined;
    }
    const fmt = buf.toString('ascii', 12, 16);
    if (fmt === 'VP8 ') {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (fmt === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (fmt === 'VP8X') {
      return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Echter Live-Screenshot als Beweis, existiert NUR für öffentliche Produkte
 * (scripts/capture-previews.sh, bewusst nie für interne Tools). Rendert nur,
 * wenn die Datei zur Build-Zeit vorliegt; sonst bleibt die Seite text-first.
 */
function LivePreview({ project, locale }: { project: Project; locale: Locale }) {
  if (!project.href) return null;
  const previewPath = join(process.cwd(), 'public', 'previews', `${project.id}.webp`);
  if (!existsSync(previewPath)) return null;
  const dims = readWebpDimensions(previewPath);
  const en = locale === 'en';
  const host = project.href.replace(/^https?:\/\//, '');
  return (
    <figure className="m-0 mt-10 overflow-hidden rounded-lg border border-border shadow-panel">
      <WindowBar
        title={host}
        right={
          <a
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-term hover:text-accent"
          >
            <span className="status-dot status-dot--live" aria-hidden />
            {en ? 'open live ↗' : 'live öffnen ↗'}
          </a>
        }
      />
      <a
        href={project.href}
        target="_blank"
        rel="noreferrer"
        aria-label={en ? `View ${project.title} live` : `${project.title} live ansehen`}
      >
        {/* Statischer Build-Zeit-Screenshot, kein next/image (kein sharp im read-only-Container) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/previews/${project.id}.webp`}
          alt={en ? `Current live screenshot of ${host}` : `Aktueller Live-Screenshot von ${host}`}
          loading="lazy"
          {...(dims ? { width: dims.width, height: dims.height } : {})}
          className="block h-auto w-full border-t border-border"
        />
      </a>
      <figcaption className="border-t border-border bg-bg/40 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
        {t(locale, 'detail.liveScreenshot')}
      </figcaption>
    </figure>
  );
}

function Crumbs({ title, locale }: { title: string; locale: Locale }) {
  return (
    <nav
      aria-label={locale === 'en' ? 'Breadcrumb' : 'Brotkrumen'}
      className="mb-8 font-mono text-xs uppercase tracking-widest text-muted-dim"
    >
      <Link href={localePath(locale, '/')} className="hover:text-accent">
        {t(locale, 'nav.startseite')}
      </Link>
      <span className="px-2 text-accent/60" aria-hidden>›</span>
      <Link href={localePath(locale, '/projekte')} className="hover:text-accent">
        {t(locale, 'nav.projekte')}
      </Link>
      <span className="px-2 text-accent/60" aria-hidden>›</span>
      <span className="text-text">{title}</span>
    </nav>
  );
}

function Header({
  project,
  readingMin,
  locale,
}: {
  project: Project;
  readingMin: number;
  locale: Locale;
}) {
  const en = locale === 'en';
  const tx = localizedProject(project, locale);
  return (
    <header className="border-b border-border pb-10">
      <CommandEyebrow>
        cat {project.domain.toLowerCase()}/{project.id}.md
      </CommandEyebrow>
      <h1 className="mt-4 font-display text-display-title">
        {tx.title}
      </h1>
      <p className="mt-4 max-w-2xl text-xl leading-relaxed text-text/90">{tx.tagline}</p>

      {project.href && project.status === 'live' ? (
        <a
          href={project.href}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-md border border-term/40 bg-term/5 px-4 py-2 font-mono text-sm text-term transition-colors hover:border-term hover:bg-term/10"
        >
          <span className="status-dot status-dot--live" aria-hidden />
          {en ? 'view live' : 'live ansehen'} · {project.href.replace(/^https?:\/\//, '')} ↗
        </a>
      ) : project.href ? (
        // Nicht-live (z.B. im-aufbau): URL nur neutral/mono zeigen, NIE grün und NIE als
        // klickbaren „live"-Link. Sonst wird eine noch nicht erreichbare Adresse als live beworben.
        (<span className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 font-mono text-sm text-muted-dim">
          {en ? 'coming soon' : 'bald erreichbar'}· {project.href.replace(/^https?:\/\//, '')}
        </span>)
      ) : null}

      {(() => {
        // Quelltext-Links: neutral/mono (NIE term-gruen, das ist fuer „live" reserviert).
        // Ein Projekt kann aus mehreren oeffentlichen Teilen bestehen (project.repos);
        // `repo` bleibt die Kurzform fuer genau ein Repo. Beides wird hier normalisiert.
        const repoHost = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '');
        const repos: RepoLink[] =
          project.repos && project.repos.length > 0
            ? project.repos
            : project.repo
              ? [{ url: project.repo, label: en ? 'source' : 'Quelltext' }]
              : [];
        if (repos.length === 0) return null;

        const first = repos[0];
        // Genau ein Repo ohne Notiz -> kompakter Einzel-Link wie bisher.
        if (repos.length === 1 && first && !first.note && !first.noteEn) {
          return (
            <a
              href={first.url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 font-mono text-sm text-muted transition-colors hover:border-accent/60 hover:text-accent"
            >
              <span aria-hidden className="text-accent">&lt;/&gt;</span>
              {en ? 'view source' : 'Quelltext ansehen'} · {repoHost(first.url)} ↗
            </a>
          );
        }

        // Mehrere Teile (oder ein Teil mit Notiz) -> Fenster-Liste, ein Teil je Zeile.
        return (
          <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface/60">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-dim">
              <span aria-hidden className="text-accent">&lt;/&gt;</span>
              {en ? 'source' : 'Quelltext'} · {repos.length}{' '}
              {repos.length === 1 ? (en ? 'part' : 'Teil') : en ? 'parts' : 'Teile'}
            </div>
            <ul className="divide-y divide-border">
              {repos.map((r) => {
                const note = en ? r.noteEn ?? r.note : r.note;
                return (
                  <li key={r.url} className="px-4 py-3">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex flex-wrap items-baseline gap-x-2 font-mono text-sm text-muted transition-colors hover:text-accent"
                    >
                      <span aria-hidden className="text-accent">›</span>
                      <span className="text-text group-hover:text-accent">{r.label}</span>
                      <span className="text-muted-dim">{repoHost(r.url)} ↗</span>
                    </a>
                    {note ? <p className="mt-1 text-sm text-muted-dim">{note}</p> : null}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })()}

      <dl className="mt-8 grid gap-6 sm:grid-cols-4">
        <Meta label="Status">
          <StatusChip status={project.status} locale={locale} />
        </Meta>
        <Meta label={en ? 'Timeframe' : 'Zeitraum'}>{project.year}</Meta>
        <Meta label={en ? 'Role' : 'Rolle'}>{tx.role}</Meta>
        <Meta label={en ? 'Metric' : 'Kennzahl'}>{tx.highlight}</Meta>
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-1.5">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[0.7rem] text-muted transition-colors hover:border-border-strong hover:text-accent"
          >
            {s}
          </span>
        ))}
        <span className="ml-auto font-mono text-xs text-muted-dim">
          {readingMin} {t(locale, 'meta.readingMin')}
        </span>
      </div>
    </header>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">{label}</dt>
      <dd className="mt-1 text-sm text-text/90">{children}</dd>
    </div>
  );
}

function Problem({ index, text, locale }: { index: string; text: string; locale: Locale }) {
  return (
    <Section id="problem" index={index} eyebrow="cat ausgangslage.md" title="Problem" locale={locale}>
      <div className="drop-cap">
        <p className="text-lg leading-relaxed text-text/90">{text}</p>
      </div>
    </Section>
  );
}

function Approach({ index, steps, locale }: { index: string; steps: string[]; locale: Locale }) {
  return (
    <Section
      id="vorgehen"
      index={index}
      eyebrow="ls -1 vorgehen/"
      title={locale === 'en' ? 'Approach' : 'Vorgehen'}
      locale={locale}
    >
      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-5">
            <span className="mt-1 font-mono text-xs text-accent/70">
              {(i + 1).toString().padStart(2, '0')}
            </span>
            <p className="text-text/90">{s}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function ArchitectureSection({
  index,
  architecture,
  locale,
}: {
  index: string;
  architecture: Architecture;
  locale: Locale;
}) {
  return (
    <Section
      id="architektur"
      index={index}
      eyebrow="tree --topology"
      title={locale === 'en' ? 'Architecture' : 'Architektur'}
      locale={locale}
    >
      <ArchitectureDiagram architecture={architecture} />
    </Section>
  );
}

function Result({ index, lines, locale }: { index: string; lines: string[]; locale: Locale }) {
  return (
    <Section
      id="ergebnis"
      index={index}
      eyebrow="cat ergebnis.log"
      title={locale === 'en' ? 'Result' : 'Ergebnis'}
      locale={locale}
    >
      <ul className="space-y-3">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 shrink-0 font-mono text-accent" aria-hidden>›</span>
            <p className="text-text/90">{l}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Decisions({
  index,
  decisions,
  locale,
}: {
  index: string;
  decisions: { title: string; body: string }[];
  locale: Locale;
}) {
  const en = locale === 'en';
  const dense = decisions.length >= 3;
  return (
    <Section
      id="entscheidungen"
      index={index}
      eyebrow="grep -r 'warum' entscheidungen/"
      title={locale === 'en' ? 'Decisions' : 'Entscheidungen'}
      locale={locale}
    >
      {/* Zwei-Ebenen-Card, die die Eyebrow einlöst: oben die Entscheidung (nummeriert,
          font-display = Aussage, kein Zitat), darunter durch eine Trennlinie
          abgesetzt das „warum". Linke Akzent-Kante = eine Weiche/ein Abzweig. */}
      <ul className={dense ? 'grid gap-5 sm:grid-cols-2' : 'space-y-6'}>
        {decisions.map((d, i) => (
          <li
            key={d.title}
            className="relative overflow-hidden rounded-lg border border-border bg-surface/60 p-6 pl-7"
          >
            <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-accent/40" />
            <div className="flex items-start gap-3">
              <span aria-hidden className="mt-1 font-mono text-xs text-accent/70">
                {(i + 1).toString().padStart(2, '0')}
              </span>
              <p className="font-display text-lg leading-snug text-text">{d.title}</p>
            </div>
            <div className="mt-4 border-t border-border/50 pt-4">
              <p className="font-mono text-[0.6rem] uppercase tracking-widest text-accent/70">
                {en ? 'why' : 'warum'}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{d.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Metrics({
  index,
  metrics,
  locale,
}: {
  index: string;
  metrics: { label: string; value: string }[];
  locale: Locale;
}) {
  const hero = metrics[0];
  if (!hero) return null;
  const rest = metrics.slice(1);
  return (
    <Section
      id="kennzahlen"
      index={index}
      eyebrow="uptime --metrics"
      title={locale === 'en' ? 'Metrics' : 'Kennzahlen'}
      locale={locale}
    >
      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border shadow-panel sm:grid-cols-12">
        <div className="bg-surface/60 p-6 sm:col-span-6">
          <div className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
            {hero.label}
          </div>
          <div className="mt-3 stat-major">{hero.value}</div>
        </div>
        {rest.map((m) => (
          <div key={m.label} className="bg-surface/60 p-5 sm:col-span-3">
            <div className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
              {m.label}
            </div>
            <div className="mt-2 stat-minor">{m.value}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Timeline({
  index,
  items,
  locale,
}: {
  index: string;
  items: { when: string; what: string }[];
  locale: Locale;
}) {
  return (
    <Section id="timeline" index={index} eyebrow="git log --oneline" title="Timeline" locale={locale}>
      {/* Echter Strang statt flacher Border-Liste: ein Knoten pro Eintrag auf einer
          durchlaufenden Linie (git-log-Metapher). Der neueste Eintrag ist der
          gefüllte Akzent-HEAD, ältere sind hohle Knoten. Alles statisch → kein
          neues Bewegungs-Budget; reduced-motion/print unberührt. */}
      <ol className="relative ml-1 border-l border-border">
        {items.map((ev, i) => {
          const isHead = i === items.length - 1;
          return (
            <li key={i} className="relative pb-8 pl-8 last:pb-0">
              <span
                aria-hidden
                className={`absolute -left-[5px] top-1 size-2.5 rounded-full border ${
                  isHead ? 'border-accent bg-accent' : 'border-border-strong bg-bg'
                }`}
              />
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="font-mono text-xs uppercase tracking-widest text-accent">
                  {ev.when}
                </span>
                {isHead ? (
                  <span
                    aria-hidden
                    className="font-mono text-[0.6rem] uppercase tracking-widest text-accent/50"
                  >
                    (HEAD)
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-text/90">{ev.what}</p>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

function Lessons({ index, lessons, locale }: { index: string; lessons: string[]; locale: Locale }) {
  return (
    <Section
      id="erkenntnisse"
      index={index}
      eyebrow="cat lessons.md"
      title={locale === 'en' ? 'Lessons' : 'Erkenntnisse'}
      locale={locale}
    >
      {/* Nummerierte Erkenntnis-Liste: behält den lesson-quote-Geist (Akzent-Kante +
          font-display-italic = das menschliche Fazit), ersetzt aber die bei einer
          Liste redundanten „…"-Zeichen durch eine mono-Nummer → scanbar, strukturiert,
          weniger Deko. */}
      <ol className="space-y-5">
        {lessons.map((l, i) => (
          <li key={i} className="flex gap-4 border-l-2 border-accent/50 pl-5">
            <span aria-hidden className="mt-1 shrink-0 font-mono text-xs text-accent/70">
              {(i + 1).toString().padStart(2, '0')}
            </span>
            <p className="font-display text-lg italic leading-snug text-text/90">{l}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Section({
  id,
  index,
  eyebrow,
  title,
  children,
  locale,
}: {
  id?: string;
  index: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  /** Nur zum Durchreichen aus den Wrappern; Titel ist bereits übersetzt. */
  locale?: Locale;
}) {
  return (
    <section id={id} className="group scroll-mt-24 pt-20">
      <div className="grid gap-4 border-b border-border pb-4 sm:grid-cols-12 sm:items-end">
        <div className="sm:col-span-1">
          <span className="section-anchor block">{index}</span>
        </div>
        <div className="sm:col-span-8">
          <CommandEyebrow>{eyebrow}</CommandEyebrow>
          <h2 className="mt-1 font-display text-4xl leading-none sm:text-5xl">
            {title}
            {id ? (
              <AnchorCopy
                id={id}
                label={locale === 'en' ? 'Copy link to this section' : 'Link zu diesem Abschnitt kopieren'}
              />
            ) : null}
          </h2>
        </div>
      </div>
      <Reveal className="mt-8">{children}</Reveal>
    </section>
  );
}

function Toc({ sections, locale }: { sections: SectionDef[]; locale: Locale }) {
  const en = locale === 'en';
  return (
    <aside aria-label={en ? 'Table of contents' : 'Inhalt dieser Seite'} className="hidden xl:block">
      <nav className="sticky top-24 border-l border-border pl-5">
        <p className="label flex items-center gap-2">
          <span aria-hidden className="text-muted-dim">$</span>
          {en ? 'Contents' : 'Inhalt'}
        </p>
        <ol className="mt-4 space-y-2.5 font-mono text-sm">
          {sections.map((it, i) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className="group flex items-baseline gap-3 text-muted transition-colors hover:text-accent"
              >
                <span aria-hidden className="text-accent/50 group-hover:text-accent">›</span>
                <span className="text-[0.65rem] text-muted-dim group-hover:text-accent">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <span>{it.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}

/**
 * Dezente Modul-Leiste für Suiten, die mehrere Apps unter einem Dach bündeln.
 * Macht das „ein Login, viele Apps"-Bild scanbar, statt es nur in der Prosa zu
 * verstecken. Rendert nur, wenn `detail.modules` gesetzt ist (aktuell Saganta).
 */
function SuiteModules({ modules, locale }: { modules: string[]; locale: Locale }) {
  const en = locale === 'en';
  return (
    <section
      aria-label={en ? 'Bundled apps' : 'Gebündelte Apps'}
      className="mt-10 overflow-hidden rounded-lg border border-border bg-surface/40"
    >
      <WindowBar
        title="ls apps/"
        right={
          <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
            {modules.length} {en ? 'apps' : 'Apps'}
          </span>
        }
      />
      <div className="p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          <span aria-hidden className="text-muted-dim">
            ›
          </span>{' '}
          {en ? 'one login, one look, these domains' : 'eine Anmeldung, ein Look, diese Domänen'}
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {modules.map((m) => (
            <li
              key={m}
              className="rounded-md border border-border bg-bg px-2.5 py-1 font-mono text-xs text-text/80"
            >
              {m}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function EmptyDetail({ project, locale }: { project: Project; locale: Locale }) {
  const en = locale === 'en';
  return (
    <section className="mt-16">
      <div className="grid gap-8 sm:grid-cols-12 sm:items-start">
        <div className="sm:col-span-3">
          <p aria-hidden className="font-display text-7xl leading-none text-accent/60">…</p>
        </div>
        <div className="sm:col-span-9">
          <CommandEyebrow>cat fallstudie.md</CommandEyebrow>
          {en ? (
            <>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-text/90">
                The full case study for {project.title} is in progress. The entry is already in the
                overview; problem, approach, decisions and lessons will follow over the coming weeks.
              </p>
              <p className="mt-4 text-sm text-muted">
                Interested in exactly this project? A short email is enough and I&apos;ll move the
                entry forward.
              </p>
            </>
          ) : (
            <>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-text/90">
                Die ausführliche Fall-Studie zu {project.title} ist in Arbeit. Der Eintrag steht
                schon in der Übersicht, Problem, Vorgehen, Entscheidungen und Lessons ziehen
                in den kommenden Wochen ein.
              </p>
              <p className="mt-4 text-sm text-muted">
                Interesse an genau diesem Projekt? Eine kurze Mail reicht, dann ziehe ich den
                Eintrag vor.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function DomainLead({
  domain,
  excludeId,
  projects,
  locale,
}: {
  domain: Project['domain'];
  excludeId: string;
  projects: Project[];
  locale: Locale;
}) {
  const en = locale === 'en';
  const siblings = projects.filter((p) => p.domain === domain && p.id !== excludeId);
  if (siblings.length === 0) return null;
  const countLead = en
    ? `${siblings.length} more project${siblings.length === 1 ? '' : 's'} under`
    : `${siblings.length} weiteres Projekt${siblings.length === 1 ? '' : 'e'} unter`;
  return (
    <ScanReveal
      as="section"
      className="mt-20 rounded-lg border border-border bg-surface/40 p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="label">{t(locale, 'detail.moreFromDomain')}</p>
          <p className="mt-2 font-display text-2xl leading-tight">
            {countLead}{' '}
            <Link
              href={localePath(locale, `/projekte#domain-${domain.toLowerCase()}`)}
              className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
            >
              / {domain}
            </Link>
          </p>
        </div>
        <Link
          href={localePath(locale, '/projekte')}
          className="font-mono text-xs uppercase tracking-widest text-muted hover:text-accent"
        >
          {t(locale, 'action.allProjects')} →
        </Link>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {siblings.slice(0, 4).map((s) => {
          const sx = localizedProject(s, locale);
          return (
            <li key={s.id}>
              <Link
                href={localePath(locale, `/projekte/${s.id}`)}
                className="group flex items-baseline gap-3 rounded-lg border border-border bg-bg p-4 transition-colors hover:border-border-strong"
              >
                <span aria-hidden className="mt-0.5 font-mono text-accent/60 group-hover:text-accent">›</span>
                <span>
                  <span className="block font-display text-lg leading-tight text-text group-hover:text-accent">
                    {sx.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{sx.tagline}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </ScanReveal>
  );
}

function Related({ projects, locale }: { projects: Project[]; locale: Locale }) {
  const en = locale === 'en';
  return (
    <section className="pt-20" aria-label={t(locale, 'detail.related')}>
      <div className="flex items-end justify-between gap-6 border-b border-border pb-3">
        <div>
          <CommandEyebrow>grep -l verwandt projekte/*</CommandEyebrow>
          <h2 className="mt-2 font-display text-2xl leading-none">{en ? 'Related' : 'Verwandt'}</h2>
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          {en ? 'Similar domain or stack' : 'Ähnliche Domäne oder Stack'}
        </span>
      </div>
      <Reveal as="div" stagger className="mt-6 grid gap-4 sm:grid-cols-3">
        {projects.map((p) => (
          <ProjectCardCompact key={p.id} project={p} locale={locale} />
        ))}
      </Reveal>
    </section>
  );
}

function PrevNext({ prev, next, locale }: { prev?: Project; next?: Project; locale: Locale }) {
  if (!prev && !next) return null;
  const en = locale === 'en';
  const prevTx = prev ? localizedProject(prev, locale) : undefined;
  const nextTx = next ? localizedProject(next, locale) : undefined;
  return (
    <nav
      aria-label={en ? 'Previous and next project' : 'Vorheriges und nächstes Projekt'}
      className="mt-20 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
    >
      {prev && prevTx ? (
        <Link
          href={localePath(locale, `/projekte/${prev.id}`)}
          className="group rounded-lg border border-border bg-surface/60 p-5 transition-colors hover:border-border-strong"
        >
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
            ← {en ? 'previous project' : 'vorheriges Projekt'}
          </p>
          <p className="mt-2 font-display text-xl text-text group-hover:text-accent">
            {prevTx.title}
          </p>
          <p className="mt-1 text-sm text-muted">{prevTx.tagline}</p>
        </Link>
      ) : (
        <span />
      )}
      {next && nextTx ? (
        <Link
          href={localePath(locale, `/projekte/${next.id}`)}
          className="group rounded-lg border border-border bg-surface/60 p-5 text-right transition-colors hover:border-border-strong"
        >
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
            {en ? 'next project' : 'nächstes Projekt'} →
          </p>
          <p className="mt-2 font-display text-xl text-text group-hover:text-accent">
            {nextTx.title}
          </p>
          <p className="mt-1 text-sm text-muted">{nextTx.tagline}</p>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
