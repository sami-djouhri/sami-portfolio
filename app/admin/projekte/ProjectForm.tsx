'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';

import type { Project } from '@/lib/projects';
import { saveProjectAction } from '../actions';
import { Field, ErrorBanner, Select, SubmitButton, Textarea } from '../FormFields';
import { DOMAINS, EMPTY_FORM_STATE, STATUS_LABEL, STATUSES } from '../form-state';

/**
 * Anlegen/Bearbeiten eines Projekts (Listen-Ebene: die Felder, die in Übersicht,
 * Karten und Detail-Kopf erscheinen). Die ausführliche Fall-Studie pro Projekt
 * bleibt bewusst Code (lib/project-details.ts), zu strukturiert für ein Textfeld.
 *
 * useFormState zeigt Validierungsfehler inline; bei Erfolg redirectet die Action.
 */
export function ProjectForm({
  project,
  mode,
}: {
  project?: Project;
  mode: 'neu' | 'edit';
}) {
  const [state, formAction] = useFormState(saveProjectAction, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <input type="hidden" name="mode" value={mode} />

      {state.error ? <ErrorBanner message={state.error} /> : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="ID (Slug)"
          name="id"
          defaultValue={project?.id}
          readOnly={mode === 'edit'}
          required
          placeholder="z. B. mein-projekt"
          hint={
            mode === 'edit'
              ? 'Teil der URL – beim Bearbeiten fix.'
              : 'a–z, 0–9, Bindestriche · wird zu /projekte/<id>'
          }
        />
        <Field label="Titel" name="title" defaultValue={project?.title} required />
      </div>

      <Field
        label="Tagline"
        name="tagline"
        defaultValue={project?.tagline}
        required
        hint="Ein Satz, der das Projekt auf den Punkt bringt."
      />

      <Textarea
        label="Beschreibung"
        name="description"
        defaultValue={project?.description}
        required
        rows={5}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Rolle" name="role" defaultValue={project?.role} required />
        <Field
          label="Zeitraum"
          name="year"
          defaultValue={project?.year}
          required
          placeholder="seit 2026"
        />
      </div>

      <Field
        label="Kennzahl / Highlight"
        name="highlight"
        defaultValue={project?.highlight}
        required
        hint="Die eine Zahl/Aussage, die im Detail-Kopf groß steht."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Select label="Domäne" name="domain" defaultValue={project?.domain ?? 'Suite'}>
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <Select label="Status" name="status" defaultValue={project?.status ?? 'im-aufbau'}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        label="Stack"
        name="stack"
        defaultValue={project?.stack.join('\n')}
        required
        rows={4}
        hint="Ein Werkzeug pro Zeile (oder kommagetrennt)."
      />

      <Field
        label="Externer Link (optional)"
        name="href"
        defaultValue={project?.href}
        placeholder="https://…"
        hint="Live-Demo oder Repo, falls öffentlich."
      />

      <fieldset className="space-y-6 rounded-md border border-border/60 p-5">
        <legend className="px-2 font-mono text-[0.7rem] uppercase tracking-widest text-muted-dim">
          English (optional · fällt sonst auf Deutsch zurück)
        </legend>
        <Field label="Tagline (EN)" name="taglineEn" defaultValue={project?.taglineEn} />
        <Textarea
          label="Description (EN)"
          name="descriptionEn"
          defaultValue={project?.descriptionEn}
          rows={5}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Role (EN)" name="roleEn" defaultValue={project?.roleEn} />
          <Field label="Highlight (EN)" name="highlightEn" defaultValue={project?.highlightEn} />
        </div>
      </fieldset>

      <p className="font-mono text-[0.7rem] leading-relaxed text-muted-dim">
        <span aria-hidden className="mr-1.5 text-accent/70">›</span>
        Die ausführliche Fall-Studie (Problem/Vorgehen/Architektur) wird im Code gepflegt und
        bleibt von diesem Formular unberührt.
      </p>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <SubmitButton label={mode === 'neu' ? 'Projekt anlegen' : 'Speichern'} />
        <Link
          href="/admin/projekte"
          className="font-mono text-xs uppercase tracking-widest text-muted-dim transition-colors hover:text-text"
        >
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
