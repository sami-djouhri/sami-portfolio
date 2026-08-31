import type { ReactNode } from 'react';

import { DOMAIN_ICONS, STACK_ICONS, type IconProps } from './graphics/icons';
import type { Domain, StackKey } from '@/lib/projects';

/**
 * Ikonisches Erkennungszeichen.
 *
 * Der Zweck ist, Lesearbeit zu ERSETZEN, nicht sie zu schmücken: in einer Liste aus
 * zwei Dutzend Zeilen erkennt man „das sind die Infrastruktur-Sachen" am Umriss,
 * bevor man das erste Wort gelesen hat. Vorher stand an diesen Stellen für jede
 * Zeile dasselbe `›` — ein Zeichen ohne Information.
 *
 * Farbe folgt der Zwei-Stimmen-Doktrin: eine Einordnung kommt vom System, also
 * spricht sie GRÜN. Beim Hover der umgebenden Karte wechselt sie nach Amber, weil
 * dann der Mensch handelt.
 *
 * A11y: das Zeichen ist `aria-hidden`. Wo es in Links steht, führt deren
 * `aria-label` die Einordnung im Text mit — ein zusätzlicher sr-only-Text würde vom
 * `aria-label` des Links ohnehin verschluckt und wäre nur scheinbar zugänglich.
 */
const BOX = {
  sm: 'size-7',
  md: 'size-9',
  lg: 'size-11',
} as const;

const GLYPH = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
} as const;

export type MarkSize = keyof typeof BOX;

function Mark({
  Icon,
  size,
  className,
}: {
  Icon: (props: IconProps) => ReactNode;
  size: MarkSize;
  className: string;
}) {
  return (
    <span
      aria-hidden
      className={`domain-mark relative grid shrink-0 place-items-center rounded-md border border-term-dim/45 bg-term/[0.06] text-term transition-colors duration-fast ${BOX[size]} ${className}`}
    >
      <Icon className={GLYPH[size]} />
    </span>
  );
}

/** Zeichen einer Projekt-Domäne (Suite/AI/Infra/Bots/Web). */
export function DomainMark({
  domain,
  size = 'md',
  className = '',
}: {
  domain: Domain;
  size?: MarkSize;
  className?: string;
}) {
  return <Mark Icon={DOMAIN_ICONS[domain]} size={size} className={className} />;
}

/** Zeichen einer Stack-Disziplin (infra/backend/frontend/ai). */
export function StackMark({
  stack,
  size = 'md',
  className = '',
}: {
  stack: StackKey;
  size?: MarkSize;
  className?: string;
}) {
  return <Mark Icon={STACK_ICONS[stack]} size={size} className={className} />;
}
