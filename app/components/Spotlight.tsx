'use client';

import { useRef } from 'react';
import type { PointerEvent, ReactNode, Ref } from 'react';

/**
 * Pointer-reaktiver Amber-Spotlight für große Panels (ProofStrip / CTA). onPointerMove
 * schreibt nur die CSS-Variablen --mx/--my (kein React-Re-Render); der weiche
 * radial-gradient-Glanz lebt als ::before in globals.css (.spotlight) und ist hinter
 * @media (hover:hover) gegated (auf Touch nutzlos → kein toter Listener-Effekt).
 *
 * Bewusst nur auf 1-2 Panels einsetzen, nie flächig (sonst Effekt-Gewitter).
 */
type SpotlightTag = 'div' | 'section';

export function Spotlight({
  children,
  as = 'div',
  className = '',
}: {
  children: ReactNode;
  as?: SpotlightTag;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: PointerEvent) => {
    // Auf groben Zeigern (Touch) gibt es keinen Spotlight (::before ist hover:hover-
    // gegated), Listener früh verlassen, kein nutzloses setProperty.
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - b.left) / b.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - b.top) / b.height) * 100}%`);
  };

  const Component = as as 'div';
  return (
    <Component ref={ref as Ref<HTMLDivElement>} onPointerMove={onMove} className={`spotlight ${className}`}>
      {children}
    </Component>
  );
}
