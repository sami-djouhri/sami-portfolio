import { renderToBuffer } from '@react-pdf/renderer';

import { CV_DATEIEN } from '@/lib/cv-dateien';
import { CV_OEFFENTLICH } from '@/lib/site';
import { CvDocument } from '../CvDocument';

/**
 * Die Lebenslauf-PDFs, beim Bau erzeugt (seit 2026-10-30, vorher `/cv.pdf`
 * zur Laufzeit). Welche es gibt, steht in `lib/cv-dateien.ts`.
 *
 * Ist der Lebenslauf nicht oeffentlich, antwortet die Route 404, der Export legt
 * dann LEERE Dateien ab, und `scripts/export-bereinigen.mjs` entfernt sie vor der
 * Auslieferung. Eine leere Liste aus `generateStaticParams` waere der direkte Weg,
 * aber Next bricht den Export daran ab ("at least one route must be generated").
 * Ohne den Nachschritt lieferte Caddy vier leere PDFs mit Status 200.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return CV_DATEIEN.map((d) => ({ datei: d.datei }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ datei: string }> }) {
  const { datei } = await params;
  const d = CV_DATEIEN.find((x) => x.datei === datei);
  if (!d || !CV_OEFFENTLICH) return new Response(null, { status: 404 });
  const buffer = await renderToBuffer(CvDocument({ locale: d.sprache, variant: d.variante }));
  return new Response(new Uint8Array(buffer), {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
