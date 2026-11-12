import { STROKE, OPACITY, DASH } from './primitives';

// Mehrere geschwungene Amber-Straenge, die von links aus verschiedenen Hoehen
// kommen und rechts auf einen einzelnen Konvergenz-Knoten zulaufen.
// Rein dekorativ, feste Geometrie, keine Labels (Privacy).

// Zielpunkt der Konvergenz (rechts, mittig).
const TARGET = { x: 560, y: 120 };

// Startpunkte links (verschiedene Hoehen) + fallende Opacity je Strang.
const STRANDS: { y: number; opacity: number }[] = [
  { y: 24, opacity: OPACITY.strong },
  { y: 72, opacity: OPACITY.base },
  { y: 120, opacity: OPACITY.base },
  { y: 168, opacity: OPACITY.weak },
  { y: 216, opacity: OPACITY.weak },
];

export function ConvergeStrands({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 240"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={className}
    >
      <g fill="none" stroke="currentColor" strokeWidth={STROKE.line} strokeLinecap="round">
        {STRANDS.map((s, i) => {
          // Kubische Kurve: Kontrollpunkte ziehen den Strang sanft zum Ziel.
          const c1x = 220;
          const c2x = 420;
          const d = `M 24 ${s.y} C ${c1x} ${s.y}, ${c2x} ${TARGET.y}, ${TARGET.x} ${TARGET.y}`;
          return (
            <path key={i} d={d} strokeDasharray={DASH.flow} opacity={s.opacity} />
          );
        })}
      </g>

      {/* Konvergenz-Knoten als Doppelring, Amber-Kern (nicht gruen). */}
      <circle
        cx={TARGET.x}
        cy={TARGET.y}
        r={11}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE.line}
        opacity={OPACITY.strong}
      />
      <circle
        cx={TARGET.x}
        cy={TARGET.y}
        r={5}
        fill="currentColor"
        opacity={OPACITY.strong}
      />
    </svg>
  );
}

export default ConvergeStrands;
