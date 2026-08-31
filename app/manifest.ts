import type { MetadataRoute } from 'next';

import { ABOUT } from '@/lib/projects';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${ABOUT.name}, Eigen-Systeme & Infrastruktur`,
    short_name: 'sami.djouhri',
    description: ABOUT.bio,
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0c0e',
    theme_color: '#0b0c0e',
    lang: 'de',
    icons: [
      { src: '/icon', sizes: '64x64', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
