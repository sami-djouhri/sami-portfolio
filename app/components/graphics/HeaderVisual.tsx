import type { ReactNode } from 'react';

/**
 * Platziert ein ruhiges Signatur-Visual hinter dem Seiten-Kopf: absolut
 * positioniert, nach unten ausgeblendet, erst ab sm sichtbar, Amber
 * (text-accent) an das SVG vererbt.
 * Dekorativ, daher aria-hidden am Container.
 */
export function HeaderVisual({ visual, children }: { visual: ReactNode; children: ReactNode }) {
  return (
    <div className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-4 -z-10 hidden h-44 text-accent [mask-image:linear-gradient(to_bottom,#000,transparent)] sm:block"
      >
        {visual}
      </div>
      {children}
    </div>
  );
}
