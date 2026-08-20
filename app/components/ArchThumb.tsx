import type { Architecture, ArchNode } from '@/lib/projects';

/**
 * Kompakte, statische Vorschau der echten Projekt-Architektur für Karten ohne
 * Live-Screenshot: dieselben tiers/nodes/flows wie das große ArchitectureDiagram
 * der Detailseite, aber als deterministisch layoutetes SVG (server-renderbar,
 * kein Mess-JS, Bewegungs-Budget 0). Ersetzt das generische CardVisual überall
 * dort, wo Architektur-Daten existieren: das Thumbnail zeigt, WAS das Projekt
 * ist, nicht ein Zufallsmotiv. Farben = Tailwind-Tokens (dark-first, fix).
 */

const W = 640;
const H = 360;
const PAD = 26;
const COL_GAP = 22;
const NODE_GAP = 12;
const LABEL_ZONE = 26; // Platz für die Tier-Überschrift

const COLOR = {
  surface: '#15171c',
  border: '#26282f',
  borderStrong: '#383b44',
  text: '#ece9e0',
  muted: '#8a8a8a',
  mutedDim: '#82848d',
  accent: '#e0a458',
};

function nodeStroke(kind: ArchNode['kind']): string {
  return kind === 'edge' || kind === 'core' ? COLOR.borderStrong : COLOR.border;
}

function accentBar(kind: ArchNode['kind']): string | null {
  switch (kind) {
    case 'core':
      return COLOR.accent;
    case 'edge':
      return COLOR.borderStrong;
    case 'consumer':
    case 'data':
      return COLOR.mutedDim;
    default:
      return null;
  }
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function truncate(label: string, maxChars: number): string {
  if (label.length <= maxChars) return label;
  return `${label.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}

export function ArchThumb({ architecture }: { architecture: Architecture }) {
  const { tiers, flows } = architecture;
  if (!tiers || tiers.length === 0) return null;

  const cols = tiers.length;
  const colW = (W - PAD * 2 - COL_GAP * (cols - 1)) / cols;
  const maxNodes = Math.max(...tiers.map((t) => t.nodes.length));
  const nodesTop = PAD + LABEL_ZONE;
  const avail = H - nodesTop - PAD;
  const nodeH = Math.min(46, (avail - NODE_GAP * (maxNodes - 1)) / maxNodes);
  // Zeichenbreite der 11px-Mono-Labels: ~6.6px pro Zeichen, minus Innen-Padding.
  const maxChars = Math.max(6, Math.floor((colW - 20) / 6.6));

  const boxes = new Map<string, Box>();
  tiers.forEach((tier, ti) => {
    const x = PAD + ti * (colW + COL_GAP);
    tier.nodes.forEach((node, ni) => {
      boxes.set(node.id, { x, y: nodesTop + ni * (nodeH + NODE_GAP), w: colW, h: nodeH });
    });
  });

  const paths: string[] = [];
  for (const flow of flows ?? []) {
    const a = boxes.get(flow.from);
    const b = boxes.get(flow.to);
    if (!a || !b) continue;
    if (Math.abs(a.x - b.x) < 1) {
      // Gleiche Spalte: Bogen an der linken Außenkante vorbei.
      const y1 = a.y + a.h / 2;
      const y2 = b.y + b.h / 2;
      paths.push(`M ${a.x} ${y1} C ${a.x - 16} ${y1}, ${b.x - 16} ${y2}, ${b.x} ${y2}`);
    } else {
      const forward = b.x > a.x;
      const x1 = forward ? a.x + a.w : a.x;
      const x2 = forward ? b.x : b.x + b.w;
      const y1 = a.y + a.h / 2;
      const y2 = b.y + b.h / 2;
      const dx = (x2 - x1) / 2;
      paths.push(`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`);
    }
  }

  return (
    <div className="aspect-video overflow-hidden border-b border-border bg-bg">
      <svg
        aria-hidden
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full opacity-90 transition-opacity duration-[240ms] group-hover:opacity-100"
      >
        <defs>
          <marker
            id="thumb-arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0.5 L 7.5 4 L 0 7.5" fill="none" stroke={COLOR.accent} strokeWidth="1.4" />
          </marker>
        </defs>

        {tiers.map((tier, ti) => {
          const x = PAD + ti * (colW + COL_GAP);
          return (
            <text
              key={tier.label}
              x={x + 1}
              y={PAD + 10}
              fontFamily="var(--font-mono), monospace"
              fontSize="9.5"
              letterSpacing="0.14em"
              fill={COLOR.mutedDim}
              style={{ textTransform: 'uppercase' }}
            >
              {`${(ti + 1).toString().padStart(2, '0')} ${truncate(tier.label.toUpperCase(), maxChars)}`}
            </text>
          );
        })}

        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={COLOR.accent}
            strokeOpacity="0.55"
            strokeWidth="1.2"
            markerEnd="url(#thumb-arrow)"
          />
        ))}

        {tiers.flatMap((tier) =>
          tier.nodes.map((node) => {
            const b = boxes.get(node.id);
            if (!b) return null;
            const bar = accentBar(node.kind);
            return (
              <g key={node.id}>
                <rect
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  rx={6}
                  fill={COLOR.surface}
                  stroke={nodeStroke(node.kind)}
                  strokeWidth="1"
                  strokeDasharray={node.kind === 'data' ? '3 3' : undefined}
                />
                {bar ? (
                  <rect
                    x={b.x}
                    y={b.y + 4}
                    width={2}
                    height={b.h - 8}
                    fill={bar}
                    fillOpacity={node.kind === 'core' ? 0.85 : 0.6}
                  />
                ) : null}
                <text
                  x={b.x + 11}
                  y={b.y + b.h / 2 + 3.5}
                  fontFamily="var(--font-mono), monospace"
                  fontSize="11"
                  fill={COLOR.text}
                  fillOpacity="0.88"
                >
                  {truncate(node.label, maxChars)}
                </text>
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}
