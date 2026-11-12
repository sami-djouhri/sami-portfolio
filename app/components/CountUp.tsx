'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Zählt eine Zahl beim Sichtbarwerden von 0 auf den Zielwert, verstärkt die
 * „lebendige, betriebene Maschine“-Aussage auf dem Live-Beweis-Streifen.
 *
 * - SSR/no-JS/Suchmaschine sehen sofort den Endwert (val === null → Endwert).
 * - Kein Layout-Shift: ein unsichtbarer Spacer reserviert die Endwert-Breite,
 *   die animierende Zahl liegt absolut darüber (robust auch bei Serif-Ziffern
 *   ohne tabular-nums).
 * - prefers-reduced-motion: bleibt auf dem Endwert (keine Animation).
 */
function fmt(n: number, decimals: number, suffix: string): string {
  return n.toFixed(decimals) + suffix;
}

export function CountUp({
  to,
  decimals = 0,
  suffix = '',
  duration = 1200,
  className = '',
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // null = Endwert (SSR & Ruhezustand). Zahl = laufende Animation.
  const [val, setVal] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let done = false;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e || !e.isIntersecting || done) return;
        done = true;
        obs.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out-cubic
          if (p < 1) {
            setVal(to * eased);
            raf = requestAnimationFrame(tick);
          } else {
            setVal(null); // zurück auf exakten Endwert
          }
        };
        setVal(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  const finalText = fmt(to, decimals, suffix);
  const showText = val === null ? finalText : fmt(val, decimals, suffix);

  return (
    <span ref={ref} className={`relative inline-block tabular-nums ${className}`}>
      <span className="invisible" aria-hidden>
        {finalText}
      </span>
      <span className="absolute inset-0" aria-hidden={val !== null}>
        {showText}
      </span>
    </span>
  );
}
