import Link from 'next/link';

import { getProjects, getMessages, listMedia } from '@/lib/store';
import { WindowBar } from '../components/Terminal';

// Liest den mutablen Store → nie statisch prerendern.
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [projects, messages, media] = await Promise.all([
    getProjects(),
    getMessages(),
    listMedia(),
  ]);
  const unread = messages.filter((m) => m.status === 'neu').length;

  const cards = [
    {
      href: '/admin/projekte',
      label: 'Projekte',
      value: projects.length,
      hint: 'Fall-Studien & Übersicht pflegen',
    },
    {
      href: '/admin/posteingang',
      label: 'Posteingang',
      value: messages.length,
      hint: unread > 0 ? `${unread} neu` : 'keine neuen',
      badge: unread,
    },
    {
      href: '/admin/medien',
      label: 'Medien',
      value: media.length,
      hint: 'Bilder hochladen & verwalten',
    },
  ];

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        <span aria-hidden className="text-muted-dim">$ </span>
        cms --status
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Kontrollzentrum.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Hier pflegst du Inhalte selbst – Projekte, Kontaktnachrichten und Medien.
        Änderungen werden direkt im Store gespeichert und die öffentliche Seite zieht nach.
        Dieser Bereich ist nur aus deinem eigenen Netz erreichbar.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card-interactive group overflow-hidden rounded-lg border border-border bg-surface/50"
          >
            <WindowBar
              title={`~${c.href}`}
              right={
                c.badge && c.badge > 0 ? (
                  <span className="rounded-md border border-term/40 bg-term/10 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-term">
                    {c.badge} neu
                  </span>
                ) : null
              }
            />
            <div className="flex items-end justify-between gap-4 p-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-dim">
                  {c.label}
                </p>
                <p className="mt-2 text-sm text-muted">{c.hint}</p>
              </div>
              <span className="stat-minor text-accent transition-colors group-hover:text-accent-bright">
                {c.value}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
