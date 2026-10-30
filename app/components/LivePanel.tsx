/**
 * Das Panel `live --watch`: was ein Dritter ueber diese Seite misst, dazu das
 * Alter des letzten Deploys.
 *
 * Seit dem 2026-10-30 ohne Hausmessung. Bis dahin trug es oben die Zahl der
 * Dienste samt Statusraster, den Zeitstempel der eigenen Messung und den
 * Nachpruef-Befehl auf `/api/proof`. Entscheid vom 2026-10-27: was ich
 * selbst messe, faellt; was die Status-Seite von aussen misst, bleibt. Begruendung
 * in `lib/proof.ts`.
 *
 * Warum es eine eigene Datei ist (seit 2026-10-17): es lag bis dahin in
 * `app/[locale]/page.tsx` und war dort nicht exportiert. Der Entwurf der neuen
 * Startseite hatte es deshalb nicht, und von allem, was er gegenueber der
 * laufenden Startseite verlor, war dieses Panel der groesste Posten: der
 * Zeitstempel der Messung, der Nachpruef-Befehl, die extern gemessene
 * Verfuegbarkeit, „seit 2024", das Alter des letzten Deploys und der Weg zur
 * oeffentlichen Status-Seite. Eine Zeile mit denselben Zahlen ersetzt das
 * nicht: die Zahlen waren nie das Argument, ihre Herkunft war es.
 *
 * Eine Datei, zwei Verwender. Haette ich es im Entwurf nachgebaut, haetten die
 * beiden Fassungen binnen einer Sitzung auseinandergelebt.
 *
 * Seit dem 2026-10-30 holt der BROWSER die Messung (`/api/status`), nicht
 * mehr der Server beim Rendern. Die Seite wird seitdem statisch ausgeliefert, und
 * ein Abruf beim Bau haette den Wert vom Bautag fuer immer eingefroren: der erste
 * Probebau tat genau das. Bis die Antwort da ist, und wenn sie ausbleibt, steht
 * oben „Momentaufnahme". Das ist derselbe Zustand wie frueher bei nicht
 * erreichbarer Status-Seite, also keine neue Aussage.
 *
 * Die Ehrlichkeits-Regeln stecken im Markup und sind nicht Zierde: der
 * gruene Puls und die Zeile „extern gemessen" erscheinen nur bei wirklich
 * erfolgter externer Messung, sonst steht oben „Momentaufnahme". Wer hier etwas
 * vereinfacht, nimmt der Seite ihren Anspruch.
 */
'use client';

import { useEffect, useState } from 'react';

import type { LiveStatus } from '@/lib/live-status';
import { type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { WindowBar } from './Terminal';

export function LivePanel({
  locale,
  deployedLabel,
  liveUrls,
  /**
   * Darstellung der aeusseren Huelle. Die Startseite setzt ihren
   * Boot-Moment hier ein, der Entwurf nicht: dort ist das Panel eine Zelle
   * im Werkfeld und darf keinen eigenen Rahmen und keinen zweiten
   * Eroeffnungsmoment mitbringen.
   */
  huelle = 'boot-rise relative z-10 overflow-hidden rounded-lg border border-border bg-surface/90 shadow-panel',
  huelleStil = { animationDelay: '0.95s' },
}: {
  locale: Locale;
  deployedLabel: string | null;
  liveUrls: readonly string[];
  huelle?: string;
  huelleStil?: React.CSSProperties;
}) {
  const live = useLiveStatus();
  return (
    <div className={huelle} style={huelleStil}>
      <WindowBar
        title="live --watch"
        right={
          // Ehrlichkeit: der grüne „online“-Puls erscheint NUR, wenn der externe
          // Watchdog gerade wirklich gemessen hat. Sonst ein neutraler
          // „Momentaufnahme“-Marker (statische Selbstauskunft), nie fälschlich „live“.
          live.reachable ? (
            <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-term">
              <span className="status-dot status-dot--live" aria-hidden />
              {t(locale, 'home.proof.online')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
              <span className="status-dot status-dot--pivot" aria-hidden />
              {t(locale, 'home.proof.snapshot')}
            </span>
          )
        }
      />

      {/* Kontext in einer Zeile. Die Zahl der Wirte stand hier bis zum
          2026-10-30 vorn und kam aus der Hausmessung; sie ist mit ihr gefallen. */}
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-border px-5 py-3 font-mono text-[0.7rem] uppercase tracking-widest text-muted-dim">
        <span className="whitespace-nowrap">
          {t(locale, 'home.proof.since')} <span className="nums text-text/90">2024</span>
        </span>
        <span aria-hidden>·</span>
        <span className="whitespace-nowrap">{t(locale, 'home.proof.hostRoles')}</span>
      </p>

      {/* Extern gemessen: der eigentliche Beleg, weil er nicht von hier kommt. */}
      {live.reachable ? (
        <div className="border-b border-border px-5 py-3 font-mono text-xs">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span aria-hidden className="text-term">›</span>
            <span className="uppercase tracking-widest text-muted-dim">
              {t(locale, 'home.proof.measured')}
            </span>
            <span className="text-term">
              <span className="nums">
                {live.up}/{live.total}
              </span>{' '}
              {t(locale, 'home.proof.reachableLive')}
            </span>
            {live.uptimePct !== null ? (
              <span className="text-muted">
                · <span className="nums text-text/90">{live.uptimePct}%</span>
              </span>
            ) : null}
          </div>
          <a
            href={live.statusUrl}
            target="_blank"
            rel="noreferrer"
            className="group mt-1 inline-flex items-center gap-1 py-1 text-muted-dim transition-colors hover:text-accent"
          >
            {live.statusUrl.replace(/^https?:\/\//, '')}
            <span aria-hidden className="nudge-x">↗</span>
          </a>
        </div>
      ) : null}

      {/* Deploy-Alter: die Seite selbst als jüngster Betriebsnachweis. */}
      {deployedLabel ? (
        <p className="flex items-center gap-2 border-b border-border px-5 py-2.5 font-mono text-[0.7rem] uppercase tracking-widest text-muted-dim">
          <span aria-hidden className="text-term">›</span>
          {t(locale, 'home.proof.lastDeploy')} {deployedLabel}
        </p>
      ) : null}

      {liveUrls.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-3 font-mono text-xs">
          <span className="uppercase tracking-widest text-muted-dim">
            {t(locale, 'home.proof.publicReachable')}
          </span>
          {liveUrls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 py-1 text-term transition-colors hover:text-accent"
            >
              <span className="status-dot status-dot--live" aria-hidden />
              {url.replace(/^https?:\/\//, '')} ↗
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const OHNE_MESSUNG: LiveStatus = {
  reachable: false,
  up: 0,
  total: 0,
  uptimePct: null,
  statusUrl: 'https://status.djouhri.de',
};

/**
 * Die extern gemessene Verfuegbarkeit, im Browser geholt. Der Restdienst fragt
 * Gatus und reicht nur die Aggregate durch (`app/api/status/route.dienst.ts`).
 * Alles ausser einer vollstaendigen Antwort bleibt bei `OHNE_MESSUNG`: lieber
 * keine Zahl als eine halbe.
 *
 * Ein Abruf je Seitenaufruf, auch wenn mehrere Stellen fragen (Panel und
 * Statusband der Startseite): das Versprechen liegt auf Modulebene.
 */
let abruf: Promise<LiveStatus> | null = null;

function holeLiveStatus(): Promise<LiveStatus> {
  if (abruf) return abruf;
  const abbruch = new AbortController();
  const uhr = setTimeout(() => abbruch.abort(), 6000);
  abruf = fetch('/api/status', { signal: abbruch.signal, headers: { accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((d: Partial<LiveStatus> | null): LiveStatus => {
      if (
        d &&
        d.reachable === true &&
        typeof d.up === 'number' &&
        typeof d.total === 'number' &&
        typeof d.statusUrl === 'string'
      ) {
        return {
          reachable: true,
          up: d.up,
          total: d.total,
          uptimePct: typeof d.uptimePct === 'number' ? d.uptimePct : null,
          statusUrl: d.statusUrl,
        };
      }
      return OHNE_MESSUNG;
    })
    .catch(() => OHNE_MESSUNG)
    .finally(() => clearTimeout(uhr));
  return abruf;
}

function useLiveStatus(): LiveStatus {
  const [live, setLive] = useState<LiveStatus>(OHNE_MESSUNG);
  useEffect(() => {
    let aktiv = true;
    holeLiveStatus().then((l) => {
      if (aktiv) setLive(l);
    });
    return () => {
      aktiv = false;
    };
  }, []);
  return live;
}

/**
 * Die Zeile „x/y Endpunkte erreichbar" im Statusband der Startseite. Erscheint
 * nur bei wirklich erfolgter Messung; eine gruene Zeile aus einem Ausfall der
 * Messkette heraus waere genau die Sorte Behauptung, die diese Seite nicht macht.
 */
export function EndpunkteZeile({ en }: { en: boolean }) {
  const live = useLiveStatus();
  if (!live.reachable || live.total <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-term">
      <span className="status-dot status-dot--live" aria-hidden />
      {live.up}/{live.total} {en ? 'endpoints up' : 'Endpunkte erreichbar'}
    </span>
  );
}
