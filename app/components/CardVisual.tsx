import { DASH, OPACITY, STROKE } from './graphics/primitives';
import type { Domain } from '@/lib/projects';

/**
 * Deterministisches Blueprint-Visual für Featured-Karten OHNE Live-Screenshot.
 * Das Motiv leitet sich aus der Projekt-DOMÄNE ab, damit der Kopf der Karte zeigt,
 * WAS das Projekt ist (structure is information), statt für alle gleich auszusehen:
 *   Suite → konvergierende Stränge auf einen Knoten (viele Apps, ein Dach)
 *   Infra → gestapelte Ebenen-Rahmen (Schichten/Hosts)
 *   AI    → Inferenz-Kern mit Ein-/Ausgangs-Signalen
 *   Web/Bots → die generische Drei-Spalten-Topologie (Default)
 * Rein geometrisch, Amber via currentColor, aria-hidden, kein Client-JS. term-Grün
 * wird NICHT genutzt (Design-Regel: nur funktional). Der Seed leitet sich aus der
 * `id` ab → jedes Projekt bekommt eine stabile, eigene Variante (kein Math.random →
 * kein Hydration-Drift).
 */
function seededRng(id: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

const W = 320;
const H = 180;

type Rng = () => number;

/** Suite: mehrere Stränge laufen von links auf einen Konvergenz-Knoten rechts zu. */
function convergeMotif(id: string, rand: Rng) {
  const target = { x: W - 72, y: H / 2 + (rand() - 0.5) * 12 };
  const n = 4 + Math.floor(rand() * 2);
  const strands = Array.from({ length: n }, (_, i) => ({
    y: 26 + (i / (n - 1)) * (H - 52) + (rand() - 0.5) * 6,
    op: Math.max(0.18, 0.52 - i * 0.06),
  }));
  return (
    <>
      <g fill="none" stroke="currentColor" strokeWidth={STROKE.line} strokeLinecap="round">
        {strands.map((s, i) => {
          const c1x = 92 + rand() * 26;
          const c2x = target.x - 78;
          const d = `M 28 ${s.y} C ${c1x} ${s.y}, ${c2x} ${target.y}, ${target.x} ${target.y}`;
          return <path key={i} d={d} strokeDasharray={DASH.flow} opacity={s.op} />;
        })}
      </g>
      <circle cx={target.x} cy={target.y} r={9} fill="currentColor" opacity="0.25" filter={`url(#cv-glow-${id})`} />
      <circle
        cx={target.x}
        cy={target.y}
        r={11}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE.line}
        opacity={OPACITY.strong}
      />
      <circle cx={target.x} cy={target.y} r={4.5} fill="currentColor" opacity="0.95" />
    </>
  );
}

/** Infra: vier horizontal versetzte Ebenen-Rahmen mit feinen Verbindern (Perspektive). */
function layerMotif(rand: Rng) {
  const layers = 4;
  const boxW = 150 + rand() * 18;
  const boxH = 22;
  const gapY = 34;
  const topY = (H - ((layers - 1) * gapY + boxH)) / 2;
  const offX = 16;
  return (
    <>
      <g stroke="currentColor" strokeWidth={STROKE.hair} strokeDasharray={DASH.grid} opacity={OPACITY.weak}>
        {Array.from({ length: layers - 1 }, (_, i) => (
          <line
            key={i}
            x1={60 + i * offX + 10}
            y1={topY + i * gapY + boxH}
            x2={60 + (i + 1) * offX + 10}
            y2={topY + (i + 1) * gapY}
          />
        ))}
      </g>
      {Array.from({ length: layers }, (_, i) => {
        const x = 60 + i * offX;
        const y = topY + i * gapY;
        const primary = i === 1;
        return (
          <g key={i} opacity={Math.max(0.1, 0.7 - i * 0.16)}>
            <rect
              x={x}
              y={y}
              width={boxW}
              height={boxH}
              rx={4}
              fill="none"
              stroke="currentColor"
              strokeWidth={primary ? STROKE.emph : STROKE.line}
            />
            <circle cx={x + 12} cy={y + boxH / 2} r={2.4} fill="currentColor" opacity={0.8} />
          </g>
        );
      })}
    </>
  );
}

/** AI: Eingangs-Knoten → glühender Inferenz-Kern → Ausgänge, als Signalpfade. */
function signalMotif(id: string, rand: Rng) {
  const coreX = W / 2 + (rand() - 0.5) * 12;
  const coreY = H / 2;
  const inN = 3;
  const outN = 1 + Math.floor(rand() * 2);
  const inputs = Array.from({ length: inN }, (_, i) => ({ x: 44, y: 44 + (i * (H - 88)) / (inN - 1) }));
  const outputs = Array.from({ length: outN }, (_, i) => ({
    x: W - 46,
    y: outN === 1 ? H / 2 : 60 + (i * (H - 120)) / (outN - 1),
  }));
  return (
    <>
      <g fill="none" stroke="currentColor" strokeWidth={STROKE.line} strokeDasharray={DASH.flow}>
        {inputs.map((p, i) => (
          <path key={`i${i}`} d={`M ${p.x} ${p.y} C ${p.x + 60} ${p.y}, ${coreX - 50} ${coreY}, ${coreX} ${coreY}`} opacity={0.4} />
        ))}
        {outputs.map((p, i) => (
          <path key={`o${i}`} d={`M ${coreX} ${coreY} C ${coreX + 50} ${coreY}, ${p.x - 50} ${p.y}, ${p.x} ${p.y}`} opacity={0.55} />
        ))}
      </g>
      {inputs.map((p, i) => (
        <circle key={`in${i}`} cx={p.x} cy={p.y} r={3} fill="none" stroke="currentColor" strokeWidth={STROKE.line} opacity={0.55} />
      ))}
      {outputs.map((p, i) => (
        <circle key={`on${i}`} cx={p.x} cy={p.y} r={3.2} fill="currentColor" opacity={0.7} />
      ))}
      <circle cx={coreX} cy={coreY} r={12} fill="currentColor" opacity="0.22" filter={`url(#cv-glow-${id})`} />
      <circle cx={coreX} cy={coreY} r={9} fill="none" stroke="currentColor" strokeWidth={STROKE.emph} opacity={OPACITY.strong} />
      <circle cx={coreX} cy={coreY} r={4} fill="currentColor" opacity="0.95" />
    </>
  );
}

interface CvNode {
  x: number;
  y: number;
  r: number;
  primary: boolean;
}

/** Web/Bots/Default: die generische Drei-Spalten-Topologie (reimt sich aufs Architektur-Diagramm). */
function topologyMotif(id: string, rand: Rng) {
  const cols = [58, 160, 262];
  const columns: CvNode[][] = cols.map((cx, ci) => {
    const n = 1 + Math.floor(rand() * (ci === 1 ? 3 : 2.5));
    const gap = 40;
    const top = H / 2 - ((n - 1) * gap) / 2;
    return Array.from({ length: n }, (_, i) => ({
      x: cx + (rand() - 0.5) * 10,
      y: top + i * gap + (rand() - 0.5) * 8,
      r: 2.6 + rand() * 1.4,
      primary: false,
    }));
  });
  const mid = columns[1]!;
  const primaryNode = mid[Math.floor(rand() * mid.length)]!;
  primaryNode.primary = true;
  primaryNode.r = 4.6;

  const edges: { a: CvNode; b: CvNode; strong: boolean }[] = [];
  for (let ci = 0; ci < columns.length - 1; ci++) {
    const from = columns[ci]!;
    const to = columns[ci + 1]!;
    for (const a of from) {
      const links = 1 + Math.floor(rand() * Math.min(2, to.length));
      const shuffled = [...to].sort(() => rand() - 0.5).slice(0, links);
      for (const b of shuffled) {
        edges.push({ a, b, strong: a.primary || b.primary });
      }
    }
  }

  return (
    <>
      {edges.map((e, i) => {
        const dx = (e.b.x - e.a.x) / 2;
        const d = `M ${e.a.x} ${e.a.y} C ${e.a.x + dx} ${e.a.y}, ${e.b.x - dx} ${e.b.y}, ${e.b.x} ${e.b.y}`;
        return (
          <path
            key={`e${i}`}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={e.strong ? 1.3 : 1}
            strokeDasharray={e.strong ? undefined : '4 6'}
            opacity={e.strong ? 0.5 : 0.28}
          />
        );
      })}
      <circle cx={primaryNode.x} cy={primaryNode.y} r={7} fill="currentColor" opacity="0.28" filter={`url(#cv-glow-${id})`} />
      {columns.flat().map((n, i) => (
        <circle
          key={`n${i}`}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={n.primary ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.2"
          opacity={n.primary ? 0.95 : 0.55}
        />
      ))}
    </>
  );
}

export function CardVisual({ id, domain = 'Web' }: { id: string; domain?: Domain }) {
  const rand = seededRng(id);
  const motif =
    domain === 'Suite'
      ? convergeMotif(id, rand)
      : domain === 'Infra'
        ? layerMotif(rand)
        : domain === 'AI'
          ? signalMotif(id, rand)
          : topologyMotif(id, rand);

  return (
    <div className="aspect-video overflow-hidden border-b border-border bg-bg text-accent">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        className="opacity-75 transition-opacity duration-[240ms] group-hover:opacity-100"
      >
        <defs>
          <pattern id={`cv-grid-${id}`} width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0H0V16" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />
          </pattern>
          <filter id={`cv-glow-${id}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>
        <rect width={W} height={H} fill={`url(#cv-grid-${id})`} />
        {motif}
      </svg>
    </div>
  );
}
