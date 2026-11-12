/**
 * Was die Seite über sich selbst sagt, seit dem 2026-10-30 nur noch das
 * Build-Datum.
 *
 * Hier stand bis dahin die Hausmessung: Zahl der Dienste, Zahl der Wirte,
 * Drift, gelesen aus einer `proof.json`, die ein Timer im Heimnetz
 * (`proof-collect.py` + `proof-push.sh`) ins Datenvolume legte. Entscheid
 * aus der Fragerunde vom 2026-10-27, geteilt nach der Frage, WER gemessen hat:
 * was ich selbst messe, fällt; was ein Dritter misst (die Verfügbarkeit von der
 * Status-Seite, `lib/live-status.ts`), bleibt.
 *
 * Anlass war ein Fund: die Seite nannte als Dienstzahl „über 190", der eigene
 * Messfühler zählte 179. Kein Rückbau, sondern 13 Apps, die auf Abruf gingen.
 * Die Regel für diese Zahl kannte nur die Richtung nach oben („nachziehen, wenn
 * die nächste Schwelle dauerhaft überschritten ist"); für eine fallende Messung
 * gab es keinen Satz, und so lag der Text zum ersten Mal über der Messung.
 *
 * Die Dienstzahl steht deshalb NIRGENDS mehr auf der Seite, auch nicht als
 * Größenordnung. Das Zahlen-Gate 1c in `scripts/gates.sh` und die Smoke-Prüfung 2c
 * bewachen jetzt genau das: keine Dienstzahl in `app/` und `lib/`, keine im
 * ausgelieferten HTML. Wer eine zurückholen will, holt zuerst die Messkette
 * zurück (Git, Commit vor dem 2026-10-30), nicht eine Konstante.
 */

import type { Locale } from './i18n/config';

export interface ProofDeployed {
  iso: string;
  age_hours: number;
  age_label: string;
}

export interface Proof {
  deployed: ProofDeployed | null;
}

function humanAge(hours: number): string {
  if (hours < 1) return 'vor wenigen Minuten';
  if (hours < 24) return `vor ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `vor ${days} d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `vor ${weeks} w`;
  const months = Math.floor(days / 30);
  return `vor ${months} mo`;
}

/**
 * Locale-abhängiges Deploy-Alter für die Anzeige (der `age_label` im Proof-Objekt
 * bleibt deutsch für die sprachneutrale /api/proof-JSON-Fassade). Server-Seiten
 * rufen das mit ihrer Locale auf, damit auf /en nicht „vor 3 h" steht.
 */
export function formatAge(hours: number, locale: Locale): string {
  if (locale !== 'en') return humanAge(hours);
  if (hours < 1) return 'a few minutes ago';
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} w ago`;
  const months = Math.floor(days / 30);
  return `${months} mo ago`;
}

/** Das Build-Datum aus `BUILD_TIME`, das `ausliefern.sh` bei jedem Bau setzt (Export und Restdienst-Image). */
export function getProof(): Proof {
  const buildIso = process.env.BUILD_TIME || null;
  const deployedAt = buildIso ? new Date(buildIso) : null;
  if (!deployedAt || Number.isNaN(deployedAt.getTime())) return { deployed: null };
  const ageHours = Math.max(0, Math.floor((Date.now() - deployedAt.getTime()) / 3_600_000));
  return {
    deployed: {
      iso: deployedAt.toISOString(),
      age_hours: ageHours,
      age_label: humanAge(ageHours),
    },
  };
}
