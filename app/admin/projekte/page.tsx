import Link from 'next/link';

import { PROJECT_DETAILS } from '@/lib/project-details';
import { getProjects } from '@/lib/store';
import { StatusChip } from '../../components/StatusBadge';
import { ConfirmButton } from '../ConfirmButton';
import { deleteProjectAction, moveProjectAction } from '../actions';

export const dynamic = 'force-dynamic';

const CTRL =
  'rounded-md border border-border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-muted transition-colors hover:border-border-strong hover:text-accent';

export default async function AdminProjectsPage() {
  const projects = await getProjects();
  const last = projects.length - 1;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        <span aria-hidden className="text-muted-dim">$ </span>
        ls projekte/
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">Projekte</h1>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-dim">
            {projects.length} Einträge
          </span>
          <Link
            href="/admin/projekte/neu"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-bg transition-all hover:bg-accent-bright hover:shadow-glow"
          >
            + Neu
          </Link>
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Reihenfolge bestimmt die Anzeige auf der öffentlichen Seite. Änderungen sind nach dem
        Speichern sofort live (die Seite revalidiert automatisch).
      </p>

      <ul className="mt-8 divide-y divide-border/60 overflow-hidden rounded-lg border border-border bg-surface/40">
        {projects.map((p, i) => (
          <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:p-5">
            <span className="font-mono text-[0.7rem] tracking-widest text-muted-dim sm:w-36 sm:shrink-0">
              ~/{p.id}
            </span>
            <span className="font-display text-lg leading-tight text-text">{p.title}</span>
            <StatusChip status={p.status} locale="de" />
            {PROJECT_DETAILS[p.id] ? (
              <span className="font-mono text-[0.6rem] uppercase tracking-widest text-muted-dim">
                fall-studie
              </span>
            ) : null}

            <div className="ml-auto flex items-center gap-1.5">
              <form action={moveProjectAction}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="dir" value="up" />
                <button
                  type="submit"
                  disabled={i === 0}
                  aria-label="nach oben"
                  className={`${CTRL} disabled:cursor-default disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted`}
                >
                  ↑
                </button>
              </form>
              <form action={moveProjectAction}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="dir" value="down" />
                <button
                  type="submit"
                  disabled={i === last}
                  aria-label="nach unten"
                  className={`${CTRL} disabled:cursor-default disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted`}
                >
                  ↓
                </button>
              </form>
              <Link href={`/admin/projekte/${p.id}`} className={CTRL}>
                bearbeiten
              </Link>
              <Link
                href={`/projekte/${p.id}`}
                aria-label={`„${p.title}“ öffentlich ansehen`}
                className={CTRL}
              >
                ↗
              </Link>
              <form action={deleteProjectAction}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton
                  message={`Projekt „${p.title}“ wirklich löschen?`}
                  className={`${CTRL} hover:border-red-500/40 hover:text-red-300`}
                >
                  löschen
                </ConfirmButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
