import { STROKE, OPACITY, TERM_GREEN } from './primitives';

// Horizontale EKG/Heartbeat-Linie ueber die volle Breite: meist flach mit ein paar
// Ausschlaegen. GENAU EIN funktionaler "jetzt"-Punkt in term-Gruen (statisch).

// Ruhelinie auf y=60. Pfad mit ein paar Zacken, sonst flach.
const BASE_Y = 60;
const PULSE = { x: 470, y: BASE_Y };

const PATH =
  `M 0 ${BASE_Y} H 120 ` +
  `L 140 ${BASE_Y - 8} L 156 ${BASE_Y + 34} L 172 ${BASE_Y - 40} L 188 ${BASE_Y + 10} L 204 ${BASE_Y} ` +
  `H 300 ` +
  `L 316 ${BASE_Y - 6} L 328 ${BASE_Y + 20} L 340 ${BASE_Y - 22} L 352 ${BASE_Y} ` +
  `H ${PULSE.x} ` +
  `H 640`;

export function PulseBand({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d={PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE.line}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={OPACITY.base}
      />

      {/* Der eine "jetzt"-Punkt: term-Gruen, statisch, mit Glow. */}
      <circle
        cx={PULSE.x}
        cy={PULSE.y}
        r={5}
        fill={TERM_GREEN}
        style={{ filter: 'drop-shadow(0 0 4px #5ac56f)' }}
      />
    </svg>
  );
}

export default PulseBand;
