'use client';

import { useState } from 'react';

/** Kopiert einen Text (die Medien-URL) in die Zwischenablage, mit kurzer Quittung. */
export function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* Clipboard nicht verfügbar, kein harter Fehler. */
        }
      }}
    >
      {copied ? 'kopiert ✓' : 'URL kopieren'}
    </button>
  );
}
