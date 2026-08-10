/**
 * GET /cv.pdf — server-generiertes PDF des Lebenslaufs (single-source aus
 * lib/cv.ts via CvDocument). Node-Runtime (react-pdf braucht fontkit/zlib),
 * inline im Browser anzeigbar, mit sauberem Download-Dateinamen.
 *
 * Sprache über ?lang=de|en (Default de) — reicht die Locale an CvDocument durch,
 * das Daten aus getCv()/getAbout() zieht.
 */
import { renderToBuffer } from '@react-pdf/renderer';

import { getAbout } from '@/lib/projects';
import type { Locale } from '@/lib/i18n/config';
import { CvDocument, type CvVariant } from './CvDocument';

export const runtime = 'nodejs';
// Query-abhängig → dynamisch (force-static würde ?lang/?format ignorieren).
export const dynamic = 'force-dynamic';

function fileName(lang: Locale, variant: CvVariant): string {
  const name = getAbout(lang).name;
  const slug = name.normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
  const label = lang === 'en' ? 'Resume' : 'Lebenslauf';
  const suffix = variant === 'kompakt' ? (lang === 'en' ? '-1page' : '-Kompakt') : '';
  return `${label}${suffix}-${slug}.pdf`;
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const lang: Locale = params.get('lang') === 'en' ? 'en' : 'de';
  const variant: CvVariant = params.get('format') === 'kompakt' ? 'kompakt' : 'voll';
  const buffer = await renderToBuffer(CvDocument({ locale: lang, variant }));
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName(lang, variant)}"`,
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
}
