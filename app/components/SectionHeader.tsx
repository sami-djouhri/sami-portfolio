import { TermCursor } from './Terminal';

export function SectionHeader({
  index,
  eyebrow,
  title,
}: {
  index?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="relative flex items-end justify-between gap-6 border-b border-border pb-3">
      {/* Amber-Lead: ein kurzes Akzent-Segment am linken Ende der Grundlinie markiert
          den Sektions-Start und lässt die ruhigen mono-Köpfe „authored“ wirken, ohne
          die groß-nummerierten section-anchor-Köpfe zu imitieren (Zwei-Rollen-Doktrin). */}
      <span aria-hidden className="absolute -bottom-px left-0 h-px w-10 bg-accent" />
      <div className="flex items-baseline gap-4">
        {index ? (
          <span className="font-mono text-sm text-accent/70">[{index}]</span>
        ) : null}
        <h2 className="font-mono text-xl font-medium uppercase tracking-wide text-text sm:text-2xl">
          {title}
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
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
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
