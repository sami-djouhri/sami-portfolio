'use client';

import { useFormState } from 'react-dom';

import { uploadMediaAction } from '../actions';
import { ErrorBanner, SubmitButton } from '../FormFields';
import { EMPTY_FORM_STATE } from '../form-state';

/**
 * Bild-Upload ins CMS-Volume. Nur Raster-Formate (kein SVG → XSS, serverseitig
 * geprüft). Fehler (falscher Typ, zu groß) kommen über useFormState zurück.
 */
export function MediaUpload() {
  const [state, formAction] = useFormState(uploadMediaAction, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <ErrorBanner message={state.error} /> : null}
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="file"
          name="file"
          required
          aria-label="Bilddatei zum Hochladen wählen"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="block max-w-full text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-bg file:px-3 file:py-1.5 file:font-mono file:text-[0.65rem] file:uppercase file:tracking-widest file:text-muted hover:file:border-border-strong hover:file:text-accent"
        />
        <SubmitButton label="Hochladen" />
      </div>
      <p className="font-mono text-[0.7rem] text-muted-dim">
        <span aria-hidden className="mr-1.5 text-accent/70">›</span>
        PNG, JPG, WebP, GIF, AVIF · max. 5 MB · kein SVG.
      </p>
    </form>
  );
}
