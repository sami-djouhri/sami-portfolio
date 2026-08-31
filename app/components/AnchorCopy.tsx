'use client';

import { useState } from 'react';

/**
 * Kleiner Deep-Link-Kopierer an Detail-Section-Überschriften. Erscheint on-hover
 * (group-hover) als „#“, kopiert die URL samt Anker in die Zwischenablage und setzt
 * den Hash in der Adresszeile. Dev-freundliches Detail, kein neues Dep.
 */
export function AnchorCopy({ id, label }: { id: string; label: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    const done = () => {
      setCopied(true);
      history.replaceState(null, '', `#${id}`);
      window.setTimeout(() => setCopied(false), 1200);
    };
    if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(url).then(done, done);
    else done();
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={label}
      className="ml-3 inline-block px-1 align-middle font-mono text-2xl text-muted-dim opacity-0 transition-opacity duration-[140ms] hover:text-accent focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-40"
    >
      {copied ? '✓' : '#'}
    </button>
  );
}
