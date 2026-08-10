'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode, Ref } from 'react';

/**
 * Triggert EINMAL einen sehr dezenten Amber-Scan-Sweep über ein WindowBar-Panel,
 * wenn es in den Viewport scrollt („das Panel aktualisiert sich gerade"). Kein Loop:
 * IntersectionObserver setzt data-seen='1' und disconnectet sofort.
 *
 * Nur für die 3-4 echten WindowBar-Panels gedacht (ProofStrip, CTA), NIE für jede
 * Karte. Der Sweep lebt als ::before in globals.css (.scan-host), rein transform,
 * reduced-motion + print neutralisiert. `as`/`className` ersetzen den vorhandenen
 * Panel-Container, damit kein zusätzlicher Radius-Wrapper Doppel-Rundungen erzeugt.
 */
type ScanTag = 'div' | 'section';

export function ScanReveal({
  children,
  as = 'div',
  className = '',
}: {
  children: ReactNode;
  as?: ScanTag;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          el.setAttribute('data-seen', '1');
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Component = as as 'div';
  return (
    <Component ref={ref as Ref<HTMLDivElement>} className={`scan-host ${className}`}>
      {children}
    </Component>
  );
}
