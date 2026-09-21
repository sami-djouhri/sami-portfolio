import { WindowBar } from '../../components/Terminal';

export const dynamic = 'force-dynamic';

export default async function AdminLogin(
  props: {
    searchParams: Promise<{ next?: string; error?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const next = typeof searchParams.next === 'string' ? searchParams.next : '/admin';
  const failed = searchParams.error === '1';
  const rateLimited = searchParams.error === 'rate';

  return (
    <div className="mx-auto max-w-md py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        <span aria-hidden className="text-muted-dim">$ </span>
        auth --login
      </p>
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface/50">
        <WindowBar title="~/admin/login" />
        {/* Reines HTML-Form-POST (kein fetch/Server-Action) → robuste Voll-Navigation. */}
        <form action="/api/admin-login" method="post" className="space-y-4 p-6">
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="pw" className="font-mono text-xs uppercase tracking-widest text-muted">
              Passwort
            </label>
            <input
              id="pw"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-text shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] focus:border-accent/60 focus:outline-none"
            />
          </div>
          {failed && (
            <p className="font-mono text-xs text-red-400">Falsches Passwort.</p>
          )}
          {rateLimited && (
            <p className="font-mono text-xs text-red-400">
              Zu viele Versuche. Bitte später erneut probieren.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-[0.7rem] uppercase tracking-widest text-accent transition-colors hover:bg-accent/20"
          >
            Anmelden
          </button>
        </form>
      </div>
      <p className="mt-4 text-center font-mono text-[0.6rem] uppercase tracking-widest text-muted-dim">
        LAN / WireGuard only
      </p>
    </div>
  );
}
