import type { ReactNode } from 'react';

/**
 * Scroll-Reveal-Wrapper. Traegt nur noch die Klasse, die Bewegung liegt
 * vollstaendig in `globals.css` (`.reveal` / `.reveal-group`, scroll-getrieben
 * ueber `animation-timeline: view()`).
 *
 * Bis zum 2026-10-02 war das eine Client-Komponente mit einem geteilten
 * IntersectionObserver, einem Hydration-Sentinel (`window.__revealReady`) und
 * einer Sonderbehandlung fuer uebersprungene Abschnitte. Alles drei entfaellt,
 * weil der Fortschritt jetzt aus der Geometrie kommt und nicht aus einem
 * Ereignis. Begruendung und Messung stehen im Kopf des Reveal-Blocks in
 * `globals.css`.
 *
 * Damit ist es eine Server-Komponente: kein `use client`, kein Browser-Code,
 * nichts davon landet im Bundle.
 *
 * Weiterhin bewusst nur fuer Abschnitte UNTER der Falz verwenden. Above the fold
 * ist es zwar harmlos (ein Element, dessen Eintritt bereits hinter ihm liegt,
 * steht auf dem Endzustand), aber dort gehoert keine Bewegung hin.
 */
type RevealTag = 'div' | 'section' | 'ul' | 'ol' | 'li' | 'article';

export function Reveal({
  children,
  as = 'div',
  stagger = false,
  className = '',
}: {
  children: ReactNode;
  as?: RevealTag;
  /** Staffelt die direkten Kinder statt das Element selbst zu faden. */
  stagger?: boolean;
  className?: string;
}) {
  const Component = as;
  return (
    <Component className={`${stagger ? 'reveal-group' : 'reveal'} ${className}`}>
      {children}
    </Component>
  );
}
