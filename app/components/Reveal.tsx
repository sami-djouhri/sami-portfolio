'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode, Ref } from 'react';

/**
 * Scroll-Reveal-Wrapper. EIN geteilter Modul-Singleton-IntersectionObserver für die
 * ganze Seite (kein N-Observer-Overhead), markiert Elemente einmalig mit
 * data-revealed='true'. Bewegung lebt rein in globals.css (.reveal / .reveal-group),
 * ist GPU-leicht (transform/opacity), FOUC-frei (Versteck-Zustand nur unter html.js-ready)
 * und reduced-motion-safe (sofort sichtbar, kein Observer).
 *
 * Bewusst nur für UNTER-dem-Fold-Sektionen verwenden, Above-the-fold-Inhalt bleibt
 * statisch sichtbar (kein Hidden-bis-Hydration-Flash).
 */
let io: IntersectionObserver | null = null;

function getIO(): IntersectionObserver | null {
  if (io || typeof IntersectionObserver === 'undefined') return io;
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.setAttribute('data-revealed', 'true');
          io!.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
  );
  return io;
}

type RevealTag = 'div' | 'section' | 'ul' | 'ol' | 'li' | 'article';

export function Reveal({
  children,
  as = 'div',
  stagger = false,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  as?: RevealTag;
  /** Staffelt die direkten Kinder statt das Element selbst zu faden. */
  stagger?: boolean;
  /** Verzögerung in ms (nur für den nicht-gestaffelten Modus sinnvoll). */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // Hydration-Sentinel: signalisiert dem Watchdog (layout.tsx), dass JS lebt.
    (window as Window & { __revealReady?: boolean }).__revealReady = true;
    const el = ref.current;
    if (!el) return;
    const show = () => el.setAttribute('data-revealed', 'true');

    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      show();
      return;
    }
    const obs = getIO();
    if (!obs) {
      show();
      return;
    }
    // Bereits im Viewport beim Mount? Sofort zeigen (kein Flash bei Reload mitten auf der Seite).
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      show();
      return;
    }
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);

  const Component = as as 'div';
  return (
    <Component
      ref={ref as Ref<HTMLDivElement>}
      className={`${stagger ? 'reveal-group' : 'reveal'} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
