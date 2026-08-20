import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getProject } from '@/lib/store';
import { ProjectForm } from '../ProjectForm';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const project = await getProject(params.id);
  if (!project) notFound();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        <span aria-hidden className="text-muted-dim">$ </span>
        vim projekte/{project.id}.md
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">{project.title}</h1>
        <Link
          href={`/projekte/${project.id}`}
          className="font-mono text-xs uppercase tracking-widest text-muted-dim transition-colors hover:text-accent"
        >
          öffentliche Seite ↗
        </Link>
      </div>

      <ProjectForm mode="edit" project={project} />
    </div>
  );
}
