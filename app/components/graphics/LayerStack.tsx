import { STROKE, OPACITY, DASH } from './primitives';

// Vier gestapelte, leicht versetzte Ebenen-Rahmen (edge/app/data/ai) mit feinen
// Verbindungslinien dazwischen. Abstrakt, generische Labels, keine echte Topologie.

// Ebenen von oben (strong) nach unten (ghost), horizontal versetzt fuer Perspektive.
const LAYERS: { label: string; x: number; y: number; opacity: number }[] = [
  { label: 'edge', x: 40, y: 30, opacity: OPACITY.strong },
  { label: 'app', x: 70, y: 100, opacity: OPACITY.base },
  { label: 'data', x: 100, y: 170, opacity: OPACITY.weak },
  { label: 'ai', x: 130, y: 240, opacity: OPACITY.ghost },
];

const BOX_W = 300;
const BOX_H = 44;

export function LayerStack({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 300"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={className}
    >
      {/* Feine Verbindungslinien zwischen den Ebenen (linke Kante). */}
      <g stroke="currentColor" strokeWidth={STROKE.hair} strokeDasharray={DASH.grid}>
        {LAYERS.map((l, i) => {
          const next = LAYERS[i + 1];
          if (!next) return null;
          return (
            <line
              key={`link-${i}`}
              x1={l.x + 20}
              y1={l.y + BOX_H}
              x2={next.x + 20}
              y2={next.y}
              opacity={OPACITY.weak}
            />
          );
        })}
      </g>

      {/* Ebenen als duenne Rahmen-Rechtecke plus kleines mono-Label. */}
      {LAYERS.map((l, i) => (
        <g key={`layer-${i}`} opacity={l.opacity}>
          <rect
            x={l.x}
            y={l.y}
            width={BOX_W}
            height={BOX_H}
            rx={4}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE.line}
          />
          <text
            x={l.x + 12}
            y={l.y + BOX_H / 2 + 4}
            fill="currentColor"
            fontFamily="monospace"
            fontSize={12}
            opacity={OPACITY.strong}
          >
            {l.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default LayerStack;
