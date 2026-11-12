import { NextResponse } from 'next/server';

import { getProof } from '@/lib/proof';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Öffentliche JSON-Fassade, seit dem 2026-10-30 nur noch mit dem Build-Datum.
 * Die Hausmessung (Dienste, Wirte, Drift) ist gefallen, Begründung in
 * lib/proof.ts. Die Route bleibt, damit Maschinenleser einen Einstieg behalten.
 */
export async function GET() {
  const payload = { ...getProof(), generated_at: new Date().toISOString() };

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    },
  });
}
