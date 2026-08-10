import Link from 'next/link';

import { ProjectForm } from '../ProjectForm';

export const dynamic = 'force-dynamic';

export default function NewProjectPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        <span aria-hidden className="text-muted-dim">$ </span>
        touch projekte/neu.md
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">Neues Projekt</h1>
        <Link
          href="/admin/projekte"
          className="font-mono text-xs uppercase tracking-widest text-muted-dim transition-colors hover:text-accent"
        >
          ← Übersicht
        </Link>
      </div>

      <ProjectForm mode="neu" />
    </div>
  );
}
