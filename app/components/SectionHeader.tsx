import type { ReactNode } from 'react';

import { TermCursor } from './Terminal';

export function SectionHeader({
  index,
  eyebrow,
  title,
  anchor,
}: {
  index?: string;
  eyebrow?: string;
  title: string;
  /**
   * Optionales Bedienelement direkt hinter dem Titel, derzeit der Anker-Kopierer.
   * ★ Gehört in dieselbe Zeile wie der Titel, nicht in einen eigenen Block darunter:
   * `AnchorCopy` erscheint per `group-hover`, und ein separater `<div>` ohne `group`
   * liess es auf dem Desktop NIE sichtbar werden, während es auf dem Handy als
   * unerklärtes „#" allein auf einer rechtsbündigen Zeile stand (gemessen auf den
   * Logbuch-Seiten, 2026-09-15). Auf den Projekt-Detailseiten war es von Anfang an
   * inline gelöst, hier zieht die zweite Stelle nach.
   */
  anchor?: ReactNode;
}) {
  return (
    // ★ Unter `sm:` untereinander statt nebeneinander: bei 390 px stand das rechte
    // Eyebrow neben dem Titel und brach mitten im Token um („UNAME -" / "A"), was
    // gerade die Terminal-Identität untergräbt, die es tragen soll.
    <div className="relative flex flex-col gap-1.5 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      {/* Lead-Segment am linken Ende der Grundlinie markiert den Sektions-Start und
          lässt die ruhigen mono-Köpfe „authored“ wirken, ohne die groß-nummerierten
          section-anchor-Köpfe zu imitieren (Zwei-Rollen-Doktrin). Grün, weil die
          Gliederung vom System kommt und nicht angeboten wird wie ein Knopf. */}
      <span aria-hidden className="absolute -bottom-px left-0 h-px w-10 bg-term" />
      <div className="flex items-baseline gap-4">
        {index ? (
          <span className="font-mono text-sm text-term/80">[{index}]</span>
        ) : null}
        <h2 className="font-mono text-xl font-medium uppercase tracking-wide text-text sm:text-2xl">
          {title}
          {anchor}
        </h2>
      </div>
      {eyebrow ? (
        <span className="font-mono text-xs uppercase tracking-widest text-muted">{eyebrow}</span>
      ) : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  command,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  /** Wenn gesetzt, wird der Eyebrow als ausgeführter Befehl mit Cursor gerendert. */
  command?: boolean;
}) {
  return (
    <header className="border-b border-border pb-10">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-term">
        <span aria-hidden className="text-muted-dim">$</span>
        {eyebrow}
        {command ? <TermCursor /> : null}
      </p>
      <h1 className="mt-4 font-display text-display-page">
        {title}
      </h1>
      {lead ? (
        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-text/90">{lead}</p>
      ) : null}
    </header>
  );
}
