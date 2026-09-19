import { existsSync } from 'fs';
import { join } from 'path';

import type { Project } from './projects';

/**
 * Server-only: Menge der Projekt-`id`s, für die ein Live-Screenshot unter
 * `public/previews/<id>.webp` zur Build-Zeit vorliegt (erzeugt von
 * scripts/capture-previews.sh, bewusst nur für öffentliche Produkte).
 * Wird auf Server-Seiten berechnet und als plain string[] an die (client-fähigen)
 * Karten durchgereicht, so bleibt `fs` aus den Client-Komponenten heraus.
 */
export function previewIds(projects: Project[]): string[] {
  return projects
    .filter((p) => p.href && existsSync(join(process.cwd(), 'public', 'previews', `${p.id}.webp`)))
    .map((p) => p.id);
}
