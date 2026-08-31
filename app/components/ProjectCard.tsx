import Link from 'next/link';

import { PROJECT_DETAILS, getProjectDetail } from '@/lib/project-details';
import { localizedProject, type Project, type ProjectStatus } from '@/lib/projects';
import { localePath, type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { ArchThumb } from './ArchThumb';
import { CardVisual } from './CardVisual';
import { DomainMark } from './DomainMark';
import { StatusBadge, StatusChip } from './StatusBadge';
import { WindowBar } from './Terminal';

function isQuiet(status: Project['status']): boolean {
  return status === 'pivot' || status === 'wartung';
}

/**
 * URL-Zeile unter der Karte. Grüner Dot + term-Farbe sind FUNKTIONAL (nur live/ok).
 */
function HrefLine({
  href,
  status,
  className = '',
}: {
  href: string;
  status: Project['status'];
  className?: string;
}) {
  const live = status === 'live';
  return (
    <p
      className={`inline-flex items-center gap-1.5 font-mono ${
        live ? 'text-term' : 'text-muted-dim'
      } ${className}`}
    >
      {live ? <span className="status-dot status-dot--live" aria-hidden /> : null}
      {href.replace(/^https?:\/\//, '')}
    </p>
  );
}

/** Schmales Vorschau-Thumbnail; nur wenn der Server-Parent `hasPreview` setzt. */
function PreviewThumb({ id }: { id: string }) {
  return (
    <div className="aspect-video overflow-hidden border-b border-border bg-bg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/previews/${id}.webp`}
        alt=""
        aria-hidden
        width={640}
        height={360}
        loading="lazy"
        className="h-full w-full object-cover object-top opacity-85 transition-opacity duration-[240ms] group-hover:opacity-100"
      />
    </div>
  );
}

/**
 * Kompakte Index-Zeile für die volle Projektliste (/projekte). Bewusst
 * scanbar statt textlastig: nur Name, Pfad, Einzeiler und Status, alles
 * Weitere (Beschreibung, Highlight, Stack, Architektur) lebt auf der
 * Detailseite. Eine ls-artige Zeile pro Projekt, nicht ein Absatz-Block.
 */
export function ProjectListItem({
  project,
  locale,
  highlightStacks,
  quietStatus,
}: {
  project: Project;
  locale: Locale;
  /** Aktive Stack-Filter: die matchenden Stacks werden dezent an der Zeile gezeigt. */
  highlightStacks?: Set<string>;
  /** Mehrheitsstatus der Gruppe: dieser Normalfall wird zurückgenommen (siehe StatusBadge). */
  quietStatus?: ProjectStatus;
}) {
  const quiet = isQuiet(project.status);
  const tx = localizedProject(project, locale);
  const matched =
    highlightStacks && highlightStacks.size > 0
      ? project.stack.filter((s) => highlightStacks.has(s))
      : [];
  return (
    <li className={`group ${quiet ? 'opacity-80' : ''}`}>
      <Link
        href={localePath(locale, `/projekte/${project.id}`)}
        className="flex flex-col gap-1.5 py-4 sm:flex-row sm:items-center sm:gap-4"
        // Die Domäne steht im Namen des Links, weil sie sichtbar nur noch als Icon
        // erscheint. Ohne das wäre die Einordnung für Screenreader ersatzlos weg.
        aria-label={`${tx.title} · ${project.domain}`}
      >
        {/* Name + Pfad: der Scan-Anker. Vorne das Domänen-Zeichen — vorher stand dort
            für JEDE Zeile dasselbe `›`, ein Zeichen ohne Aussage. Jetzt sieht man am
            Umriss, ob eine Zeile Infrastruktur, KI oder Web ist, bevor man liest.
            Der NAME hat Vorrang — vorher teilten sich Titel und Pfad eine 16-rem-
            Spalte, in der der Pfad `shrink-0` war: die Kürzung traf also immer den
            Namen („Modell…“, „Offline-Wiss…“, sechs von neun Zeilen). Jetzt darf der
            Titel umbrechen, der Pfad weicht zuerst. */}
        {/* 23rem ist gemessen, nicht geschaetzt: der groesste Bedarf (Domaenen-
            Zeichen + Titel + Pfad, beide Sprachen) liegt bei 360 px = 22,5 rem.
            Bei 21 rem brachen drei Titel zweizeilig um UND der Pfad wurde zu
            `~/modell-vermittlu…` gekappt — ein gekappter Pfad ist weder lesbar
            noch kopierbar, also die schlechteste Kombination aus beidem. Die
            Beschreibung daneben hat `line-clamp-2` und verkraftet die 32 px. */}
        <div className="flex min-w-0 items-center gap-3 sm:w-72 sm:shrink-0 lg:w-[23rem]">
          <DomainMark domain={project.domain} size="sm" />
          <h3
            className={
              quiet
                ? 'font-display text-xl leading-tight text-text/90'
                : 'font-display text-xl leading-tight text-text transition-colors group-hover:text-accent'
            }
          >
            {tx.title}
          </h3>
          <span className="hidden min-w-0 truncate font-mono text-[0.65rem] tracking-widest text-muted-dim lg:inline">
            ~/{project.id}
          </span>
        </div>

        {/* Einzeiler: was es ist. Kein `truncate` mehr — der breitere Namensraum
            nimmt der Spalte Platz weg, und ein mitten im Wort gekappter Satz
            („ohne Contai…“) ist schlechter als eine zweite Zeile. */}
        <p className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug text-muted">
          {tx.tagline}
        </p>

        {/* Passende Stacks: nur bei aktivem Stack-Filter, damit man sieht, warum die Zeile matcht. */}
        {matched.length > 0 ? (
          <div className="flex shrink-0 flex-wrap items-center gap-1">
            {matched.map((s) => (
              <span
                key={s}
                className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[0.65rem] text-accent"
              >
                {s}
              </span>
            ))}
          </div>
        ) : null}

        {/* Status + Jahr + Pfeil */}
        <div className="flex shrink-0 items-center gap-2.5">
          <StatusBadge
            status={project.status}
            locale={locale}
            suffix={project.year}
            quietWhen={quietStatus}
          />
          <span
            aria-hidden
            className="hidden text-muted-dim transition-colors group-hover:text-accent sm:inline"
          >
            →
          </span>
        </div>
      </Link>
    </li>
  );
}

export function ProjectCardCompact({
  project,
  locale,
  featured = false,
  hasPreview = false,
}: {
  project: Project;
  locale: Locale;
  featured?: boolean;
  hasPreview?: boolean;
}) {
  const isPivot = project.status === 'pivot';
  const hasCaseStudy = Boolean(PROJECT_DETAILS[project.id]);
  const tx = localizedProject(project, locale);
  const borderTone = isPivot
    ? 'border-dashed border-border'
    : featured
      ? 'border-accent/30'
      : 'border-border';

  return (
    <Link
      href={localePath(locale, `/projekte/${project.id}`)}
      className={`card-interactive group flex flex-col overflow-hidden rounded-lg border bg-surface/60 ${borderTone}`}
    >
      <WindowBar title={`~/${project.id}`} right={<StatusChip status={project.status} locale={locale} />} />

      {(() => {
        // JEDE Karte trägt ein Bild (seit 2026-08-24). Vorher bekamen nicht-featured
        // Karten `null` — die „Mehr aus dieser Domäne“-Reihe unter jeder Fallstudie
        // war dadurch eine reine Textwand. Ein Kopfbild kostet hier nichts: beide
        // Fallbacks sind gerechnetes SVG, kein Asset und kein Client-JS.
        if (hasPreview) return <PreviewThumb id={project.id} />;
        // Projektspezifisch vor generisch: existiert eine Architektur-Skizze,
        // zeigt die Karte die echte Struktur des Projekts statt des seeded
        // CardVisual-Motivs (das bleibt nur als letzter Fallback).
        const arch = getProjectDetail(project.id, locale)?.architecture;
        if (arch) return <ArchThumb architecture={arch} />;
        return <CardVisual id={project.id} domain={project.domain} />;
      })()}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3">
          <DomainMark domain={project.domain} />
          <h3 className="font-display text-2xl leading-tight text-text transition-colors group-hover:text-accent">
            {tx.title}
          </h3>
        </div>
        {/* Bewusst OHNE die Beschreibung: sie ist die Langform derselben Aussage,
            die schon in der Kurzzeile steht, und wurde auf drei Zeilen beschnitten
            („… gebraucht werden.…“). Eine Karte trägt eine Behauptung und einen
            Beleg; der Absatz gehört auf die Detailseite. */}
        <p className="mt-2 text-sm leading-relaxed text-muted">{tx.tagline}</p>

        <p className="mt-4 flex items-baseline gap-2 border-l border-accent/25 pl-3 text-sm leading-snug text-text/90">
          <span>{tx.highlight}</span>
        </p>

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap gap-1.5">
            {project.stack.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-md border border-border bg-bg px-2 py-0.5 font-mono text-[0.65rem] text-muted"
              >
                {s}
              </span>
            ))}
          </div>
          {/* `flex-wrap` + `whitespace-nowrap`: in schmalen Spalten rutscht die
              URL-Zeile als Ganzes unter das Label, statt dass das Label selbst
              mitten im Wort bricht („CAT FALL-“ / „STUDIE.MD →“). */}
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
            {hasCaseStudy ? (
              <p className="whitespace-nowrap font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim transition-colors group-hover:text-accent">
                {t(locale, 'action.caseStudy')} →
              </p>
            ) : (
              <span />
            )}
            {project.href ? (
              <HrefLine href={project.href} status={project.status} className="shrink-0 text-[0.65rem]" />
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
