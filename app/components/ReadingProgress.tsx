/**
 * Lesefortschritt als duenner Balken am oberen Rand.
 *
 * Scroll-getrieben in reinem CSS (`animation-timeline: scroll()`, siehe
 * `.lesefortschritt` in `globals.css`). Bis zum 2026-10-02 lief das ueber einen
 * scroll- und resize-Lauscher mit rAF-Drossel, der bei jedem Scrollschritt
 * `scrollTop / (scrollHeight - clientHeight)` rechnete und daraus ein
 * `transform` setzte. Dieselbe Rechnung macht der Browser jetzt selbst, im
 * Compositor, ohne dass der Haupt-Thread beim Scrollen Arbeit bekommt.
 *
 * Damit ist es eine Server-Komponente: kein `use client`, nichts im Bundle.
 *
 * Ohne Unterstuetzung bleibt der Balken bei `scaleX(0)`, also unsichtbar. Das
 * ist der richtige Rueckfall: er ist `aria-hidden` und reine Zugabe, ein
 * fehlender Balken kostet keine Information.
 */
export function ReadingProgress() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[2px] bg-transparent no-print"
    >
      <div className="lesefortschritt h-full origin-left bg-accent/80" />
    </div>
  );
}
