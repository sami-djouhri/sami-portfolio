// Gemeinsames SVG-Vokabular fuer alle Blueprint/TUI-Grafiken.
// Farbe kommt vom Parent via currentColor (text-accent = Amber).
// term-Gruen (#5ac56f) NUR fuer genau einen funktionalen live-Zustand.
// Hinweis: Datei ist .ts, daher kein JSX. Elemente via React.createElement.
import React from 'react';

// Strichgewichte: hair fein, line normal, emph betont.
export const STROKE = { hair: 1, line: 1.2, emph: 1.6 } as const;

// Deckkraft-Stufen fuer geschichtete Blueprint-Optik.
export const OPACITY = { ghost: 0.05, weak: 0.14, base: 0.42, strong: 0.7 } as const;

// Strichmuster: flow fuer Datenfluss, grid fuer Raster, solid durchgezogen.
export const DASH = { flow: '5 7', grid: '2 6', solid: 'none' } as const;

// term-Gruen als einzige Quelle fuer den live-Zustand.
export const TERM_GREEN = '#5ac56f';

interface BlueprintGridProps {
  // Eindeutige id, damit mehrere Grids kollisionsfrei bleiben.
  id: string;
  // Rasterweite in SVG-Einheiten.
  size?: number;
}

// Feines Punkt/Linien-Raster als wiederverwendbares Pattern.
// Nutzung im Aufrufer: <rect fill={`url(#${id})`} /> im selben SVG.
export function BlueprintGrid({ id, size = 8 }: BlueprintGridProps): React.ReactElement {
  return React.createElement(
    'defs',
    null,
    React.createElement(
      'pattern',
      { id, width: size, height: size, patternUnits: 'userSpaceOnUse' },
      // Feiner Punkt oben-links.
      React.createElement('circle', {
        cx: 0.6,
        cy: 0.6,
        r: 0.6,
        fill: 'currentColor',
        opacity: OPACITY.ghost,
      }),
      // Zarte Rasterlinien.
      React.createElement('path', {
        d: `M ${size} 0 L 0 0 0 ${size}`,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: STROKE.hair,
        opacity: OPACITY.ghost,
      }),
    ),
  );
}

interface NodeProps {
  cx: number;
  cy: number;
  r?: number;
  // live schaltet den Kern auf term-Gruen mit Glow.
  live?: boolean;
}

// Doppelring-Knoten: aeusserer Ring (stroke), innerer gefuellter Kern.
export function Node({ cx, cy, r = 6, live = false }: NodeProps): React.ReactElement {
  return React.createElement(
    'g',
    { 'aria-hidden': true },
    React.createElement('circle', {
      cx,
      cy,
      r,
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: STROKE.line,
      opacity: OPACITY.strong,
    }),
    React.createElement('circle', {
      cx,
      cy,
      r: r * 0.42,
      fill: live ? TERM_GREEN : 'currentColor',
      filter: live ? 'drop-shadow(0 0 3px #5ac56f)' : undefined,
    }),
  );
}
