'use client';

/**
 * Eine benutzbare Shell auf einer Seite, die seit Monaten wie ein Terminal aussieht.
 *
 * ★ Warum das kein Widerspruch zur Kritik „zu textlastig" ist: Eine Eingabezeile
 * fuegt keinen Text hinzu, den man lesen MUSS — sie ist Interaktion. Eine frueher
 * erwogene Shell-Deko (tmux-Statuszeile, Box-Drawing-Rahmen) wurde bewusst
 * verworfen, weil sie genau das getan haette. Hier entscheidet der Besucher, ob
 * ueberhaupt etwas erscheint.
 *
 * ★★ Kein `eval`, keine Backend-Aufrufe, keine Freitext-Auswertung. Die Eingabe
 * wird an Leerzeichen zerlegt und gegen eine feste Tabelle geprueft; alles andere
 * ist „unbekannter Befehl". Die Daten sind dieselben Aggregate, die die Seite
 * ohnehin ausliefert — es gibt nichts zu erreichen, was nicht schon oeffentlich ist.
 *
 * Barrierefreiheit: echtes <form> mit beschriftetem Feld, Verlauf als role="log"
 * mit aria-live, Fokus folgt dem Klick auf die Flaeche. Ohne JavaScript erscheint
 * der Block gar nicht (Klasse `nur-mit-js`), statt als totes Eingabefeld dazustehen.
 */

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { localePath, type Locale } from '@/lib/i18n/config';
import { Prompt, WindowBar } from './Terminal';

export interface ShellProjekt {
  id: string;
  title: string;
  domain: string;
  status: string;
  tagline: string;
}

export interface ShellDaten {
  services: number;
  hosts: number;
  drift: number | null;
  measuredAgeHours: number | null;
  projekte: ShellProjekt[];
}

type Zeile = { art: 'eingabe' | 'ausgabe' | 'fehler'; text: string };

const EN = {
  intro: 'Type "help" and press Enter. Everything here is client-side.',
  help: 'Available: help, whoami, services, hosts, uptime, ls, cat <project>, open <project>, clear',
  unknown: (c: string) => `${c}: command not found. Try "help".`,
  needsArg: (c: string) => `${c}: needs a project id. See "ls".`,
  noProject: (id: string) => `${id}: no such project. See "ls".`,
  notMeasured: 'not measured',
  opening: (t: string) => `opening ${t} …`,
  label: 'Terminal input',
  hint: 'client-side · fixed command set',
} as const;

const DE = {
  intro: 'Tippe „help" und drücke Enter. Alles hier läuft im Browser.',
  help: 'Verfügbar: help, whoami, services, hosts, uptime, ls, cat <projekt>, open <projekt>, clear',
  unknown: (c: string) => `${c}: Befehl nicht gefunden. Versuch „help".`,
  needsArg: (c: string) => `${c}: braucht eine Projekt-Kennung. Siehe „ls".`,
  noProject: (id: string) => `${id}: kein solches Projekt. Siehe „ls".`,
  notMeasured: 'nicht gemessen',
  opening: (t: string) => `öffne ${t} …`,
  label: 'Terminal-Eingabe',
  hint: 'im Browser · feste Befehlsliste',
} as const;

export function TerminalShell({ locale, daten }: { locale: Locale; daten: ShellDaten }) {
  const en = locale === 'en';
  const w = en ? EN : DE;
  const router = useRouter();
  const feldId = useId();
  const [zeilen, setZeilen] = useState<Zeile[]>([{ art: 'ausgabe', text: w.intro }]);
  const [eingabe, setEingabe] = useState('');
  const feld = useRef<HTMLInputElement>(null);
  const ende = useRef<HTMLDivElement>(null);

  // Nur nachfuehren, wenn schon etwas passiert ist — sonst zieht das Terminal beim
  // Seitenaufbau den Blick zu sich, obwohl niemand damit gearbeitet hat.
  useEffect(() => {
    if (zeilen.length > 1) ende.current?.scrollIntoView({ block: 'nearest' });
  }, [zeilen]);

  const fuehreAus = useCallback(
    (roh: string): Zeile[] => {
      const teile = roh.trim().split(/\s+/);
      const befehl = (teile[0] ?? '').toLowerCase();
      const arg = teile[1]?.toLowerCase() ?? '';
      const { services, hosts, drift, measuredAgeHours, projekte } = daten;

      switch (befehl) {
        case 'help':
          return [{ art: 'ausgabe', text: w.help }];
        case 'whoami':
          return [
            { art: 'ausgabe', text: 'Sami Djouhri' },
            {
              art: 'ausgabe',
              text: en
                ? 'Infrastructure · Systems · Automation, Düsseldorf area'
                : 'Infrastruktur · Systeme · Automation, Raum Düsseldorf',
            },
          ];
        case 'services': {
          const alter =
            measuredAgeHours === null
              ? w.notMeasured
              : measuredAgeHours < 1
                ? en ? 'measured minutes ago' : 'gemessen vor wenigen Minuten'
                : en ? `measured ${measuredAgeHours} h ago` : `gemessen vor ${measuredAgeHours} h`;
          return [
            {
              art: 'ausgabe',
              text: en
                ? `${services} services managed · ${drift === null ? w.notMeasured : `${drift} deviations`} · ${alter}`
                : `${services} verwaltete Dienste · ${drift === null ? w.notMeasured : `${drift} Abweichungen`} · ${alter}`,
            },
          ];
        }
        case 'hosts':
          return [
            {
              art: 'ausgabe',
              text: en
                ? `${hosts} hosts: own hardware, Pi fleet plus an x86 cluster`
                : `${hosts} Hosts: eigene Hardware, Pi-Verbund plus x86-Cluster`,
            },
          ];
        case 'uptime':
          return [
            {
              art: 'ausgabe',
              text: en ? 'self-run without interruption since 2024' : 'seit 2024 durchgehend im Eigenbetrieb',
            },
          ];
        case 'ls':
          // `ls projekte` und blankes `ls` tun dasselbe: wer hier tippt, will die Liste.
          return projekte.map((p) => ({
            art: 'ausgabe' as const,
            text: `${p.id.padEnd(22)} ${p.domain.padEnd(8)} ${p.status}`,
          }));
        case 'cat': {
          if (!arg) return [{ art: 'fehler', text: w.needsArg('cat') }];
          const p = projekte.find((x) => x.id === arg);
          if (!p) return [{ art: 'fehler', text: w.noProject(arg) }];
          return [
            { art: 'ausgabe', text: p.title },
            { art: 'ausgabe', text: p.tagline },
            { art: 'ausgabe', text: `${p.domain} · ${p.status}` },
          ];
        }
        case 'open': {
          if (!arg) return [{ art: 'fehler', text: w.needsArg('open') }];
          const p = projekte.find((x) => x.id === arg);
          if (!p) return [{ art: 'fehler', text: w.noProject(arg) }];
          router.push(localePath(locale, `/projekte/${p.id}`));
          return [{ art: 'ausgabe', text: w.opening(p.title) }];
        }
        default:
          return [{ art: 'fehler', text: w.unknown(befehl) }];
      }
    },
    [daten, en, locale, router, w],
  );

  function absenden(e: React.FormEvent) {
    e.preventDefault();
    const roh = eingabe.trim();
    setEingabe('');
    if (!roh) return;
    if (roh.toLowerCase() === 'clear') {
      setZeilen([]);
      return;
    }
    setZeilen((alt) => [...alt, { art: 'eingabe', text: roh }, ...fuehreAus(roh)]);
  }

  return (
    <div className="nur-mit-js overflow-hidden rounded-panel border border-border bg-surface/40 shadow-panel">
      <WindowBar
        title="sami@djouhri: ~"
        right={
          <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
            {w.hint}
          </span>
        }
      />
      {/* Klick irgendwo in die Flaeche setzt den Fokus ins Feld — wie in einem echten
          Terminalfenster. Das Feld selbst bleibt regulaer per Tab erreichbar. */}
      <div
        className="p-5 sm:p-6"
        onClick={() => feld.current?.focus()}
        role="presentation"
      >
        <div
          role="log"
          aria-live="polite"
          aria-label={en ? 'Terminal output' : 'Terminal-Ausgabe'}
          className="max-h-72 space-y-1 overflow-y-auto font-mono text-xs leading-relaxed sm:text-sm"
        >
          {zeilen.map((z, i) => (
            <p
              key={i}
              className={
                z.art === 'eingabe'
                  ? 'text-text/90'
                  : z.art === 'fehler'
                    ? 'text-accent'
                    : 'text-muted'
              }
            >
              {z.art === 'eingabe' ? (
                <>
                  <Prompt path="~" /> <span className="ml-2">{z.text}</span>
                </>
              ) : (
                <span className="whitespace-pre-wrap">{z.text}</span>
              )}
            </p>
          ))}
          <div ref={ende} />
        </div>

        <form onSubmit={absenden} className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3">
          <label htmlFor={feldId} className="shrink-0">
            <span className="absolute h-px w-px overflow-hidden [clip:rect(0,0,0,0)]">{w.label}</span>
            <Prompt path="~" />
          </label>
          <input
            id={feldId}
            ref={feld}
            value={eingabe}
            onChange={(e) => setEingabe(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent font-mono text-xs text-text outline-none placeholder:text-muted-dim focus-visible:outline-none sm:text-sm"
            placeholder={en ? 'help' : 'help'}
          />
        </form>
      </div>
    </div>
  );
}
