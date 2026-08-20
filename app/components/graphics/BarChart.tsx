// Server-SVG-Balkendiagramm fuer echte Daten (ersetzt CSS-Balken auf /stats).
// Amber kommt vom Parent (text-accent) via currentColor.
// term-Gruen (#5ac56f) NUR fuer den funktionalen live-Balken.
import React from 'react';
import { STROKE, OPACITY, DASH } from './primitives';

interface BarDatum {
  label: string;
  value: number;
  live?: boolean;
}

interface BarChartProps {
  data: BarDatum[];
  max?: number;
  unit?: string;
  className?: string;
  ariaLabel?: string;
}

const TERM_GREEN = '#5ac56f';

// Layout-Konstanten in SVG-Einheiten.
const ROW_H = 28; // Zeilenhoehe
const AXIS_X = 2; // Achslinie links
const BAR_X = 3; // Balkenstart
const BAR_MAX_W = 74; // maximale Balkenbreite
const VALUE_X = 99; // Wert rechtsbuendig
const LABEL_Y_OFF = 9; // Label oberhalb des Balkens
const BAR_Y_OFF = 14; // Balken-Oberkante in der Zeile
const BAR_H = 7; // Balkenhoehe

export default function BarChart({
  data,
  max,
  unit = '',
  className,
  ariaLabel,
}: BarChartProps) {
  // Guard: leere Daten ergeben kein Diagramm.
  if (data.length === 0) {
    return null;
  }

  const values = data.map((d) => d.value);
  // max default = groesster Wert, aber nie 0 (Division schuetzen).
  const computedMax = max ?? Math.max(...values);
  const safeMax = computedMax > 0 ? computedMax : 1;

  const height = data.length * ROW_H + 4;
  const label = ariaLabel ?? 'Balkendiagramm';

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      className={className}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Achslinie links */}
      <line
        x1={AXIS_X}
        y1={2}
        x2={AXIS_X}
        y2={height - 2}
        stroke="currentColor"
        strokeWidth={STROKE.hair}
        opacity={OPACITY.base}
      />
      {data.map((d, i) => {
        // value auf [0, safeMax] klemmen, damit Balken nie ueberlaeuft.
        const clamped = Math.max(0, Math.min(d.value, safeMax));
        const w = (clamped / safeMax) * BAR_MAX_W;
        const rowTop = i * ROW_H + 2;
        const barY = rowTop + BAR_Y_OFF;
        const trackY = barY + BAR_H / 2;
        const fill = d.live ? TERM_GREEN : 'currentColor';
        return (
          <g key={`${d.label}-${i}`}>
            {/* Label oberhalb des Balkens */}
            <text
              x={BAR_X}
              y={rowTop + LABEL_Y_OFF}
              fill="currentColor"
              fontFamily="monospace"
              fontSize={4.5}
              opacity={OPACITY.strong}
            >
              {d.label}
            </text>
            {/* Track-Linie als gestricheltes Raster */}
            <line
              x1={BAR_X}
              y1={trackY}
              x2={BAR_X + BAR_MAX_W}
              y2={trackY}
              stroke="currentColor"
              strokeWidth={STROKE.hair}
              strokeDasharray={DASH.grid}
              opacity={OPACITY.weak}
            />
            {/* Gefuellter Balken */}
            <rect
              x={BAR_X}
              y={barY}
              width={w}
              height={BAR_H}
              rx={1}
              fill={fill}
              opacity={d.live ? OPACITY.strong : OPACITY.base}
            />
            {/* Wert rechtsbuendig, tabular-nums */}
            <text
              x={VALUE_X}
              y={trackY + 1.6}
              fill="currentColor"
              fontFamily="monospace"
              fontSize={4.5}
              textAnchor="end"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {d.value}
              {unit}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
