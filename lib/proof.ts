/**
 * Single Source of Truth für den Live-Beweis-Streifen.
 *
 * Bündelt Aggregat-Daten (Service-Count, Drift, Hosts, Uptime, Deploy-Alter).
 * Die Server-Komponenten (Landing, /toolbox) und die /api/proof-Route rufen
 * `getProof()` direkt auf; die Route ist die öffentliche JSON-Fassade derselben
 * Funktion.
 *
 * ★★ Warum hier seit 2026-08-27 eine Datei gelesen wird: Bis dahin waren die
 * Zahlen KONSTANTEN in dieser Datei, von Hand gepflegt und per ENV übersteuert.
 * Am 2026-08-27 gemessen: die Seite zeigte „162 Dienste, 0 Drift", die control-map
 * führte 164 und der Live-Check fand 10-11 echte Abweichungen. Das Panel heißt
 * `live --watch` — auf einer Seite mit dem Anspruch „beweisen statt behaupten"
 * darf die Kernzahl nicht geraten sein.
 *
 * Lesereihenfolge, absteigende Verlässlichkeit:
 *   1. ${PORTFOLIO_DATA_DIR}/proof.json  — auf dem Control-Host gemessen, per
 *      scripts/proof-collect.py + proof-push.sh ins Volume gelegt (mit Zeitstempel)
 *   2. PROOF_* aus der ENV                — manuelle Übersteuerung, ohne Zeitstempel
 *   3. PROOF_DEFAULTS                     — letzte Rückfallebene
 *
 * ★ Eine Stufe tiefer heißt IMMER: kein `measured`-Objekt. Die UI unterscheidet
 * daran „gemessen vor 2 h" von „Selbstauskunft" und behauptet nie fälschlich live —
 * dasselbe Prinzip, das lib/live-status.ts für den Gatus-Abruf anwendet.
 *
 * Privacy-Regel: ausschließlich Aggregate. Keine Hostnames, IPs,
 * Service-Namen oder Container-Identifier. Wenn unsicher → weglassen.
 * Der Sammler kennt all diese Namen; über diese Schnittstelle kommen nur Zahlen.
 */

/**
 * Letzte Rückfallebene, wenn weder eine Messung noch ENV vorliegt — etwa beim
 * allerersten Build, bevor proof-push.sh je gelaufen ist.
 *
 * ★ Hier steht bewusst KEIN `drift` mehr. Bis 2026-08-27 stand hier `drift: 0`,
 * und die Seite zeigte diese Null öffentlich als „0 Drift in der Service-Map" —
 * während der Live-Check an dem Tag 10-11 echte Abweichungen fand (fünf neue
 * Container auf dem Public-Host, zwei Tunnel aus dem Spielserver-Umzug, vier
 * Ghosts). Eine Null, die niemand gemessen hat, ist die teuerste Zahl auf einer
 * Seite, die mit „gemessen statt behauptet" wirbt. Ohne Messung wird der Drift
 * jetzt gar nicht gezeigt.
 *
 * Im Zweifel untertreiben, nie hochrechnen.
 */
export const PROOF_DEFAULTS = {
  services: 175,
  // 4 Pi-Hosts (Control/Public/AI/Edge) + 3 x86-Proxmox-Cluster-Nodes = 7.
  // der DMZ-Host bleibt draussen: extern, separat als "public reachable" gezeigt.
  hosts: 7,
} as const;

/**
 * Die Größenordnung als Fließtext, EIN Ort statt neun.
 *
 * ★ Warum das hier steht: „über 160" war an neun Stellen von Hand eingetippt
 * (Projekt-Kachel, CV-Bullets, CV-Highlights, Meta-Description, OG-Text,
 * /uber-mich, beide Sprachen). Das ist derselbe Zahlentyp, den `getProof()`
 * gerade abgeschafft hat, nur schlechter: eine Konstante im Fließtext altert
 * still und wird beim Nachziehen zuverlässig an einer Stelle vergessen. Am
 * 2026-08-31 stand überall „über 160", gemessen waren 175.
 *
 * ★ Bewusst eine Größenordnung, keine exakte Zahl. Die exakte Zahl trägt allein
 * das gemessene Panel, das seinen Zeitstempel mitliefert; Prosa, die sich auf
 * eine Einerstelle festlegt, ist nach zwei Wochen falsch, ohne dass es jemand
 * merkt. Das ist die „Wachstums-Sprache statt Snapshot"-Regel aus CLAUDE.md.
 *
 * Nach oben nachziehen, wenn die gemessene Zahl die nächste Zehnerschwelle
 * dauerhaft überschritten hat, nie vorher: im Zweifel untertreiben.
 */
export const DIENSTE_PROSA = {
  de: { klein: 'über 170', gross: 'Über 170' },
  en: { klein: 'over 170', gross: 'Over 170' },
} as const;

export interface ProofDeployed {
  iso: string;
  age_hours: number;
  age_label: string;
}

/** Nur gesetzt, wenn die Zahlen aus einer echten Messung stammen. */
export interface ProofMeasured {
  iso: string;
  age_hours: number;
  /** Älter als MAX_FRISCHE_H — die UI darf das nicht mehr als „live“ zeigen. */
  stale: boolean;
}

export interface Proof {
  services: number;
  /** null = nicht verlässlich ermittelt. NIE als 0 darstellen, siehe unten. */
  drift: number | null;
  hosts: number;
  deployed: ProofDeployed | null;
  /** null = Selbstauskunft (ENV/Defaults), nicht gemessen. */
  measured: ProofMeasured | null;
}

/** Ab hier ist eine Messung eine Momentaufnahme, kein Live-Wert mehr. */
export const MAX_FRISCHE_H = 48;

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

interface ProofDatei {
  services?: number;
  hosts?: number;
  drift?: number;
  measured_at?: string;
}

/**
 * Liest die gemessene proof.json aus dem Datenvolume. Synchron, weil `getProof()`
 * von Server-Komponenten ohne await aufgerufen wird; die Datei ist wenige hundert
 * Byte groß und liegt lokal.
 *
 * Jeder Fehlerfall führt zu `null` und damit zur nächsten Stufe: Datei fehlt (vor
 * dem ersten Push), kaputtes JSON, leere Datei, unplausible Werte. Ein halb
 * geschriebener Zustand kann nicht auftreten, weil proof-push.sh atomar umbenennt.
 */
function leseGemessen(): ProofDatei | null {
  const dir = process.env.PORTFOLIO_DATA_DIR;
  if (!dir) return null;
  try {
    // Require statt Import: hält die Datei außerhalb von Client-Bundles.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('node:fs') as typeof import('node:fs');
    const roh = fs.readFileSync(`${dir}/proof.json`, 'utf8');
    const d = JSON.parse(roh) as ProofDatei;
    // Plausibilität: 0 Dienste wäre ein Lesefehler, keine Messung.
    if (typeof d.services !== 'number' || !Number.isFinite(d.services) || d.services <= 0) {
      return null;
    }
    if (!d.measured_at || Number.isNaN(new Date(d.measured_at).getTime())) return null;
    return d;
  } catch {
    return null;
  }
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

/**
 * Baut das Aggregat: gemessene Datei → ENV → Defaults.
 *
 * ★ Der Drift verdient eine eigene Regel. Er ist die heikelste Zahl der Seite,
 * weil „0 Drift" wie ein Gütesiegel gelesen wird. Deshalb wird er NUR gesetzt,
 * wenn er aus einer echten Messung stammt oder ausdrücklich per ENV gesetzt
 * wurde, nie aus einem Default geraten. Der Sammler lässt das Feld weg,
 * sobald seine Sicht unvollständig war; dann bleibt es hier `null` und die UI
 * zeigt es gar nicht, statt eine schöne Null zu erfinden.
 *
 * ★★ Seit 2026-08-31 ist `null` der REGELFALL, nicht der Störfall: der Owner
 * hat entschieden, die Drift-Zahl gar nicht zu veröffentlichen. `proof-push.sh`
 * ruft den Sammler deshalb mit `--skip-drift` auf, und `PROOF_DRIFT_COUNT` ist
 * auf dem Zielhost bewusst nicht gesetzt. Wer hier künftig einen Rückfallwert
 * einbaut, weil „das Feld ja immer leer ist", hebt genau diesen Entscheid auf.
 * Der Betriebswert wird weiter gemessen, er bleibt nur im Haus:
 * `scripts/proof-collect.py` ohne das Flag liefert ihn.
 */
export function getProof(): Proof {
  const buildIso = process.env.BUILD_TIME || null;
  const deployedAt = buildIso ? new Date(buildIso) : null;
  const valid = deployedAt && !Number.isNaN(deployedAt.getTime());
  const ageHours = valid
    ? Math.max(0, Math.floor((Date.now() - deployedAt.getTime()) / 3_600_000))
    : null;

  const gemessen = leseGemessen();

  let measured: ProofMeasured | null = null;
  if (gemessen?.measured_at) {
    const at = new Date(gemessen.measured_at);
    const alter = Math.max(0, Math.floor((Date.now() - at.getTime()) / 3_600_000));
    measured = { iso: at.toISOString(), age_hours: alter, stale: alter > MAX_FRISCHE_H };
  }

  const driftEnv = process.env.PROOF_DRIFT_COUNT;
  const drift =
    typeof gemessen?.drift === 'number' && Number.isFinite(gemessen.drift)
      ? gemessen.drift
      : driftEnv && Number.isFinite(Number(driftEnv))
        ? Number(driftEnv)
        : null;

  return {
    services: gemessen?.services ?? num('PROOF_SERVICE_COUNT', PROOF_DEFAULTS.services),
    drift,
    hosts:
      typeof gemessen?.hosts === 'number' && gemessen.hosts > 0
        ? gemessen.hosts
        : num('PROOF_HOSTS', PROOF_DEFAULTS.hosts),
    deployed:
      valid && deployedAt
        ? {
            iso: deployedAt.toISOString(),
            age_hours: ageHours ?? 0,
            age_label: humanAge(ageHours ?? 0),
          }
        : null,
    measured,
  };
}
