'use client';

import { useEffect, useMemo, useState } from 'react';

import type { Domain, Project, ProjectStatus } from '@/lib/projects';
import { type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { ProjectListItem } from '../../components/ProjectCard';
import { Reveal } from '../../components/Reveal';
import { CommandEyebrow, WindowBar } from '../../components/Terminal';

const DOMAIN_ORDER: Domain[] = ['Suite', 'Infra', 'AI', 'Bots', 'Web'];

const DOMAIN_COMMAND: Record<Domain, string> = {
  Suite: 'ls suite/',
  Infra: 'systemctl status infra',
  AI: 'cat ai/*.md',
  Bots: 'ls bots/',
  Web: 'ls web/',
};

// Kuratierung über den vorhandenen `status`: Kompetenzbeweise = im Betrieb, Lab = in Arbeit.
const LAB_STATUS = new Set<ProjectStatus>(['im-aufbau', 'pivot']);

export function ProjectsBrowser({
  locale,
  projects,
}: {
  locale: Locale;
  projects: Project[];
}) {
  const [activeStacks, setActiveStacks] = useState<Set<string>>(new Set());
  const [activeDomain, setActiveDomain] = useState<Domain | null>(null);
  const [urlReady, setUrlReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const domain = params.get('domain');
    if (domain && (DOMAIN_ORDER as string[]).includes(domain)) {
      setActiveDomain(domain as Domain);
    }
    const stackParam = params.get('stack');
    if (stackParam) {
      const known = new Set(projects.flatMap((p) => p.stack));
      const valid = stackParam.split(',').filter((s) => known.has(s));
      if (valid.length > 0) setActiveStacks(new Set(valid));
    }
    setUrlReady(true);
  }, [projects]);

  useEffect(() => {
    if (!urlReady) return;
    const params = new URLSearchParams(window.location.search);
    if (activeDomain) params.set('domain', activeDomain);
    else params.delete('domain');
    if (activeStacks.size > 0) params.set('stack', [...activeStacks].join(','));
    else params.delete('stack');
    const query = params.toString();
    window.history.replaceState(
      null,
      '',
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, [urlReady, activeDomain, activeStacks]);

  const domainCounts = useMemo(() => {
    const counts = new Map<Domain, number>();
    for (const p of projects) counts.set(p.domain, (counts.get(p.domain) ?? 0) + 1);
    return DOMAIN_ORDER.filter((d) => (counts.get(d) ?? 0) > 0).map(
      (d) => [d, counts.get(d) ?? 0] as const,
    );
  }, [projects]);

  const allStacks = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      if (activeDomain && p.domain !== activeDomain) continue;
      for (const s of p.stack) counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [projects, activeDomain]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (activeDomain && p.domain !== activeDomain) return false;
      if (activeStacks.size > 0 && !p.stack.some((s) => activeStacks.has(s))) return false;
      return true;
    });
  }, [projects, activeDomain, activeStacks]);

  const proof = useMemo(() => filtered.filter((p) => !LAB_STATUS.has(p.status)), [filtered]);
  const lab = useMemo(() => filtered.filter((p) => LAB_STATUS.has(p.status)), [filtered]);

  function toggle(stack: string) {
    setActiveStacks((prev) => {
      const next = new Set(prev);
      if (next.has(stack)) next.delete(stack);
      else next.add(stack);
      return next;
    });
  }

  function selectDomain(domain: Domain | null) {
    setActiveDomain((prev) => (prev === domain ? null : domain));
    setActiveStacks(new Set());
  }

  function reset() {
    setActiveStacks(new Set());
    setActiveDomain(null);
  }

  const hasFilter = activeStacks.size > 0 || activeDomain !== null;
  const hitsLabel = `${filtered.length} ${t(locale, 'projects.hits')}`;

  return (
    <>
      <section aria-label={t(locale, 'projects.filterDomain')} className="mt-16">
        <CommandEyebrow>ls projekte/ --domain</CommandEyebrow>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => selectDomain(null)}
            aria-pressed={activeDomain === null}
            className={
              activeDomain === null
                ? 'rounded-md border border-accent bg-accent/15 px-3 py-1 font-mono text-xs uppercase tracking-widest text-accent transition-colors'
                : 'rounded-md border border-border bg-elev px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-border-strong hover:text-text'
            }
          >
            {t(locale, 'projects.all')}
            <span className="ml-1.5 text-muted-dim">{projects.length}</span>
          </button>
          {domainCounts.map(([domain, count]) => {
            const active = activeDomain === domain;
            return (
              <button
                key={domain}
                type="button"
                onClick={() => selectDomain(domain)}
                aria-pressed={active}
                className={
                  active
                    ? 'rounded-md border border-accent bg-accent/15 px-3 py-1 font-mono text-xs uppercase tracking-widest text-accent transition-colors'
                    : 'rounded-md border border-border bg-elev px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-border-strong hover:text-text'
                }
              >
                {domain}
                <span className="ml-1.5 text-muted-dim">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section
        aria-label={t(locale, 'projects.filterStack')}
        className="mt-8 overflow-hidden rounded-lg border border-border bg-surface/40"
      >
        <WindowBar
          title="grep --stack projekte/"
          right={
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
              {activeStacks.size > 0
                ? `${activeStacks.size} ${t(locale, 'projects.active')}`
                : `${allStacks.length} ${t(locale, 'projects.stacks')}`}
            </span>
          }
        />
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-4 font-mono text-xs">
            <p className="uppercase tracking-widest text-muted">
              <span aria-hidden className="text-muted-dim">›</span>{' '}
              {activeDomain
                ? `${activeDomain.toLowerCase()}/ ${t(locale, 'projects.byStack')}`
                : t(locale, 'projects.byStack')}
            </p>
            {hasFilter ? (
              <button
                type="button"
                onClick={reset}
                className="uppercase tracking-widest text-muted hover:text-accent"
              >
                reset · {hitsLabel}
              </button>
            ) : (
              <span className="text-muted-dim">{hitsLabel}</span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {allStacks.map(([stack, count]) => {
              const active = activeStacks.has(stack);
              return (
                <button
                  key={stack}
                  type="button"
                  onClick={() => toggle(stack)}
                  aria-pressed={active}
                  className={
                    active
                      ? 'rounded-md border border-accent bg-accent/15 px-2 py-0.5 font-mono text-[0.7rem] text-accent transition-colors'
                      : 'rounded-md border border-border bg-elev px-2 py-0.5 font-mono text-[0.7rem] text-muted transition-colors hover:border-border-strong hover:text-text'
                  }
                >
                  {stack}
                  <span className="ml-1.5 text-muted-dim">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {proof.length > 0 ? (
        <section aria-label={t(locale, 'projects.inBetrieb')} className="mt-16">
          <CommandEyebrow>grep -l 'status=live' projekte/*</CommandEyebrow>
          <h2 className="mt-2 font-display text-2xl leading-none text-text sm:text-3xl">
            {t(locale, 'projects.inBetrieb')}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">{t(locale, 'projects.inBetriebLead')}</p>
          <DomainGroups locale={locale} projects={proof} highlightStacks={activeStacks} />
        </section>
      ) : null}

      {lab.length > 0 ? (
        <section aria-label={t(locale, 'projects.lab')} className="mt-20 opacity-90">
          <CommandEyebrow>ls lab/ --experimental</CommandEyebrow>
          <h2 className="mt-2 font-display text-2xl leading-none text-text sm:text-3xl">
            {t(locale, 'projects.lab')}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">{t(locale, 'projects.labLead')}</p>
          <DomainGroups locale={locale} projects={lab} dimmed highlightStacks={activeStacks} />
        </section>
      ) : null}

      <div className="mt-12 space-y-16">
        {filtered.length === 0 ? (
          <div className="overflow-hidden rounded-lg border border-dashed border-border bg-surface/30">
            <WindowBar title="grep --stack projekte/" />
            <div className="px-6 py-16 text-center">
              <p className="font-mono text-sm text-muted-dim">
                <span aria-hidden className="text-muted-dim">›</span> grep: 0{' '}
                {t(locale, 'projects.hits')}
              </p>
              <p className="mt-5 font-display text-2xl text-text">
                {t(locale, 'projects.noMatches')}
              </p>
              <p className="mt-2 text-sm text-muted">{t(locale, 'projects.noMatchesNote')}</p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-bg px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-border-strong hover:text-accent"
              >
                {t(locale, 'action.reset')}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

function DomainGroups({
  locale,
  projects,
  dimmed = false,
  highlightStacks,
}: {
  locale: Locale;
  projects: Project[];
  dimmed?: boolean;
  highlightStacks?: Set<string>;
}) {
  const grouped = new Map<Domain, Project[]>();
  for (const p of projects) {
    const bucket = grouped.get(p.domain) ?? [];
    bucket.push(p);
    grouped.set(p.domain, bucket);
  }

  // Ein Container pro Sektion, je Domäne eine schlanke Kopfzeile + kompakte
  // Index-Zeilen. Deutlich weniger Chrome als die frühere Fenster-pro-Domäne-Kachelung.
  return (
    <div
      className={`mt-8 overflow-hidden rounded-lg border border-border bg-surface/40 ${
        dimmed ? 'opacity-90' : ''
      }`}
    >
      {DOMAIN_ORDER.map((domain) => {
        const items = grouped.get(domain);
        if (!items || items.length === 0) return null;
        return (
          <section key={domain} className="border-b border-border last:border-b-0">
            <div className="flex items-baseline justify-between gap-4 border-b border-border/60 bg-surface/50 px-5 py-2.5">
              <h3 className="flex items-baseline gap-2.5">
                <span aria-hidden className="font-mono text-xs text-accent/50">$</span>
                <span className="font-mono text-sm font-medium uppercase tracking-widest text-text">
                  {domain}
                </span>
                <span className="hidden font-mono text-[0.65rem] text-muted-dim sm:inline">
                  {DOMAIN_COMMAND[domain]}
                </span>
              </h3>
              <span className="shrink-0 font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
                {items.length.toString().padStart(2, '0')}{' '}
                {items.length === 1 ? t(locale, 'projects.projekt') : t(locale, 'projects.projekte')}
              </span>
            </div>

            <Reveal as="ul" stagger className="divide-y divide-border/50 px-5">
              {items.map((p) => (
                <ProjectListItem
                  key={p.id}
                  project={p}
                  locale={locale}
                  highlightStacks={highlightStacks}
                />
              ))}
            </Reveal>
          </section>
        );
      })}
    </div>
  );
}
