import type { MetadataRoute } from 'next';

import { ABOUT } from '@/lib/projects';

/**
 * Web-App-Manifest.
 *
 * ★ `id` ist NICHT optional-egal: ohne sie leiten Browser die Identitaet der
 * Anwendung aus der `start_url` ab. Aendert sich die je, gilt die Seite als
 * andere App, und ein bereits abgelegtes Symbol zeigt auf eine Leiche. Eine
 * einmal gesetzte `id` darf deshalb nie wieder wandern.
 *
 * ★ `scope` grenzt ab, was noch als Teil der Anwendung gilt. Ohne Angabe leitet
 * sich das aus `start_url` ab, was hier zufaellig passt, aber nicht als
 * Entscheidung lesbar ist.
 *
 * ★ Die Beschreibung ist bewusst ein eigener, kurzer Satz und nicht mehr
 * `ABOUT.bio`: der Biografie-Absatz laeuft ueber mehrere Zeilen und wird in der
 * Installationsansicht hart abgeschnitten, mitten im Satz. Die Bio hat ihren
 * Platz auf /uber-mich, wo sie ganz gelesen wird.
 *
 * Icon-Groessen: 64 (app/icon.tsx), 180 (apple-icon), 192 (icon1) und 512
 * (icon2, maskierbar). 192 ist die Mindestgroesse, unter der eine Seite als
 * nicht installierbar gilt; warum das 512er anders gezeichnet ist, steht in
 * app/icon2.tsx.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: `${ABOUT.name}, Eigen-Systeme & Infrastruktur`,
    short_name: 'sami.djouhri',
    description: 'Portfolio und Logbuch: selbst gebaute und selbst betriebene Systeme.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0b0c0e',
    theme_color: '#0b0c0e',
    lang: 'de',
    icons: [
      { src: '/icon', sizes: '64x64', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
      { src: '/icon1', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon2', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
