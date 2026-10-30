'use client';

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-text transition-colors hover:border-border-strong hover:text-accent"
    >
      <span aria-hidden>⎙</span> {label}
    </button>
  );
}
