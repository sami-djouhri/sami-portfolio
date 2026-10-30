import type { ProjectDetail } from '../projects';
import type { Locale } from '../i18n/config';
import { istUebergang, type FallstudieDatei, type Paar, type Steckbrief } from './typ';
import saganta from './saganta';
import homelab from './homelab';
import lernen from './lernen';
import marktwatch from './marktwatch';
import wissensFoederation from './wissens-foederation';
import offlineWissen from './offline-wissen';
import bibliothek from './bibliothek';
import postfach from './postfach';
import newsEngine from './news-engine';
import concierge from './concierge';
import defenseInDepth from './defense-in-depth';
import opsCockpit from './ops-cockpit';
import gartiko from './gartiko';
import homeDigitalTwin from './home-digital-twin';
import homelabApp from './homelab-app';
import homelabSentinel from './homelab-sentinel';
import aiVision from './ai-vision';
import rackforge from './rackforge';
import cmsBaukasten from './cms-baukasten';
import edgeHosting from './edge-hosting';
import modellVermittlung from './modell-vermittlung';
import windowsAdLab from './windows-ad-lab';
import mediaVault from './media-vault';
import ressourcenArbiter from './ressourcen-arbiter';

/**
 * Alle Fallstudien, je Arbeit eine Datei in diesem Verzeichnis. Die Kennung ist die
 * `id` aus `lib/projects.ts` (ASCII, sonst 404 auf der Detailseite).
 *
 * Eine neue Fallstudie ist eine neue Datei PLUS eine Zeile hier. Gate 1h
 * (`scripts/fallstudien-pruefen.mjs`) prueft beides gegeneinander: eine Datei ohne
 * Eintrag hier wuerde nie gerendert, und das saehe aus wie eine fehlende Fallstudie.
 */
export const FALLSTUDIEN: Record<string, FallstudieDatei> = {
  saganta: saganta,
  homelab: homelab,
  lernen: lernen,
  marktwatch: marktwatch,
  'wissens-foederation': wissensFoederation,
  'offline-wissen': offlineWissen,
  bibliothek: bibliothek,
  postfach: postfach,
  'news-engine': newsEngine,
  concierge: concierge,
  'defense-in-depth': defenseInDepth,
  'ops-cockpit': opsCockpit,
  gartiko: gartiko,
  'home-digital-twin': homeDigitalTwin,
  'homelab-app': homelabApp,
  'homelab-sentinel': homelabSentinel,
  'ai-vision': aiVision,
  rackforge: rackforge,
  'cms-baukasten': cmsBaukasten,
  'edge-hosting': edgeHosting,
  'modell-vermittlung': modellVermittlung,
  'windows-ad-lab': windowsAdLab,
  'media-vault': mediaVault,
  'ressourcen-arbiter': ressourcenArbiter,
};

/** Gibt es fuer diese Arbeit eine Fallstudie? */
export function hatFallstudie(id: string): boolean {
  return id in FALLSTUDIEN;
}

const w = (p: Paar, locale: Locale) => (locale === 'en' ? p.en : p.de);

/**
 * Die Fallstudie einer Arbeit, aufgeloest in eine Sprache, in der Form, die die
 * Seiten seit jeher lesen. Die Seiten wissen nichts von Paaren.
 */
export function getProjectDetail(id: string, locale: Locale): ProjectDetail | undefined {
  const f = FALLSTUDIEN[id];
  if (!f) return undefined;
  if (istUebergang(f)) return locale === 'en' ? f.enAlt : f.de;
  const d: ProjectDetail = {
    problem: w(f.problem, locale),
    approach: f.approach.map((p) => w(p, locale)),
    result: f.result.map((p) => w(p, locale)),
    decisions: f.decisions.map((x) => ({ title: w(x.title, locale), body: w(x.body, locale) })),
  };
  if (f.modules) d.modules = f.modules.map((p) => w(p, locale));
  if (f.architecture) {
    const a = f.architecture;
    d.architecture = {
      summary: w(a.summary, locale),
      tiers: a.tiers.map((t) => ({
        label: w(t.label, locale),
        nodes: t.nodes.map((n) => ({
          id: n.id,
          label: w(n.label, locale),
          ...(n.note ? { note: w(n.note, locale) } : {}),
          ...(n.kind ? { kind: n.kind } : {}),
        })),
      })),
      ...(a.flows
        ? {
            flows: a.flows.map((x) => ({
              from: x.from,
              to: x.to,
              ...(x.label ? { label: w(x.label, locale) } : {}),
            })),
          }
        : {}),
    };
  }
  if (f.metrics) d.metrics = f.metrics.map((m) => ({ label: w(m.label, locale), value: w(m.value, locale) }));
  if (f.timeline) d.timeline = f.timeline.map((t) => ({ when: w(t.when, locale), what: w(t.what, locale) }));
  if (f.limits) d.limits = f.limits.map((p) => w(p, locale));
  return d;
}

/** Der Steckbrief einer Arbeit in einer Sprache, falls sie einen hat. */
export function getSteckbrief(id: string, locale: Locale): Steckbrief | undefined {
  const s = FALLSTUDIEN[id]?.steckbrief;
  if (!s) return undefined;
  return {
    beschreibung: w(s.beschreibung, locale),
    funktionen: s.funktionen.map((p) => w(p, locale)),
    umfang: w(s.umfang, locale),
    entschieden: w(s.entschieden, locale),
    laeuft: w(s.laeuft, locale),
  };
}
