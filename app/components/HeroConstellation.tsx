import type { CSSProperties } from 'react';

/**
 * Abstraktes, privacy-sicheres Netz-Visual als reines Server-SVG (kein 'use client',
 * keine neue Dep, kein Bild-Asset). Ersetzt „mehr Bilder/Formen“ durch eine
 * generative Blueprint-Grafik hinter dem ~/profil-Panel.
 *
 * Doktrin-Wächter:
 * - Koordinaten sind FEST und REIN GEOMETRISCH, KEINE Labels, keine echte
 *   Hosttopologie (Privacy: keine Infra-Karte nachbauen).
 * - Das Netz ist ein SYSTEM-Diagramm, spricht also grün (Zwei-Stimmen-Doktrin,
 *   siehe tailwind.config.ts). Bis 2026-08-24 waren die Linien amber und nur der
 *   eine 'live'-Knoten grün — das las sich wie ein Fehler im eigenen Schema.
 *   Unterschieden wird jetzt über Helligkeit: der live-Knoten leuchtet heller
 *   als die übrigen, statt die Farbe zu wechseln.
 * - Animation rein transform/opacity/stroke-dashoffset; reduced-motion + print
 *   werden in globals.css neutralisiert (.hero-net*).
 */
type Node = { id: string; x: number; y: number; r: number; live?: boolean; pulse?: boolean };

const NODES: Node[] = [
  { id: 'a', x: 60, y: 70, r: 7, pulse: true },
  { id: 'b', x: 162, y: 40, r: 9, live: true },
  { id: 'c', x: 252, y: 92, r: 6, pulse: true },
  { id: 'd', x: 112, y: 150, r: 7 },
  { id: 'e', x: 214, y: 176, r: 8, pulse: true },
  { id: 'f', x: 52, y: 196, r: 5 },
];

// [from, to, flow?], nur die ersten vier Kanten „fließen“, der Rest ist statisch
// gestrichelt (bewusst weniger gleichzeitige Bewegung).
const EDGES: [string, string, boolean][] = [
  ['a', 'b', true],
  ['b', 'c', true],
  ['a', 'd', true],
  ['d', 'e', true],
  ['b', 'e', false],
  ['e', 'c', false],
  ['d', 'f', false],
];

const at = (id: string): Node | undefined => NODES.find((n) => n.id === id);

export function HeroConstellation() {
  return (
    <svg
      viewBox="0 0 320 240"
      role="img"
      aria-label="Abstrakte Netzgrafik aus verbundenen Knoten"
      className="hero-net h-full w-full"
    >
      <g fill="none" stroke="rgba(90,197,111,0.40)" strokeWidth={1.2}>
        {EDGES.map(([s, t, flow], i) => {
          const p = at(s);
          const q = at(t);
          if (!p || !q) return null;
          return (
            <line
              key={`${s}-${t}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              className={`hero-net__edge${flow ? '' : ' hero-net__edge--static'}`}
              style={flow ? ({ animationDelay: `${i * -1.6}s` } as CSSProperties) : undefined}
            />
          );
        })}
      </g>
      {NODES.map((n, i) => {
        const cls = n.live
          ? 'hero-net__core hero-net__core--live'
          : n.pulse
            ? 'hero-net__core hero-net__core--pulse'
            : 'hero-net__core';
        return (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={n.r + 4} fill="none" stroke="rgba(56,59,68,0.9)" strokeWidth={1} />
            <circle cx={n.x} cy={n.y} r={n.r} className={cls} style={{ animationDelay: `${i * -0.6}s` } as CSSProperties} />
          </g>
        );
      })}
    </svg>
  );
}
