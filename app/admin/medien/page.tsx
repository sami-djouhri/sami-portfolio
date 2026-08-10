import { listMedia } from '@/lib/store';
import { WindowBar } from '../../components/Terminal';
import { ConfirmButton } from '../ConfirmButton';
import { deleteMediaAction } from '../actions';
import { CopyButton } from './CopyButton';
import { MediaUpload } from './MediaUpload';

export const dynamic = 'force-dynamic';

const CTRL =
  'rounded-md border border-border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-muted transition-colors hover:border-border-strong hover:text-accent';

export default async function AdminMediaPage() {
  const media = await listMedia();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        <span aria-hidden className="text-muted-dim">$ </span>
        ls medien/
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">Medien</h1>
        <span className="font-mono text-xs uppercase tracking-widest text-muted-dim">
          {media.length} Dateien
        </span>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Bilder liegen im Volume und werden über{' '}
        <code className="font-mono text-accent">/api/media/&lt;datei&gt;</code> ausgeliefert. Die
        kopierte URL kannst du dort einsetzen, wo ein Bildpfad gebraucht wird (z. B. im Code).
      </p>

      <div className="mt-8 overflow-hidden rounded-lg border border-border bg-surface/40">
        <WindowBar title="~/medien – upload" />
        <div className="p-5 sm:p-6">
          <MediaUpload />
        </div>
      </div>

      {media.length === 0 ? (
        <div className="mt-8 overflow-hidden rounded-lg border border-dashed border-border bg-surface/30">
          <WindowBar title="~/medien" />
          <div className="px-6 py-16 text-center">
            <p className="font-display text-2xl text-text">Noch keine Medien.</p>
            <p className="mt-2 text-sm text-muted">Lade oben dein erstes Bild hoch.</p>
          </div>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((file) => (
            <li key={file} className="overflow-hidden rounded-lg border border-border bg-surface/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/media/${file}`}
                alt={file}
                className="aspect-square w-full object-cover"
              />
              <div className="p-2.5">
                <p className="truncate font-mono text-[0.6rem] text-muted-dim" title={file}>
                  {file}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <CopyButton value={`/api/media/${file}`} className={CTRL} />
                  <form action={deleteMediaAction} className="ml-auto">
                    <input type="hidden" name="name" value={file} />
                    <ConfirmButton
                      message={`Bild „${file}" löschen?`}
                      className={`${CTRL} hover:border-red-500/40 hover:text-red-300`}
                    >
                      löschen
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
