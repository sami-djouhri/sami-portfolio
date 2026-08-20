/**
 * Terminal-Signatur-Bausteine. Tragen die "Premium-TUI"-Identität:
 * der Prompt `sami@djouhri:~$` als Wortzeichen, ein blinkender Block-Cursor
 * als einzige Bewegungs-Signatur, eine schmale Fenster-Titelleiste für Panels.
 * Privacy-Regel: `host` ist bewusst `djouhri` (Marke), nie ein echter Hostname.
 */
import type { ReactNode } from 'react';

export function Prompt({
  path = '~',
  command,
  cursor = false,
  typing = false,
  className = '',
}: {
  path?: string;
  command?: string;
  cursor?: boolean;
  /** Lässt den mono-Command einmal „eintippen“ (reines CSS, .boot-cmd). */
  typing?: boolean;
  className?: string;
}) {
  return (
    <span className={`prompt ${className}`}>
      <span className="prompt-user">sami</span>
      <span className="prompt-sign">@</span>
      <span className="prompt-host">djouhri</span>
      <span className="prompt-sign">:</span>
      <span className="prompt-path">{path}</span>
      <span className="prompt-sign">$</span>
      {command ? (
        typing ? (
          <span className="boot-cmd ml-2 text-text/90">{command}</span>
        ) : (
          <span className="ml-2 text-text/90">{command}</span>
        )
      ) : null}
      {cursor ? <TermCursor /> : null}
    </span>
  );
}

export function TermCursor({ accent = false }: { accent?: boolean }) {
  return (
    <span
      aria-hidden
      className={`term-cursor${accent ? ' term-cursor--accent' : ''}`}
    />
  );
}

/**
 * Fenster-Chrome: schmale Leiste mit drei Punkten und optionalem Mono-Titel,
 * für Panels, die wie ein TUI-Fenster wirken sollen.
 */
export function WindowBar({
  title,
  right,
  className = '',
}: {
  title?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`window-bar ${className}`}>
      <span className="term-dots" aria-hidden>
        <span />
        <span />
        <span />
      </span>
      {title ? (
        <span className="truncate font-mono text-[0.7rem] tracking-widest text-muted-dim">
          {title}
        </span>
      ) : null}
      {right ? <span className="ml-auto">{right}</span> : null}
    </div>
  );
}

/**
 * Mono-Eyebrow als Pfad/Command (`~/projekte`, `cat über-mich.md`).
 * Vereinheitlicht die "Sektion = Befehl"-Sprache über alle Seiten.
 */
export function CommandEyebrow({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent ${className}`}
    >
      <span aria-hidden className="text-muted-dim">
        $
      </span>
      {children}
    </span>
  );
}
