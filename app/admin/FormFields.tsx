'use client';

import { useFormStatus } from 'react-dom';

/**
 * Geteilte, on-brand Formular-Bausteine für die Admin-CRUD-Formulare
 * (Projekte & Leistungen): Mono-Labels, ruhige Inputs, Amber-Fokus, ein Submit
 * mit Pending-State und ein Fehler-Banner. Eine Quelle, damit beide Formulare
 * identisch aussehen.
 */
export const FIELD_CLASS =
  'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 read-only:opacity-70';

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-300"
    >
      <span aria-hidden className="mr-2 text-red-400">✗</span>
      {message}
    </p>
  );
}

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg transition-all hover:bg-accent-bright hover:shadow-glow disabled:cursor-default disabled:opacity-50"
    >
      {pending ? 'Speichere…' : `${label} →`}
    </button>
  );
}

function FieldShell({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
      {hint ? <span className="mt-1.5 block text-xs text-muted-dim">{hint}</span> : null}
    </label>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  hint,
  required,
  readOnly,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  hint?: string;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}) {
  return (
    <FieldShell label={label} hint={hint}>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        required={required}
        readOnly={readOnly}
        placeholder={placeholder}
        className={FIELD_CLASS}
      />
    </FieldShell>
  );
}

export function Textarea({
  label,
  name,
  defaultValue,
  hint,
  required,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  hint?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <FieldShell label={label} hint={hint}>
      <textarea
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={rows}
        className={`${FIELD_CLASS} resize-y leading-relaxed`}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <FieldShell label={label}>
      <select name={name} defaultValue={defaultValue} className={FIELD_CLASS}>
        {children}
      </select>
    </FieldShell>
  );
}
