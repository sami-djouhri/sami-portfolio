import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site';

// Statisch exportierbar, sonst bricht `output: 'export'` hier ab (seit 2026-10-30).
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // `/api/proof` ist bewusst ausgenommen: Maschinenleser behalten dort einen
        // Einstieg. Seit dem 2026-10-30 trägt die Route nur noch das Build-Datum
        // (siehe lib/proof.ts).
        allow: ['/', '/api/proof'],
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
