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
import { asLocale, localeAlternates, localePath, localizedSlugPath, LOCALES, type Locale } from '@/lib/i18n/config';
import { kurzbeschreibung } from '@/lib/seo';
import { t } from '@/lib/i18n/dict';
import { getProjectDetail, getSteckbrief } from '@/lib/fallstudien';
import type { Steckbrief as SteckbriefDaten } from '@/lib/fallstudien/typ';
import { getProject, localizedProject, localizedStackItem, localizedYear, PROJECTS, type Architecture, type Project, type ProjectDetail, type RepoLink } from '@/lib/projects';
import { SITE_URL as SITE } from '@/lib/site';

// `dynamicParams = false` seit dem 2026-10-26, und das ist die eigentliche
// Aenderung an dieser Datei. Solange der CMS-Speicher die Quelle war, konnte
// eine Arbeit zur Laufzeit dazukommen, deshalb galt `true` samt ISR-Fenster.
// Jetzt stehen alle Arbeiten in lib/projects.ts: eine unbekannte Kennung ist
// kein noch nicht gerenderter Eintrag, sondern eine falsche Adresse, und
// bekommt sofort 404 statt eines Renderversuchs.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => PROJECTS.map((p) => ({ locale, id: p.id })));
}

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string; id: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const p = getProject(params.id);
  if (!p) return { title: locale === 'en' ? 'Project not found' : 'Projekt nicht gefunden' };
  const tx = localizedProject(p, locale);
  const path = `/${locale}${localizedSlugPath(locale, `/projekte/${p.id}`)}`;
  return {
    title: tx.title,
    // Gekürzt, nicht verkettet stehen gelassen: `${tagline} ${description}`
    // ergab auf diesen Seiten 504 bis 844 Zeichen, während Suchmaschinen bei
    // etwa 155 abschneiden. Der überzählige Teil war nicht Reserve, er wurde
    // verworfen, und der sichtbare Rest endete mitten im Satz. Begründung und
    // Messwerte in lib/seo.ts.
    description: kurzbeschreibung(`${tx.tagline} ${tx.description}`),
    alternates: localeAlternates(locale, `/projekte/${p.id}`),
    openGraph: {
      title: `${tx.title}, ${tx.tagline}`,
      description: kurzbeschreibung(tx.description),
      url: path,
      type: 'article',
      locale: locale === 'en' ? 'en_US' : 'de_DE',
      // Explizit statt über die Dateikonvention: Next bildet die Bild-URL aus der
      // PHYSISCHEN Route (/en/projekte/…), der EN-Slug entsteht erst im Rewrite der
      // middleware. Das og:image der englischen Seiten zeigte dadurch auf eine 301,
      // und ein Scraper, der Weiterleitungen nicht folgt, bekam gar kein Bild.
      images: [
        { url: `${path}/og.png`, width: 1200, height: 630, alt: `${tx.title}, ${tx.tagline}` },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tx.title}, ${tx.tagline}`,
      description: kurzbeschreibung(tx.description),
    },
  };
}

function estimateReadingMinutes(project: Project) {
  // ⚠️ Rechnet bewusst weiter mit der DEUTSCHEN Fassung, auch auf /en, so wie seit
  // jeher. Der Umbau vom 2026-10-30 sollte keinen sichtbaren Wert verschieben; ob
  // /en seine eigene Lesezeit bekommt, ist eine eigene Entscheidung.
  const detail = getProjectDetail(project.id, 'de');
  const chunks: string[] = [project.tagline, project.description];
  if (detail) {
    chunks.push(detail.problem, ...detail.approach, ...detail.result);
    chunks.push(...detail.decisions.flatMap((d) => [d.title, d.body]));
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
  if (detail.limits && detail.limits.length > 0) {
    const limits = detail.limits;
    defs.push({
      id: 'grenzen',
      label: en ? 'Limits' : 'Grenzen',
      render: (i) => <Limits index={i} limits={limits} locale={locale} />,
    });
  }
  if (detail.timeline) {
    const timeline = detail.timeline;
    defs.push({
      id: 'timeline',
      label: 'Timeline',
      render: (i) => <Timeline index={i} items={timeline} locale={locale} />,
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
  const projects = PROJECTS;
  const project = getProject(params.id);
  if (!project) notFound();
  const tx = localizedProject(project, locale);
  const detail = getProjectDetail(project.id, locale);
  const readingMin = estimateReadingMinutes(project);
  const related = relatedProjects(project, projects);
  const sections = detail ? buildSections(detail, locale) : [];
  // Zwei Lesarten einer Projektseite, entschieden am 2026-10-06. Trägt das Projekt
  // einen Steckbrief, steht oben die Kurzfassung und die acht Fachabschnitte liegen
  // zusammen hinter einem Aufklapper. Ohne Steckbrief rendert die Seite wie bisher.
  // Das Inhaltsverzeichnis entfällt in der neuen Lesart bewusst: ein Sprunglink in ein
  // geschlossenes `details` führt in modernen Browsern nicht verlässlich zum Ziel, und ein
  // Verzeichnis über acht Abschnitte war genau der Blogartikel-Eindruck, der wegsollte.
  const kurz = getSteckbrief(project.id, locale);
  // Die Kennzahlen bleiben in der neuen Lesart SICHTBAR und wandern nicht in den
  // Aufklapper. Sie sind vier kurze Werte, sie belegen statt zu behaupten, und genau
  // darauf soll der Unterschied zu den Vorlagen hinauslaufen. Alles andere klappt zu.
  const kennzahlen = kurz ? detail?.metrics : undefined;
  const tiefe = kennzahlen ? sections.filter((s) => s.id !== 'kennzahlen') : sections;

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
    keywords: project.stack.map((s) => localizedStackItem(s, locale)).join(', '),
    url: `${SITE}/${locale}${localizedSlugPath(locale, `/projekte/${project.id}`)}`,
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
        item: `${SITE}/${locale}${localizedSlugPath(locale, '/projekte')}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tx.title,
        item: `${SITE}/${locale}${localizedSlugPath(locale, `/projekte/${project.id}`)}`,
      },
    ],
  };

  return (
    <div className="relative">
      <ReadingProgress />
      <TopBar active="/projekte" locale={locale} />

      <main id="main" className="mx-auto max-w-7xl px-6 pt-12 sm:px-8 sm:pt-16 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
        {/* Die Spalte links war bei jedem Projekt mit Steckbrief ein leerer
            Platzhalter: 14 rem plus 3 rem Abstand, auf die nichts kam. Am
            Bildschirmfoto vom 2026-10-09 lief damit ein Viertel der Fläche leer mit,
            während die Angaben zum Projekt als breites Band quer durch den Kopf
            liefen und den Einstieg zustellten. Jetzt stehen sie dort, wo Platz ist.
            Das `article` steht im Markup VOR der Randspalte und wird per
            `col-start` zurück an seinen Platz gesetzt. Sonst liest ein Vorleseprogramm
            erst Zeitraum, Rolle und Stack und danach erst, worum es überhaupt geht. */}
        <article className="mx-auto max-w-4xl lg:col-start-2 lg:row-start-1 lg:mx-0">
          <Crumbs title={tx.title} locale={locale} />
          <Header project={project} readingMin={readingMin} locale={locale} />
          <LivePreview project={project} locale={locale} />
          <BelegBild project={project} locale={locale} />
          {detail?.modules && detail.modules.length > 0 ? (
            <SuiteModules modules={detail.modules} locale={locale} />
          ) : null}

          {/* Fast jedes Projekt in lib/projects.ts hat eine Datei in
              lib/fallstudien/, dieser else-Zweig ist also der bewusste Fallback
              fuer kuenftige Projekte OHNE Fall-Studie (nicht toter Code). */}
          {kurz ? <SteckbriefBlock daten={kurz} locale={locale} /> : null}
          {kennzahlen && kennzahlen.length > 0 ? <KennzahlenReihe metrics={kennzahlen} /> : null}

          {detail ? (
            kurz ? (
              <TechnischeEbene anzahl={tiefe.length} locale={locale}>
                {tiefe.map((s, i) => (
                  <Fragment key={s.id}>{s.render((i + 1).toString().padStart(2, '0'))}</Fragment>
                ))}
              </TechnischeEbene>
            ) : (
              sections.map((s, i) => (
                <Fragment key={s.id}>{s.render((i + 1).toString().padStart(2, '0'))}</Fragment>
              ))
            )
          ) : (
            <EmptyDetail project={project} locale={locale} />
          )}

          {/* Unter dem Steckbrief steht EIN Verweisblock, nicht zwei. Vorher folgten
              auf die Fallstudie „Verwandt" (drei Karten) und darunter „Mehr aus dieser
              Domäne" (vier Zeilen), und weil die Verwandtschaft vor allem an der Domäne
              hängt, nannten beide weitgehend dieselben Projekte: auf der Bibliothek-Seite
              standen Saganta, Coach-Familie und Gartiko zweimal untereinander.
              Dazu trugen die Karten Fensterleisten, Status-Lampen und erzeugte
              Geometrie als Bild. Genau diese Geometrie ist der eine Marker, an dem die
              Seite nach Vorlage aussieht, und sie stand hier direkt unter dem echten
              Bildschirmfoto. Der Vergleich fiel auf derselben Seite auseinander. */}
          {kurz ? (
            <WeitereProjekte
              project={project}
              verwandt={related}
              projects={projects}
              locale={locale}
            />
          ) : (
            <>
              {related.length > 0 && <Related projects={related} locale={locale} />}
              <DomainLead
                domain={project.domain}
                excludeId={project.id}
                projects={projects}
                locale={locale}
              />
            </>
          )}

          <PrevNext prev={prev} next={next} locale={locale} />
        </article>

        {kurz ? (
          <Marginalie project={project} readingMin={readingMin} locale={locale} />
        ) : sections.length > 0 ? (
          <Toc sections={sections} locale={locale} />
        ) : (
          <div className="hidden lg:block" />
        )}
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
        aria-label={en ? `View ${localizedProject(project, locale).title} live` : `${project.title} live ansehen`}
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

/**
 * Echtes Bildschirmfoto der Anwendung, auch ohne öffentliche Adresse.
 *
 * Warum das Bild hier oben steht und nicht im Anhang. Gemessen am 2026-10-06 trugen
 * 19 von 24 Projekten statt eines Fotos erzeugte Geometrie, und das war der einzige
 * Marker, an dem die Seite nach gekaufter Vorlage aussah. Text und Farbe waren sauber.
 * Ein Beleg direkt unter der Zeile, die das Produkt benennt, beantwortet die erste
 * Frage eines Lesers („wie sieht das aus?") vor der zweiten.
 *
 * Bewusst OHNE Fensterleiste. Die gehört zur Terminal-Darstellung, und die liegt seit
 * dem Entscheid vom 2026-10-06 in der technischen Ebene. Davor steht die Seite
 * sachlich. Der helle Grund eines Buches trägt sich hier ohnehin selbst.
 *
 * Feste `width`/`height` aus den Daten statt aus dem Dateikopf wie bei `LivePreview`:
 * das Bild liegt im Repo und ändert seine Maße nicht von allein, ein Parser dafür wäre
 * eine zweite Stelle, die dasselbe weiß.
 */
function BelegBild({ project, locale }: { project: Project; locale: Locale }) {
  const b = project.beleg;
  if (!b) return null;
  // Bis zum 2026-10-17 stand hier `b.alt` und `b.unterschrift` ohne
  // Sprachwahl, die Bildunterschrift war auf `/en` also deutsch. Ein Bild
  // sieht auch mit fremdsprachiger Unterschrift aus, als sei alles in
  // Ordnung, deshalb ist das nie jemandem aufgefallen.
  const en = locale === 'en';
  return (
    <figure className="m-0 mt-12">
      <div className="overflow-hidden rounded-lg border border-border shadow-panel">
        {/* Kein next/image: der Container läuft read-only, sharp ist nicht dabei. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={b.bild}
          alt={en ? (b.altEn ?? b.alt) : b.alt}
          width={b.breite}
          height={b.hoehe}
          className="block h-auto w-full"
        />
      </div>
      <figcaption className="mt-3 max-w-[64ch] text-[0.84rem] leading-relaxed text-muted-dim">
        {en ? (b.unterschriftEn ?? b.unterschrift) : b.unterschrift}
      </figcaption>
    </figure>
  );
}

/**
 * Die Randspalte neben dem Steckbrief: Zeitraum, Rolle, Technik, Lesezeit.
 *
 * Das sind Angaben, die man NACHSIEHT, nicht liest. Im Kopf standen sie als breites
 * Band aus drei Spalten plus einer Reihe Technik-Marken zwischen der Zeile, die das
 * Produkt benennt, und der Beschreibung, die es erklärt: zwei Zentimeter Metadaten
 * genau an der Stelle, an der ein Leser weiterlesen will. Am Rand stören sie nicht und
 * sind trotzdem da.
 *
 * `sticky`, weil sie die ganze Seite über gelten. Wer im dritten Abschnitt wissen
 * will, in welcher Rolle das entstanden ist, soll nicht nach oben scrollen müssen.
 * Unterhalb von `lg` fällt sie weg statt umzubrechen. Auf dem Telefon wäre sie ein
 * zweiter Kopf vor dem eigentlichen Text; was dort zählt, steht im Steckbrief.
 */
function Marginalie({
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
  const marke = 'font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-dim';
  return (
    <aside
      aria-label={en ? 'Project facts' : 'Angaben zum Projekt'}
      className="hidden lg:col-start-1 lg:row-start-1 lg:block"
    >
      {/* Das `mt-14` setzt die erste Marke auf die Höhe der Überschrift statt auf die
          der Brotkrumen. Ohne das beginnen beide Spalten auf derselben Linie, und die
          Randspalte liest sich wie ein zweiter Seitenanfang neben dem ersten. Beim
          Scrollen hebt `sticky` den Versatz ohnehin auf. */}
      <dl className="sticky top-24 mt-14 border-l border-border pl-5">
        <dt className={marke}>{en ? 'Timeframe' : 'Zeitraum'}</dt>
        <dd className="mt-1.5 text-[0.9rem] text-text/85">{localizedYear(project.year, locale)}</dd>

        <dt className={`${marke} mt-7 block`}>{en ? 'Role' : 'Rolle'}</dt>
        <dd className="mt-1.5 text-[0.9rem] leading-snug text-text/85">{tx.role}</dd>

        <dt className={`${marke} mt-7 block`}>{en ? 'Technology' : 'Technik'}</dt>
        <dd className="mt-2">
          <ul className="space-y-1.5 font-mono text-[0.78rem] text-muted">
            {project.stack.map((s) => (
              <li key={s}>{localizedStackItem(s, locale)}</li>
            ))}
          </ul>
        </dd>

        <dt className={`${marke} mt-7 block`}>{en ? 'Reading time' : 'Lesezeit'}</dt>
        {/* Nicht `t(locale, 'meta.readingMin')`: dieser Baustein lautet „Min Lesezeit"
            und ergab unter der Marke „Lesezeit" die Zeile „4 Min Lesezeit". Ein Baustein,
            der sein eigenes Label mitbringt, taugt nicht für eine beschriftete Zeile. */}
        <dd className="mt-1.5 font-mono text-[0.78rem] text-muted-dim">
          {readingMin} {en ? 'min' : 'Min'}
        </dd>
      </dl>
    </aside>
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
  // Zwei Köpfe, eine Funktion. Projekte mit Steckbrief tragen ihre Angaben in der
  // Randspalte, ihr Kopf besteht deshalb nur noch aus Name, Zeile und Quelltext-Link.
  // Dazu fällt dort die Terminal-Zeile weg: der Owner hat am 2026-10-06 entschieden,
  // dass die Terminal-Darstellung erst in der technischen Ebene auftaucht. Sie stand
  // ohnehin direkt unter den Brotkrumen, die dasselbe schon sagen.
  const kurz = Boolean(getSteckbrief(project.id, locale));
  return (
    <header className={kurz ? '' : 'border-b border-border pb-10'}>
      {kurz ? null : (
        <CommandEyebrow>
          cat {project.domain.toLowerCase()}/{project.id}.md
        </CommandEyebrow>
      )}
      <h1 className={`font-display text-display-title ${kurz ? '' : 'mt-4'}`}>
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
        // klickbaren „live“-Link. Sonst wird eine noch nicht erreichbare Adresse als live beworben.
        (<span className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 font-mono text-sm text-muted-dim">
          {en ? 'coming soon' : 'bald erreichbar'}· {project.href.replace(/^https?:\/\//, '')}
        </span>)
      ) : null}

      {(() => {
        // Quelltext-Links: neutral/mono (NIE term-gruen, das ist fuer „live“ reserviert).
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
        // Ehrliche Rahmung: die öffentlichen Repos sind kuratierte, bereinigte
        // Auszüge aus sonst privater Infrastruktur (Snapshot-Historie, keine
        // internen Adressen/Hostnames/Geheimnisse). Das beantwortet direkt die
        // Frage, die ein technischer Reviewer beim Single-Commit-Repo stellt.
        const snippetNote = en
          ? 'Curated, sanitized excerpts from otherwise-private infrastructure: individual building blocks, published as a snapshot with no internal addresses, hostnames or secrets.'
          : 'Kuratierte, bereinigte Auszüge aus sonst privater Infrastruktur: einzelne Bausteine, als Momentaufnahme veröffentlicht, ohne interne Adressen, Hostnamen oder Geheimnisse.';
        // Genau ein Repo ohne Notiz -> kompakter Einzel-Link + ehrliche Snippet-Notiz.
        if (repos.length === 1 && first && !first.note && !first.noteEn) {
          return (
            <div className="mt-6">
              <a
                href={first.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 font-mono text-sm text-muted transition-colors hover:border-accent/60 hover:text-accent"
              >
                <span aria-hidden className="text-accent">&lt;/&gt;</span>
                {en ? 'view source' : 'Quelltext ansehen'} · {repoHost(first.url)} ↗
              </a>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-dim">{snippetNote}</p>
            </div>
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
                      <span aria-hidden className="text-term">›</span>
                      <span className="text-text group-hover:text-accent">{en ? r.labelEn ?? r.label : r.label}</span>
                      <span className="text-muted-dim">{repoHost(r.url)} ↗</span>
                    </a>
                    {note ? <p className="mt-1 text-sm text-muted-dim">{note}</p> : null}
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-border px-4 py-2.5 text-xs leading-relaxed text-muted-dim">
              {snippetNote}
            </p>
          </div>
        );
      })()}

      {/* Kein Status-Feld bei Projekten mit Steckbrief (Entscheid 2026-10-06).
          Begründung: „Live" ist eine Verfügbarkeitsaussage, und die ist für ein
          Portfolio die falsche Achse. Ein Dienst, der bewusst auf Abruf läuft oder
          gerade gestört ist, wäre dann „nicht live", und das schmälert eine Arbeit,
          die davon völlig unberührt ist. Was ein Leser hier wissen will, ist der
          ZEITRAUM, nicht der Zustand von vor fünf Minuten. Die Betriebsaussage steht
          weiterhin im Steckbrief unter „Läuft", dort als Satz mit Datum statt als
          Ampel. Projekte ohne Steckbrief behalten das Feld, bis sie umgestellt sind. */}
      {/* Die Spaltenzahl folgt der Zahl der Felder. Ohne Status-Feld blieben in der
          Viererteilung drei Angaben in schmalen Spalten stehen und die vierte leer,
          wodurch die Kennzahl auf drei Zeilen umbrach.
          Mit Steckbrief entfällt der ganze Block: Zeitraum, Rolle und Technik stehen
          in der Randspalte, und die „Kennzahl" war dort ein ganzer Satz in einem Feld
          für ein Wort. Sie sagte zudem dasselbe wie der Entschieden-Block und die
          Kennzahlen-Reihe darunter, also dreimal dieselbe Zahl auf einer Seite. */}
      {kurz ? null : (
        <>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Meta label="Status">
              <StatusChip status={project.status} locale={locale} />
            </Meta>
            <Meta label={en ? 'Timeframe' : 'Zeitraum'}>{localizedYear(project.year, locale)}</Meta>
            <Meta label={en ? 'Role' : 'Rolle'}>{tx.role}</Meta>
            <Meta label={en ? 'Metric' : 'Kennzahl'}>{tx.highlight}</Meta>
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            {project.stack.map((s) => (
              <span
                key={s}
                className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[0.7rem] text-muted transition-colors hover:border-border-strong hover:text-accent"
              >
                {localizedStackItem(s, locale)}
              </span>
            ))}
            <span className="ml-auto font-mono text-xs text-muted-dim">
              {readingMin} {t(locale, 'meta.readingMin')}
            </span>
          </div>
        </>
      )}
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
      <p className="text-lg leading-relaxed text-text/90">{text}</p>
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
      <ArchitectureDiagram architecture={architecture} locale={locale} />
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
          abgesetzt das „warum“. Linke Akzent-Kante = eine Weiche/ein Abzweig. */}
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
              <p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent/70">
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

/**
 * Zerlegt einen Kennzahl-Wert in eine führende Zahl und den Rest.
 *
 * Der Grund: `value` ist ein freier String, und die Daten enthalten beides:
 * echte Zahlen („165 über die Flotte", „0 gegen die Quelle") und reine Prosa
 * („Shell · Mail · News · Kalender · Assets · Projekt-Deck", „erwartete Marge +
 * Downside (P05 · CVaR)"). Vorher bekam JEDER dieser Werte `.stat-major`, also
 * 72–96 px Display-Serif. Eine sechsgliedrige Aufzählung in Plakatgröße ist keine
 * Kennzahl, sondern ein Satzunfall: sie brach über vier Zeilen und drückte die
 * eigentliche Aussage aus dem Blickfeld.
 *
 * Jetzt bekommt die große Typo nur, was auch eine Zahl IST; alles andere wird als
 * lesbarer Text gesetzt. Keine Daten geändert, nur richtig ausgezeichnet.
 */
function splitMetric(value: string): { num: string | null; rest: string } {
  const m = /^\s*([\d][\d.,]*\s*%?)\s*(.*)$/.exec(value);
  const num = m?.[1]?.trim();
  if (!num) return { num: null, rest: value };
  return { num, rest: m?.[2]?.trim() ?? '' };
}

function MetricCell({
  metric,
  className,
  hero = false,
}: {
  metric: { label: string; value: string };
  className: string;
  hero?: boolean;
}) {
  const { num, rest } = splitMetric(metric.value);
  return (
    <div className={`bg-surface/60 ${className}`}>
      <div className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
        {metric.label}
      </div>
      {num ? (
        <div className={hero ? 'mt-3' : 'mt-2'}>
          {/* Kennzahlen sind Messwerte → grüne Stimme. */}
          <span className={`${hero ? 'stat-major' : 'stat-minor'} nums text-term`}>{num}</span>
          {rest ? (
            <span className="ml-2 align-baseline text-sm leading-snug text-muted">{rest}</span>
          ) : null}
        </div>
      ) : (
        // Kein Zahlwert: als Text setzen, nicht als Plakat.
        <p
          className={`${hero ? 'mt-3 text-lg' : 'mt-2 text-base'} font-mono leading-snug text-text/90`}
        >
          {metric.value}
        </p>
      )}
    </div>
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
        <MetricCell metric={hero} className="p-6 sm:col-span-6" hero />
        {rest.map((m) => (
          <MetricCell key={m.label} metric={m} className="p-5 sm:col-span-3" />
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
                    className="font-mono text-[0.65rem] uppercase tracking-widest text-accent/50"
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

/**
 * Der Steckbrief: vier Zeilen, bewusst OHNE Terminal-Sprache.
 *
 * Entscheid 2026-10-06: die Kommandozeilen-Optik wandert ganz in die technische
 * Ebene. Hier oben liest ein Personaler, und für den ist „$ cat grenzen.md" eine
 * Fremdsprache. Deshalb normale Beschriftungen, normale Schrift im Wert, keine Eyebrows
 * mit Befehlen, kein Prompt.
 *
 * Die Beschriftungen bleiben dennoch in Schreibmaschinenschrift: sie sind Struktur, nicht
 * Prosa, und halten die Spalte optisch zusammen. Das ist die Typo-Regel der Seite
 * (`font-mono` für Strukturelles), nicht ein Rest der Terminal-Idee.
 */
/**
 * Der Steckbrief, gesetzt wie eine Buchseite: Marginalien links, Satzspiegel rechts.
 *
 * Warum diese Form und nicht die naheliegende. Die erste Fassung war eine
 * Definitionsliste mit Trennlinie zwischen jeder Zeile, also das Tabellen-Minimum, und
 * der Befund dazu lautete „optisch nicht professionell genug". Recherche zur
 * Spitzenklasse (Awwwards-Typography-Honors 2026) sagt übereinstimmend, dass nicht
 * Effekte den Unterschied machen, sondern „confident editorial typography" und
 * Übergänge, die sich nicht in den Vordergrund spielen. Die Hebel sind Schriftwahl,
 * Zeilenlänge, Durchschuss und Laufweite.
 *
 * Die Form kommt aus dem Gegenstand, nicht aus einem Baukasten:
 *   - Die Beschriftungen stehen als MARGINALIEN am Rand, rechtsbündig gegen die
 *     Satzkante, wie Randbemerkungen in einem gesetzten Buch. Eine Tabelle hätte
 *     Zeilenlinien, ein Buch hat eine Satzkante. Deshalb EINE durchgehende Haarlinie
 *     längs statt vieler quer.
 *   - Die Textspalte ist auf `66ch` begrenzt. Das ist keine gewählte Zahl: das
 *     Bibliothek-Projekt hat seine Zeilenlänge an einem deutschen Musterabsatz
 *     nachgemessen und kommt auf 66,2 Zeichen. Der Steckbrief hält damit dieselbe
 *     Regel ein, die das Projekt für seine Leseansicht ermittelt hat.
 *   - „Wozu" steht größer als der Rest. Ein Steckbrief hat eine wichtigste Zeile, und
 *     Gleichbehandlung aller Felder war genau das, was die erste Fassung flach machte.
 * Keine Animation, kein Schatten, keine zweite Farbe. Die Zurückhaltung ist die
 * Entscheidung, nicht ihr Fehlen.
 */
function SteckbriefBlock({ daten, locale }: { daten: SteckbriefDaten; locale: Locale }) {
  // Beschriftungen je Sprache seit 2026-10-30. Vorher stand hier nur Deutsch, und
  // weil der Steckbrief selbst auch nur Deutsch hatte, fiel es auf /en nicht auf.
  const en = locale === 'en';
  const marginalie = 'font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-dim';
  return (
    <section className="mt-14">
      {/* Teil 1, VORSPANN. Ohne Beschriftung und in der Display-Schrift, also
          dieselbe Rolle, die auf dieser Seite die H1 und die Pull-Quote tragen: ein
          großer menschlicher Moment. Hier stand bis 2026-10-06 die Beschriftung
          „Wozu" und derselbe Schriftgrad wie überall sonst. Beides war falsch: das
          Label machte aus einer Beschreibung eine Problemfrage, und der gleiche Grad
          machte alle vier Felder gleich wichtig. Ein Vorspann ist keine Tabellenzeile. */}
      <p className="max-w-[34ch] font-display text-[1.65rem] leading-[1.32] text-text sm:max-w-[42ch] sm:text-[2rem]">
        {daten.beschreibung}
      </p>

      {/* Teil 2, FUNKTIONEN, zweispaltig. Eine Fähigkeitsliste ist eine Menge und
          keine Abfolge, deshalb nebeneinander statt untereinander und ohne Nummern.
          Der kurze Strich ersetzt den Aufzählungspunkt, damit die linke Kante ruhig
          bleibt. Spaltenweise umbrechen (`columns`) statt Grid: so füllt sich die
          erste Spalte zuerst und die Leseordnung bleibt von oben nach unten. */}
      <div className="mt-12 border-t border-border/70 pt-7">
        <p className={marginalie}>{en ? 'Features' : 'Funktionen'}</p>
        <ul className="mt-5 gap-x-12 sm:columns-2 [&>li]:break-inside-avoid">
          {daten.funktionen.map((f) => (
            <li
              key={f}
              className="relative mb-4 max-w-[52ch] pl-5 text-[0.95rem] leading-[1.62] text-text/85 before:absolute before:left-0 before:top-[0.68em] before:h-px before:w-2.5 before:bg-term/70 before:content-['']"
            >
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Teil 3, DIE ENTSCHEIDUNG, hervorgehoben. Inhaltlich die stärkste Stelle des
          Steckbriefs, weil ein Urteil mit Begründung unstrittig eigene Leistung ist.
          Deshalb bekommt sie als einzige eine Fläche und eine Kantenmarke, und zwar
          in Amber: die Farbe gehört auf dieser Seite dem Menschen, die Maschine
          spricht grün. Die Zuordnung ist hier also kein Schmuck. */}
      {/* Die Breite sitzt am Block, nicht am Absatz. Am Bildschirmfoto lief die
          Fläche über die volle Spalte, während der Text bei 64 Zeichen umbrach: rechts
          blieb ein knappes Drittel leer stehen. Eine Hervorhebung, die zu einem Drittel
          aus Leere besteht, hebt nichts hervor. */}
      <div className="relative mt-10 max-w-[72ch] border-l-2 border-accent/70 bg-surface/40 py-6 pl-6 pr-6 sm:pl-8">
        <p className={marginalie}>{en ? 'Decided' : 'Entschieden'}</p>
        <p className="mt-3 text-[1.01rem] leading-[1.62] text-text/90">{daten.entschieden}</p>
      </div>

      {/* Teil 4, UMFANG UND BETRIEB als Datenzeile, nicht als Prosa. Zwei Angaben,
          die man nachsieht statt liest, also nebeneinander und kleiner gesetzt. */}
      <dl className="mt-10 grid gap-7 border-t border-border/70 pt-7 sm:grid-cols-2 sm:gap-10">
        <div>
          <dt className={marginalie}>{en ? 'Scope' : 'Umfang'}</dt>
          <dd className="mt-2.5 text-[0.95rem] leading-[1.6] text-text/80">{daten.umfang}</dd>
        </div>
        <div>
          <dt className={marginalie}>{en ? 'In operation' : 'Läuft'}</dt>
          <dd className="mt-2.5 text-[0.95rem] leading-[1.6] text-text/80">{daten.laeuft}</dd>
        </div>
      </dl>
    </section>
  );
}

/**
 * Die Kennzahlen in der neuen Lesart: eine ruhige Reihe gleichwertiger Werte.
 *
 * Warum nicht die bestehende `Metrics`-Sektion. Die rechnet mit einem Hauptwert
 * über sechs und je drei Spalten für den Rest. Bei vier Werten sind das 15 von zwölf
 * Spalten, der vierte bricht um und steht allein neben einer leeren Fläche. Am
 * Bildschirmfoto vom 2026-10-09 gemessen, nicht vermutet: genau so sah es aus.
 *
 * Kein Sektionskopf und keine laufende Nummer. Eine Nummerierung behauptet eine
 * Reihenfolge, und seit die Fachabschnitte hinter dem Aufklapper liegen, ist dies die
 * einzige Sektion davor. Eine „01" ohne „02" ist eine Zählung von einem.
 */
function KennzahlenReihe({ metrics }: { metrics: { label: string; value: string }[] }) {
  return (
    <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-border/70 pt-7 lg:grid-cols-4">
      {metrics.map((m) => {
        const { num, rest } = splitMetric(m.value);
        return (
          <div key={m.label}>
            <dt className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-dim">
              {m.label}
            </dt>
            <dd className="mt-2.5">
              {num ? (
                <>
                  {/* Messwerte sprechen grün, so wie überall sonst auf der Seite. */}
                  <span className="nums font-display text-[1.75rem] leading-none text-term">
                    {num}
                  </span>
                  {rest ? (
                    <span className="ml-2 text-[0.88rem] leading-snug text-muted">{rest}</span>
                  ) : null}
                </>
              ) : (
                <span className="text-[0.95rem] leading-[1.5] text-text/80">{m.value}</span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/**
 * Die technische Ebene: alle Fachabschnitte zusammen hinter einem Aufklapper.
 *
 * `details`/`summary` statt eines Schalters in JavaScript. Die Seite hat am 2026-10-02
 * Beobachter und Zustands-Gate für das Einblenden abgebaut; einen neuen Client-Zustand
 * dafür wieder einzuführen wäre ein Rückschritt. Der Aufklapper funktioniert ohne
 * JavaScript, überlebt „Seite drucken" und ist für Vorleseprogramme ein bekanntes Muster.
 *
 * `open` beim Drucken erzwingen wäre schön, geht aber nicht in CSS. Stattdessen hebt
 * `print:block` den geschlossenen Zustand im Ausdruck auf, damit eine gedruckte
 * Projektseite vollständig ist.
 */
function TechnischeEbene({ anzahl, locale, children }: { anzahl: number; locale: Locale; children: React.ReactNode }) {
  const en = locale === 'en';
  return (
    <details className="group mt-14 [&[open]]:pb-2">
      {/* Am Bildschirmfoto vom 2026-10-09 war der Aufklapper kaum als Bedienelement
          zu erkennen: eine Zeile Kleinschrift zwischen zwei Abständen, die sich wie
          eine Fußnote las. Jetzt eine volle Leiste mit Rahmen, Fläche und einem
          Pluszeichen rechts, das beim Öffnen zum Minus wird. Das ist der einzige
          Schalter auf der Seite und darf als solcher aussehen. */}
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md border border-border bg-surface/40 px-5 py-4 transition-colors hover:border-accent/60 hover:bg-surface/70 focus-visible:border-accent">
        <span className="min-w-0">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-text/90">
            {en ? 'Technical layer' : 'Technische Ebene'}
          </span>
          <span className="mt-1 block text-[0.84rem] leading-snug text-muted">
            {en
              ? `Architecture, decisions and limits, ${anzahl} sections`
              : `Architektur, Entscheidungen und Grenzen, ${anzahl} Abschnitte`}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="relative h-4 w-4 shrink-0 text-accent before:absolute before:left-0 before:top-1/2 before:h-px before:w-4 before:-translate-y-1/2 before:bg-current before:content-[''] after:absolute after:left-1/2 after:top-0 after:h-4 after:w-px after:-translate-x-1/2 after:bg-current after:transition-transform after:content-[''] group-open:after:scale-y-0 motion-reduce:after:transition-none"
        />
      </summary>
      <div className="print:block">{children}</div>
    </details>
  );
}

function Limits({ index, limits, locale }: { index: string; limits: string[]; locale: Locale }) {
  return (
    <Section
      id="grenzen"
      index={index}
      eyebrow="cat grenzen.md"
      title={locale === 'en' ? 'Limits' : 'Grenzen'}
      locale={locale}
    >
      {/* Ehrliche Selbstauskunft über die Grenzen des Baus (Eigenbetrieb, kein
          Produktions-/Team-Kontext behauptet). Bewusst zurückgenommen: gestrichelte
          Kante + muted Marker = eine Grenze, kein Werbe-Panel. Genau das, was ein
          skeptischer Reviewer als Erstes sucht: kennt die Person die Grenzen? */}
      <ul className="space-y-3">
        {limits.map((l, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-lg border border-dashed border-border bg-surface/40 p-4"
          >
            <span aria-hidden className="mt-0.5 shrink-0 font-mono text-muted-dim">›</span>
            <p className="text-sm leading-relaxed text-muted">{l}</p>
          </li>
        ))}
      </ul>
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
    <aside
      aria-label={en ? 'Table of contents' : 'Inhalt dieser Seite'}
      className="hidden lg:col-start-1 lg:row-start-1 lg:block"
    >
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
                <span aria-hidden className="text-term/70 group-hover:text-accent">›</span>
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
 * Macht das „ein Login, viele Apps“-Bild scanbar, statt es nur in der Prosa zu
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
                The full case study for {localizedProject(project, locale).title} is in progress. The entry is already in the
                overview; problem, approach and decisions will follow over the coming weeks.
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
                schon in der Übersicht, Problem, Vorgehen und Entscheidungen ziehen in den
                kommenden Wochen ein.
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
    : `${siblings.length} ${siblings.length === 1 ? 'weiteres Projekt' : 'weitere Projekte'} unter`;
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
                <span aria-hidden className="mt-0.5 font-mono text-term/70 group-hover:text-accent">›</span>
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

/**
 * Der eine Verweisblock unter einem Steckbrief.
 *
 * Zuerst die Projekte derselben Domäne, dann aufgefüllt aus der Verwandtschaft über
 * den Stack. Beide Quellen überschneiden sich stark, weil dieselbe Domäne in der
 * Bewertung am schwersten wiegt; deshalb wird hier zusammengeführt statt zweimal
 * gelistet.
 *
 * Keine Bilder. Ein Verweis braucht keines, und die erzeugte Geometrie der Karten
 * wäre neben einem echten Bildschirmfoto der schwächste Teil der Seite.
 */
function WeitereProjekte({
  project,
  verwandt,
  projects,
  locale,
}: {
  project: Project;
  verwandt: Project[];
  projects: Project[];
  locale: Locale;
}) {
  const en = locale === 'en';
  const geschwister = projects.filter((p) => p.domain === project.domain && p.id !== project.id);
  const bekannt = new Set(geschwister.map((p) => p.id));
  const liste = [...geschwister, ...verwandt.filter((p) => !bekannt.has(p.id))].slice(0, 4);
  if (liste.length === 0) return null;
  return (
    <section
      className="mt-20 border-t border-border/70 pt-7"
      aria-label={en ? 'More projects' : 'Weitere Projekte'}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-dim">
          {en ? 'More projects' : 'Weitere Projekte'}
          <span className="px-2 text-border-strong" aria-hidden>
            ·
          </span>
          <Link
            href={localePath(locale, `/projekte#domain-${project.domain.toLowerCase()}`)}
            className="normal-case tracking-normal text-muted hover:text-accent"
          >
            {project.domain}
          </Link>
        </p>
        <Link
          href={localePath(locale, '/projekte')}
          className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted-dim hover:text-accent"
        >
          {t(locale, 'action.allProjects')} →
        </Link>
      </div>
      <ul className="mt-6 grid gap-x-12 gap-y-6 sm:grid-cols-2">
        {liste.map((p) => {
          const px = localizedProject(p, locale);
          return (
            <li key={p.id}>
              <Link href={localePath(locale, `/projekte/${p.id}`)} className="group block">
                <span className="block font-display text-lg leading-tight text-text transition-colors group-hover:text-accent">
                  {px.title}
                </span>
                <span className="mt-1.5 block max-w-[46ch] text-[0.88rem] leading-relaxed text-muted">
                  {px.tagline}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
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
      <Reveal as="div" stagger className="mt-6 grid gap-4 md:grid-cols-3">
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
