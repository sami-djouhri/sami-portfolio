import type { Metadata, Viewport } from 'next';

import { ABOUT } from '@/lib/projects';
import { SITE_URL } from '@/lib/site';
import './globals.css';

/**
 * Root-Layout ist bewusst ein Passthrough: das `<html>`/`<body>` und die
 * sprachabhängige Metadata liegen in `app/[locale]/layout.tsx` (i18n-Pattern für den
 * App Router). Hier bleiben nur die sprachneutrale Basis-Metadata + globals.css.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'sami-portfolio',
  authors: [{ name: ABOUT.name, url: SITE_URL }],
  creator: ABOUT.name,
  alternates: {
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: `${ABOUT.name}, Updates` }],
    },
  },
  robots: { index: true, follow: true },
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: '#0b0c0e',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
