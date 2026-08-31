import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // `/api/proof` ist bewusst ausgenommen: die Seite lädt ausdrücklich dazu ein,
        // die Zahlen des Beweis-Panels selbst abzufragen. Es wäre widersprüchlich,
        // eine Adresse anzubieten und sie Crawlern im selben Atemzug zu verbieten.
        // Die Route liefert ausschließlich Aggregate (siehe lib/proof.ts).
        allow: ['/', '/api/proof'],
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
