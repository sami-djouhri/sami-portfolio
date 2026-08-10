import { NextResponse } from 'next/server';

import { getProof } from '@/lib/proof';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Öffentliche JSON-Fassade des Live-Beweis-Aggregats. Die Logik liegt in
 * lib/proof.ts (getProof), Landing und /stats rufen dieselbe Funktion direkt
 * auf, ohne HTTP-Self-Fetch. Privacy-Regel: nur Aggregate, siehe lib/proof.ts.
 */
export async function GET() {
  const payload = { ...getProof(), generated_at: new Date().toISOString() };

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    },
  });
}
