'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import type { Architecture, ArchKind, ArchNode } from '@/lib/projects';

/**
 * Privacy-safe Architektur-Skizze: Knoten bleiben echter Text (A11y, Crawler),
 * aber die `flows` werden ab md: als echte SVG-Kanten zwischen den Knoten-Karten
 * gezeichnet statt nur als Fußnoten-Liste. Kein neues Dependency: ein
 * Client-Layer misst die Karten-Positionen (ResizeObserver) und legt ein
 * statisches SVG-Overlay darüber. Bewegungs-Budget: 0 (keine Animation).
 * Auf Mobile (eine Spalte) bleibt die Text-Liste die Kanten-Darstellung,
 * `@media print` sieht ebenfalls nur den Text.
 */

function nodeBorder(kind: ArchNode['kind']): string {
  switch (kind) {
    case 'edge':
      return 'border-border-strong';
    case 'core':
      return 'border-border-strong bg-surface-2';
    case 'data':
      return 'border-dashed border-border';
    default:
      return 'border-border';
  }
}

/**
 * Rollen-Codierung ohne zweite Deko-Farbe: eine linke Akzent-Kante gewichtet die
 * Knoten-Rolle. Amber (accent) trägt AUSSCHLIESSLICH die zentralen `core`-Knoten
 * (funktionale Betonung, kein Regenbogen); außen/abnehmer/speicher bleiben in
 * neutralen Grau-Stufen. Zahlt auf Scanbarkeit ein, hält das Akzent-Budget.
 */
function nodeAccent(kind: ArchNode['kind']): string {
  switch (kind) {
    case 'core':
      return 'border-l-2 border-l-accent/70';
    case 'edge':
      return 'border-l-2 border-l-border-strong';
    case 'consumer':
      return 'border-l-2 border-l-muted/40';
    case 'data':
      return 'border-l-2 border-l-muted-dim/40';
    default:
      return '';
  }
}

const KIND_TAG: Partial<Record<ArchKind, string>> = {
  edge: 'außen',
  core: 'zentral',
  data: 'speicher',
  consumer: 'abnehmer',
};

function labelFor(tiers: Architecture['tiers'], id: string): string {
  for (const tier of tiers) {
    for (const node of tier.nodes) {
      if (node.id === id) return node.label;
    }
  }
  return id;
}

interface Edge {
  path: string;
}

/**
 * Kanten aus den gemessenen Karten-Rechtecken ableiten. Links→rechts als
 * Bezier von Kartenrand zu Kartenrand; gleiche Spalte als vertikaler Bogen
 * an der linken Außenkante vorbei. Koordinaten relativ zum Container.
 */
function computeEdges(
  container: HTMLElement,
  nodeEls: Map<string, HTMLElement>,
  flows: NonNullable<Architecture['flows']>,
): Edge[] {
  const cRect = container.getBoundingClientRect();
  const rect = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return { x: r.left - cRect.left, y: r.top - cRect.top, w: r.width, h: r.height };
  };
  const edges: Edge[] = [];
  for (const flow of flows) {
    const fromEl = nodeEls.get(flow.from);
    const toEl = nodeEls.get(flow.to);
    if (!fromEl || !toEl) continue;
    const a = rect(fromEl);
    const b = rect(toEl);
    const forward = b.x > a.x + a.w - 4;
    const backward = a.x > b.x + b.w - 4;
    if (forward || backward) {
      const x1 = forward ? a.x + a.w : a.x;
      const y1 = a.y + a.h / 2;
      const x2 = forward ? b.x : b.x + b.w;
      const y2 = b.y + b.h / 2;
      const dx = (x2 - x1) / 2;
      edges.push({
        path: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`,
      });
    } else {
      const x1 = a.x;
      const y1 = a.y + a.h / 2;
      const x2 = b.x;
      const y2 = b.y + b.h / 2;
      const bow = 18;
      edges.push({
        path: `M ${x1} ${y1} C ${x1 - bow} ${y1}, ${x2 - bow} ${y2}, ${x2} ${y2}`,
      });
    }
  }
  return edges;
}

export function ArchitectureDiagram({ architecture }: { architecture: Architecture }) {
  const { summary, tiers, flows } = architecture;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [edges, setEdges] = useState<Edge[]>([]);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !flows || flows.length === 0) return;
    const measure = () => {
      // Overlay nur, wenn die Tiers wirklich als Spalten liegen (md:+).
      if (!window.matchMedia('(min-width: 768px)').matches) {
        setEdges([]);
        return;
      }
      setEdges(computeEdges(container, nodeRefs.current, flows));
      setSize({ w: container.clientWidth, h: container.clientHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [flows]);

  if (!tiers || tiers.length === 0) return null;
  const hasOverlay = edges.length > 0;

  return (
    <figure role="img" aria-label={summary} className="m-0">
      <div className="overflow-hidden rounded-lg border border-border bg-surface/30">
        <div ref={containerRef} className="relative">
          <div className="grid gap-px bg-border md:grid-flow-col md:auto-cols-fr">
            {tiers.map((tier, ti) => {
              const last = ti === tiers.length - 1;
              return (
                <div key={tier.label} className="relative bg-bg p-5">
                  <p className="label mb-4 flex items-center gap-2">
                    <span className="font-mono text-muted-dim">
                      {(ti + 1).toString().padStart(2, '0')}
                    </span>
                    {tier.label}
                  </p>
                  <ul className="space-y-3">
                    {tier.nodes.map((node) => (
                      <li
                        key={node.id}
                        ref={(el) => {
                          if (el) nodeRefs.current.set(node.id, el);
                          else nodeRefs.current.delete(node.id);
                        }}
                        className={`relative rounded-md border ${nodeBorder(node.kind)} ${nodeAccent(node.kind)} bg-surface px-3 py-2.5 transition-colors duration-200 hover:border-border-strong hover:bg-surface-2`}
                      >
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-sm leading-snug text-text/90">{node.label}</span>
                          {node.kind && KIND_TAG[node.kind] ? (
                            <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-widest text-muted-dim">
                              {KIND_TAG[node.kind]}
                            </span>
                          ) : null}
                        </span>
                        {node.note ? (
                          <span className="mt-1 block font-mono text-[0.65rem] uppercase tracking-widest text-muted">
                            {node.note}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>

                  {!last && !hasOverlay ? (
                    <>
                      {/* Fallback-Pfeile ohne Kanten-Overlay (Mobile, kein JS, keine flows) */}
                      <span
                        aria-hidden
                        className="absolute right-[-0.65rem] top-1/2 z-10 hidden -translate-y-1/2 font-mono text-base text-accent md:block"
                      >
                        →
                      </span>
                      <span
                        aria-hidden
                        className="absolute bottom-[-0.7rem] left-1/2 z-10 block -translate-x-1/2 font-mono text-base text-accent md:hidden"
                      >
                        ↓
                      </span>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>

          {hasOverlay ? (
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 hidden md:block print:hidden"
              width={size.w}
              height={size.h}
              viewBox={`0 0 ${size.w} ${size.h}`}
            >
              <defs>
                <marker
                  id="arch-arrow"
                  viewBox="0 0 8 8"
                  refX="7"
                  refY="4"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0.5 L 7.5 4 L 0 7.5" fill="none" stroke="#e0a458" strokeWidth="1.4" />
                </marker>
                <filter id="arch-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.6" />
                </filter>
              </defs>
              {/* Phosphor-Glow-Unterlage: weich, sehr leise — gibt den Kanten Terminal-Anmutung */}
              {edges.map((e, i) => (
                <path
                  key={`glow-${i}`}
                  d={e.path}
                  fill="none"
                  stroke="#e0a458"
                  strokeOpacity="0.22"
                  strokeWidth="2.6"
                  filter="url(#arch-glow)"
                />
              ))}
              {edges.map((e, i) => (
                <path
                  key={i}
                  d={e.path}
                  fill="none"
                  stroke="#e0a458"
                  strokeOpacity="0.7"
                  strokeWidth="1.4"
                  markerEnd="url(#arch-arrow)"
                />
              ))}
            </svg>
          ) : null}
        </div>
      </div>

      {flows && flows.length > 0 ? (
        <ul aria-label="Datenpfade" className="mt-5 grid gap-2 sm:grid-cols-2">
          {flows.map((flow, i) => (
            <li key={i} className="flex items-baseline gap-2 font-mono text-xs leading-relaxed">
              <span aria-hidden className="text-accent">
                →
              </span>
              <span className="text-muted">
                <span className="text-text/80">{labelFor(tiers, flow.from)}</span>
                <span aria-hidden className="px-1 text-muted-dim">→</span>
                <span className="text-text/80">{labelFor(tiers, flow.to)}</span>
                {flow.label ? <span className="text-muted-dim"> · {flow.label}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <figcaption className="mt-5 border-t border-border pt-3 text-sm leading-relaxed text-muted">
        {summary}
      </figcaption>
    </figure>
  );
}
