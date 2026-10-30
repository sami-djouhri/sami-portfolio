import { NextResponse } from 'next/server';

import { getLiveStatus } from '@/lib/live-status';

/**
 * Die extern gemessene Verfuegbarkeit fuer den Browser (seit 2026-10-30).
 *
 * Die Seite ist statisch und fragt hier nach, statt Gatus selbst anzusprechen:
 * so bleiben `connect-src 'self'` in der CSP und CORS bei der Status-Seite
 * unberuehrt (Entscheid aus der Fragerunde). Ausgeliefert werden nur die
 * Aggregate, die `getLiveStatus` ohnehin bildet, keine Endpunkt-Namen.
 *
 * Der Abruf bei Gatus haelt seinen eigenen Cache von 5 min (`revalidate` in
 * `lib/live-status.ts`); ein Besucher loest also nicht je Seitenaufruf eine
 * Messung aus.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const live = await getLiveStatus();
  return NextResponse.json(live, {
    headers: { 'Cache-Control': 'public, max-age=60' },
  });
}
