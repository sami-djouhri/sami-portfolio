import { readMedia } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

/**
 * Serviert hochgeladene Medien aus dem Volume (DATA_DIR/media). readMedia kapselt
 * den Path-Traversal-Schutz und die Whitelist. Eng gesetzte Header (nosniff, knappe
 * CSP), weil der Inhalt vom Admin stammt aber öffentlich ausgeliefert wird.
 */
export async function GET(_req: Request, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  const name = params.path?.join('/') ?? '';
  const file = await readMedia(name);
  if (!file) return new Response('Not Found', { status: 404 });

  return new Response(new Uint8Array(file.bytes), {
    headers: {
      'Content-Type': MIME[file.ext] || 'application/octet-stream',
      // Dateinamen sind randomUUID.ext, Inhalt hinter einer URL ändert sich nie.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
