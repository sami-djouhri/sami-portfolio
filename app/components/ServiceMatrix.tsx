/**
 * Statusmatrix: eine Zelle je laufendem Dienst.
 *
 * Warum das hier steht: die Kernaussage der Seite war eine ZAHL („162"), und eine
 * Zahl muss man lesen und dann in eine Vorstellung übersetzen. Die Matrix überspringt
 * beide Schritte — man sieht die Größenordnung und die Gesundheit im selben Blick,
 * in dem man die Seite überhaupt erfasst. Die Zahl bleibt daneben stehen, sie ist
 * jetzt die Beschriftung des Bildes statt sein Ersatz.
 *
 * Ehrlichkeit: die Matrix zeichnet exakt `services` Zellen, davon `drift` in Amber.
 * Sie erfindet nichts und rundet nicht. Wächst die Zahl in der `.env`, wächst das Bild.
 *
 * Privacy: reines Aggregat. Keine Namen, keine Reihenfolge, keine Gruppierung nach
 * Host — die Zellen sind bewusst ununterscheidbar, damit aus dem Bild nichts über
 * die interne Struktur ablesbar ist.
 *
 * Bewegung: EIN animiertes Element (ein Verlaufs-Rechteck, das durch eine Maske aus
 * den Zellen wandert), nicht 162 animierte Zellen — sonst wäre das auf schwacher
 * Hardware ein Ruckel-Generator. `prefers-reduced-motion` blendet es aus.
 */
const CELL = 8;
const GAP = 3;
const PITCH = CELL + GAP;

/** Grob 4,5:1 breit — passt in eine Panel-Spalte, ohne zur Briefmarke zu werden. */
function gridShape(count: number): { cols: number; rows: number } {
  const cols = Math.max(1, Math.ceil(Math.sqrt(count * 4.5)));
  return { cols, rows: Math.max(1, Math.ceil(count / cols)) };
}

/**
 * Verteilt die Drift-Zellen deterministisch über das Feld statt sie an den Anfang
 * zu klumpen. Kein Math.random: der Server rendert das statisch vor, ein Zufallswert
 * ergäbe bei der Hydration ein anderes Bild (Hydration-Drift).
 */
function driftIndices(count: number, drift: number): Set<number> {
  const out = new Set<number>();
  if (drift <= 0 || count <= 0) return out;
  const step = count / Math.min(drift, count);
  for (let i = 0; i < Math.min(drift, count); i++) {
    out.add(Math.floor(i * step + step / 2));
  }
  return out;
}

export function ServiceMatrix({
  services,
  drift = 0,
  id = 'svc',
}: {
  services: number;
  drift?: number;
  /** Eindeutiges Präfix für die SVG-Defs, falls die Matrix mehrfach auf einer Seite steht. */
  id?: string;
}) {
  const count = Math.max(0, Math.floor(services));
  if (count === 0) return null;

  const { cols, rows } = gridShape(count);
  const w = cols * PITCH - GAP;
  const h = rows * PITCH - GAP;
  const bad = driftIndices(count, drift);

  const cells = Array.from({ length: count }, (_, i) => ({
    x: (i % cols) * PITCH,
    y: Math.floor(i / cols) * PITCH,
    drift: bad.has(i),
  }));

  const maskId = `${id}-matrix-mask`;
  const sweepId = `${id}-matrix-sweep`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      role="presentation"
      aria-hidden
      className="matrix block h-auto w-full overflow-visible"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Maske aus den Zellen: der Lichtwisch unten wird dadurch exakt auf die
            Zellenform beschnitten und leuchtet nicht in die Zwischenräume. */}
        <mask id={maskId}>
          {cells.map((c, i) => (
            <rect key={i} x={c.x} y={c.y} width={CELL} height={CELL} rx={1.5} fill="#fff" />
          ))}
        </mask>
        <linearGradient id={sweepId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5ac56f" stopOpacity="0" />
          <stop offset="50%" stopColor="#8ee0a0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#5ac56f" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Ruhezustand: alle Dienste laufen (grün), Abweichungen in Amber. Die
          leichte Helligkeitsstreuung ist rein optisch — sie nimmt dem Raster das
          Tote, ohne eine Aussage über einzelne Zellen zu behaupten. */}
      {cells.map((c, i) => (
        <rect
          key={i}
          x={c.x}
          y={c.y}
          width={CELL}
          height={CELL}
          rx={1.5}
          fill={c.drift ? '#e0a458' : '#5ac56f'}
          opacity={c.drift ? 0.95 : 0.34 + ((i * 37) % 11) / 44}
        />
      ))}

      {/* Der eine bewegte Knoten: ein Lichtwisch, der langsam über das Feld läuft
          wie ein Bildschirm, der sich auffrischt.
          Start- und Endpunkt kommen als Custom Properties herein, weil die Breite
          von der Dienstzahl abhängt: ein Prozentwert in `translateX()` bezöge sich
          auf die Bounding-Box des Rechtecks, nicht auf das Feld, und liefe je nach
          Zellenzahl unterschiedlich weit. In SVG sind `px` hier Nutzereinheiten. */}
      <g mask={`url(#${maskId})`}>
        <rect
          className="matrix-sweep"
          x={0}
          y={0}
          width={w * 0.45}
          height={h}
          fill={`url(#${sweepId})`}
          style={
            {
              '--sweep-from': `${-w * 0.45}px`,
              '--sweep-to': `${w}px`,
            } as React.CSSProperties
          }
        />
      </g>
    </svg>
  );
}
