// Streng lineares 24x24 Icon-Set im Blueprint/TUI-Look.
// Alle Icons: stroke currentColor (Amber vom Parent), Strichgewicht 1.6.
// Dekorativ, daher aria-hidden. className wird durchgereicht.
import React from 'react';

// Gemeinsame Props: nur optionale className.
export interface IconProps {
  className?: string;
}

// Gemeinsame SVG-Grundattribute fuer ein einheitliches Strichbild.
function svgBase(className?: string) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className,
  };
}

// --- Domaenen-Icons (5) ---

// Suite: gestapelte Fenster/Ebenen.
export function IconSuite({ className }: IconProps) {
  return (
    <svg {...svgBase(className)}>
      <rect x={4} y={7} width={12} height={9} rx={1} />
      <path d="M8 7V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2" />
      <path d="M4 10.5h12" />
    </svg>
  );
}

// AI: Knoten-Netz auf Chip.
export function IconAI({ className }: IconProps) {
  return (
    <svg {...svgBase(className)}>
      <rect x={7} y={7} width={10} height={10} rx={1.5} />
      <circle cx={10} cy={10} r={1} />
      <circle cx={14} cy={14} r={1} />
      <path d="M10.7 10.7 13.3 13.3" />
      <path d="M12 7V4M12 20v-3M7 12H4M20 12h-3" />
    </svg>
  );
}

// Infra: Server-Rack/Stapel.
export function IconInfra({ className }: IconProps) {
  return (
    <svg {...svgBase(className)}>
      <rect x={5} y={4} width={14} height={5} rx={1} />
      <rect x={5} y={11} width={14} height={5} rx={1} />
      <path d="M8 6.5h.01M8 13.5h.01" />
      <path d="M12 16v3M9 19h6" />
    </svg>
  );
}

// Bots: Chat-Bubble mit Prompt-Cursor.
export function IconBots({ className }: IconProps) {
  return (
    <svg {...svgBase(className)}>
      <path d="M5 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H10l-4 3v-3H6a1 1 0 0 1-1-1z" />
      <path d="M9 10h.01" />
      <path d="M12.5 10h3" />
    </svg>
  );
}

// Kunden: Storefront/Schaufenster.
export function IconKunden({ className }: IconProps) {
  return (
    <svg {...svgBase(className)}>
      <path d="M4 9 5.5 5h13L20 9" />
      <path d="M4 9v10h16V9" />
      <path d="M4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
      <path d="M9 19v-4h4v4" />
    </svg>
  );
}

// --- Leistungs-Icons (4, generisch) ---

// Web: Browser-Fenster.
export function IconWeb({ className }: IconProps) {
  return (
    <svg {...svgBase(className)}>
      <rect x={4} y={5} width={16} height={14} rx={1.5} />
      <path d="M4 9h16" />
      <path d="M7 7h.01M9.5 7h.01" />
    </svg>
  );
}

// Server: Cloud/VPS.
export function IconServer({ className }: IconProps) {
  return (
    <svg {...svgBase(className)}>
      <path d="M7 16a3.5 3.5 0 0 1-.3-6.98A4.5 4.5 0 0 1 15.5 9 3.5 3.5 0 0 1 16 16z" />
      <path d="M9 19h8" />
      <path d="M12 16v3" />
    </svg>
  );
}

// Wordpress/CMS: Dokument mit Zeilen.
export function IconWordpress({ className }: IconProps) {
  return (
    <svg {...svgBase(className)}>
      <path d="M7 4h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <path d="M14 4v4h4" />
      <path d="M9 12h6M9 15h6M9 18h3" />
    </svg>
  );
}

// SmartHome: Haus mit Signalwellen.
export function IconSmartHome({ className }: IconProps) {
  return (
    <svg {...svgBase(className)}>
      <path d="M5 11 12 5l7 6" />
      <path d="M7 10v8h10v-8" />
      <path d="M10.5 14.5a2 2 0 0 1 3 0" />
      <path d="M12 17h.01" />
    </svg>
  );
}

// --- Utility-Icons ---

// Arrow: Pfeil nach rechts.
export function IconArrow({ className }: IconProps) {
  return (
    <svg {...svgBase(className)}>
      <path d="M4 12h16" />
      <path d="M14 6l6 6-6 6" />
    </svg>
  );
}

// Terminal: Prompt-Zeichen und Cursor.
export function IconTerminal({ className }: IconProps) {
  return (
    <svg {...svgBase(className)}>
      <rect x={4} y={5} width={16} height={14} rx={1.5} />
      <path d="M8 10l3 2.5L8 15" />
      <path d="M13 15h3" />
    </svg>
  );
}

// Map: Domain-String auf passendes Icon.
export const DOMAIN_ICONS: Record<string, (props: IconProps) => React.JSX.Element> = {
  Suite: IconSuite,
  AI: IconAI,
  Infra: IconInfra,
  Bots: IconBots,
  Kunden: IconKunden,
};
