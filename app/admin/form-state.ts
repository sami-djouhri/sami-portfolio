/**
 * Geteilte Typen/Konstanten für die Admin-Formulare. Bewusst KEINE 'use server'-Datei:
 * Server-Action-Module dürfen ausschließlich async-Funktionen exportieren, deshalb
 * leben Form-State-Typ und die Select-Optionen hier (von actions.ts UND den Client-
 * Formularen importiert, eine Quelle der Wahrheit).
 */
import type { Domain, ProjectStatus } from '@/lib/projects';

/** Rückgabe der useFormState-Actions: nur ein optionaler Fehlertext (Erfolg = redirect). */
export interface FormState {
  error?: string;
}

export const EMPTY_FORM_STATE: FormState = {};

// Laufzeit-Listen zu den (nur als Typen exportierten) Union-Typen, für <select> und
// Validierung. Bewusst hier, damit Form-Optionen und Action-Prüfung nicht auseinanderlaufen.
export const DOMAINS: readonly Domain[] = ['Suite', 'AI', 'Infra', 'Bots', 'Web'];
export const STATUSES: readonly ProjectStatus[] = ['live', 'im-aufbau', 'wartung', 'pivot'];

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: 'live',
  'im-aufbau': 'im Aufbau',
  wartung: 'in Wartung',
  pivot: 'Pivot',
};
