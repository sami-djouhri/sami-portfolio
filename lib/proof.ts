/**
 * Single Source of Truth für den Live-Beweis-Streifen.
 *
 * Bündelt Aggregat-Daten (Service-Count, Drift, Hosts, Uptime, Deploy-Alter)
 * als reine Funktion, KEIN HTTP-Self-Fetch. Die Server-Komponenten (Landing,
 * /stats) und die /api/proof-Route rufen `getProof()` direkt auf; die Route
 * ist nur noch die öffentliche JSON-Fassade derselben Funktion.
 *
 * Privacy-Regel: ausschließlich Aggregate. Keine Hostnames, IPs,
 * Service-Namen oder Container-Identifier. Wenn unsicher → weglassen.
 *
 * Quellen (per ENV, optional):
 *   PROOF_SERVICE_COUNT    , z.B. 135 (aus control-map: jq '.services | length')
 *   PROOF_DRIFT_COUNT      , z.B. 0
 *   PROOF_HOSTS            , Anzahl Hosts im Cluster
 *   BUILD_TIME             , ISO-Timestamp vom Build (CI/CD oder Compose-build)
 */

/** Fallback-Aggregate, eine einzige Quelle, nicht über drei Dateien verstreut. */
export const PROOF_DEFAULTS = {
  // Nachgemessen 2026-08-18: auf den drei dauerhaft laufenden Hosts allein
  // stehen 165 Container. Die Gäste des x86-Clusters und die Edge-Hardware
  // sind darin NICHT enthalten, die Zahl untertreibt also bewusst.
  // Im Zweifel untertreiben, nie hochrechnen.
  services: 165,
  drift: 0,
  // 4 Pi-Hosts (Control/Public/AI/Edge) + 3 x86-Proxmox-Cluster-Nodes = 7.
  // netcup bleibt draussen: externer DMZ-Host, separat als "public reachable" gezeigt.
  hosts: 7,
} as const;

export interface ProofDeployed {
  iso: string;
  age_hours: number;
  age_label: string;
}

export interface Proof {
  services: number;
  drift: number;
  hosts: number;
  deployed: ProofDeployed | null;
}

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

import type { Locale } from './i18n/config';

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
 * rufen das mit ihrer Locale auf, damit auf /en nicht „vor 3 h“ steht.
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

/** Liest ENV + BUILD_TIME und baut das Aggregat. Reine Funktion, kein I/O. */
export function getProof(): Proof {
  const buildIso = process.env.BUILD_TIME || null;
  const deployedAt = buildIso ? new Date(buildIso) : null;
  const valid = deployedAt && !Number.isNaN(deployedAt.getTime());
  const ageHours = valid
    ? Math.max(0, Math.floor((Date.now() - deployedAt.getTime()) / 3_600_000))
    : null;

  return {
    services: num('PROOF_SERVICE_COUNT', PROOF_DEFAULTS.services),
    drift: num('PROOF_DRIFT_COUNT', PROOF_DEFAULTS.drift),
    hosts: num('PROOF_HOSTS', PROOF_DEFAULTS.hosts),
    deployed:
      valid && deployedAt
        ? {
            iso: deployedAt.toISOString(),
            age_hours: ageHours ?? 0,
            age_label: humanAge(ageHours ?? 0),
          }
        : null,
  };
}
