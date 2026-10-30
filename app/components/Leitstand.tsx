'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { localePath, type Locale } from '@/lib/i18n/config';

/**
 * Die Konsole, die das Werkfeld steuert.
 *
 * ## Warum das die Struktur der Seite aendert und nicht nur ein Kasten darauf ist
 *
 * Auf `/toolbox` steht seit Monaten eine benutzbare Shell mit echten Daten, und
 * sie ist das Eigenste, was diese Seite hat. Sie liegt auf einer Unterseite, die
 * niemand oeffnet. Hier wird sie zur **Bedienung der Startseite**: das Werkfeld
 * ist nicht mehr eine feste Liste, sondern die Ausgabe eines Befehls, den man
 * aendern kann.
 *
 * Der Unterschied zum Terminal-Portfolio-Klischee ist nicht die Optik, sondern
 * was dahinter steht. Dort beantwortet `whoami` eine Begruessung. Hier filtert
 * und ordnet ein Befehl eine Werkliste, und `messen` erhebt einen Wert, den es
 * vorher nicht gab.
 *
 * ## Warum es das Feld ueber Attribute steuert und nicht ueber React-Zustand
 *
 * Das Werkfeld wird auf dem Server gerendert und enthaelt Bilder. Ein Filter
 * ueber React haette es bei jedem Befehl neu gebaut, inklusive aller Bilder.
 * Stattdessen setzt die Konsole zwei Attribute am Feld-Element, und CSS
 * entscheidet, was sichtbar ist. Das kostet keinen Neuaufbau und wirkt sofort.
 *
 * ⚠️ Die Sortierung muss `style.order` setzen statt einer CSS-Regel: `order`
 * kann den Wert eines data-Attributs nicht lesen, `attr()` ist dafuer nicht
 * freigegeben.
 *
 * ## Die Konsole als Hauptweg (2026-10-18, Entscheid vom 17.10.)
 *
 * `zeig <kennung>` sprang bis dahin auf die Fallstudie. Jetzt klappt es die
 * Arbeit **im Feld** auf: dieselbe Mechanik wie der Filter, ein `data-offen`
 * an der Zelle, und das Stilblatt zeigt den Tiefen-Block, der im HTML schon
 * steht. Damit fuehrt die Konsole durch die Seite, statt sie zu verlassen.
 *
 * Dazu fuehrt die Tastatur, und zwar so, wie es eine Konsole erwarten laesst:
 * `Pfeil hoch`/`runter` holt frueher getippte Befehle zurueck, `Tabulator`
 * vervollstaendigt Befehl und Kennung, `Esc` schliesst die offene Arbeit. Ein
 * Terminal ohne Verlauf und ohne Vervollstaendigung ist ein Bild von einem
 * Terminal, und genau das soll diese Seite nicht sein.
 *
 * ## Grenzen
 *
 * - Kein `eval`, keine Freitext-Auswertung. Die Eingabe wird zerlegt und gegen
 *   eine feste Tabelle geprueft, alles andere ist ein unbekannter Befehl.
 * - Keine Daten, die nicht ohnehin auf der Seite stehen. Die Konsole ist eine
 *   andere Sicht auf dasselbe, kein Zugang zu etwas Innerem.
 * - Ohne JavaScript erscheint sie nicht (`nur-mit-js`), und die Seite ist
 *   vollstaendig: das Werkfeld steht dann einfach ungefiltert da, jede Zelle
 *   ist ein Verweis auf ihre Fallstudie. Der Tiefen-Block bleibt dann
 *   unsichtbar, sein Inhalt steht vollstaendig auf der Fallstudie.
 */

export interface LeitstandArbeit {
  id: string;
  title: string;
  domain: string;
  jahr: string;
}

type Zeile = { art: 'eingabe' | 'ausgabe' | 'fehler'; text: string };

const DOMAENEN = ['Suite', 'Infra', 'AI', 'Web', 'Bots'];

/**
 * Alles, was die Vervollstaendigung anbietet, deutsch und englisch in einer
 * Liste. Die Konsole nimmt beide Sprachen unabhaengig von der Seitensprache
 * an, und ein Tabulator soll das nicht halbieren.
 *
 * ⚠️ Wer unten einen Befehl ergaenzt, traegt ihn hier nach. Sonst gibt es ihn,
 * und der Tabulator kennt ihn nicht, was sich wie ein Tippfehler anfuehlt.
 */
const BEFEHLE = [
  'hilfe', 'help',
  'filter',
  'ordne', 'sort',
  'zeig', 'open',
  'weiter', 'next',
  'vorige', 'prev',
  'fallstudie', 'study',
  'messen', 'measure',
  'status',
  'zurueck', 'reset',
  'clear',
];

export function Leitstand({
  locale,
  arbeiten,
  feldId,
}: {
  locale: Locale;
  arbeiten: LeitstandArbeit[];
  /** id des Werkfeld-Elements, das diese Konsole steuert. */
  feldId: string;
}) {
  const en = locale === 'en';
  const router = useRouter();
  const eingabeId = useId();
  const [eingabe, setEingabe] = useState('');
  const [zeilen, setZeilen] = useState<Zeile[]>([]);
  const [messung, setMessung] = useState<string | null>(null);
  /** Kennung der im Feld geoeffneten Arbeit, oder null. */
  const [offen, setOffen] = useState<string | null>(null);
  const ende = useRef<HTMLDivElement | null>(null);
  /** Getippte Befehle, neueste zuletzt. Fuer Pfeil hoch und runter. */
  const verlauf = useRef<string[]>([]);
  const verlaufPos = useRef<number | null>(null);

  useEffect(() => {
    if (zeilen.length > 0) ende.current?.scrollIntoView({ block: 'nearest' });
  }, [zeilen]);

  /** Setzt Filter und Ordnung am Werkfeld. Null hebt auf. */
  const steuere = useCallback(
    (was: 'filter' | 'ordnung', wert: string | null) => {
      const feld = document.getElementById(feldId);
      if (!feld) return;
      if (wert === null) feld.removeAttribute(`data-${was}`);
      else feld.setAttribute(`data-${was}`, wert);

      if (was === 'ordnung') {
        const zellen = Array.from(feld.querySelectorAll<HTMLElement>('[data-arbeit]'));
        if (wert === null) {
          zellen.forEach((z) => {
            z.style.order = '';
          });
          return;
        }
        const schluessel = (z: HTMLElement) =>
          wert === 'jahr' ? (z.dataset.jahr ?? '') : (z.dataset.arbeit ?? '');
        // Absteigend bei Jahr (neueste zuerst), aufsteigend bei Name.
        const sortiert = [...zellen].sort((a, b) =>
          wert === 'jahr'
            ? schluessel(b).localeCompare(schluessel(a))
            : schluessel(a).localeCompare(schluessel(b)),
        );
        sortiert.forEach((z, i) => {
          z.style.order = String(i);
        });
      }
    },
    [feldId],
  );

  /**
   * Oeffnet eine Arbeit im Feld, oder schliesst die offene (`null`).
   *
   * Das Attribut sitzt an der ZELLE und nicht nur am Feld: CSS kann nicht
   * vergleichen, ob `data-arbeit` einer Zelle dem `data-offen` des Feldes
   * entspricht. Am Feld steht es trotzdem mit, damit von aussen ablesbar ist,
   * was offen ist.
   */
  const oeffne = useCallback(
    (id: string | null) => {
      const feld = document.getElementById(feldId);
      if (!feld) return;
      const zellen = Array.from(feld.querySelectorAll<HTMLElement>('[data-arbeit]'));
      let getroffen: HTMLElement | null = null;
      for (const z of zellen) {
        if (id && z.dataset.arbeit === id) {
          z.setAttribute('data-offen', '');
          getroffen = z;
        } else {
          z.removeAttribute('data-offen');
        }
      }
      if (id) feld.setAttribute('data-offen', id);
      else feld.removeAttribute('data-offen');
      setOffen(id);
      // `nearest` und nicht `center`: wer eine Arbeit oeffnet, die schon im
      // Blick ist, soll nicht verschoben werden. Bewusst ohne `smooth`, das
      // waere eine zweite Bewegung neben dem Eroeffnungsmoment der Seite.
      getroffen?.scrollIntoView({ block: 'nearest' });
    },
    [feldId],
  );

  /**
   * Die Kennungen in der Reihenfolge, in der sie gerade im Feld stehen, ohne
   * die weggefilterten. Gelesen wird am DOM und nicht an den Daten: Filter und
   * Ordnung stehen dort, also ist das DOM die Wahrheit ueber die Ansicht.
   */
  const reihe = useCallback((): string[] => {
    const feld = document.getElementById(feldId);
    if (!feld) return [];
    const filter = feld.getAttribute('data-filter');
    return Array.from(feld.querySelectorAll<HTMLElement>('[data-arbeit]'))
      .filter((z) => !filter || z.dataset.domain === filter)
      .map((z, i) => ({ z, ord: Number(z.style.order || 0), i }))
      .sort((a, b) => a.ord - b.ord || a.i - b.i)
      .map((x) => x.z.dataset.arbeit ?? '');
  }, [feldId]);

  /** Einen Schritt weiter oder zurueck durch die sichtbare Reihe. */
  const schritt = useCallback(
    (richtung: 1 | -1): string | null => {
      const liste = reihe();
      if (liste.length === 0) return null;
      const jetzt = offen ? liste.indexOf(offen) : -1;
      const naechste = jetzt < 0 ? (richtung === 1 ? 0 : liste.length - 1) : (jetzt + richtung + liste.length) % liste.length;
      return liste[naechste] ?? null;
    },
    [offen, reihe],
  );

  const messen = useCallback(async () => {
    const zeiten: number[] = [];
    try {
      for (let i = 0; i < 3; i++) {
        const t0 = performance.now();
        const a = await fetch('/api/health', { cache: 'no-store' });
        if (!a.ok) return null;
        await a.text();
        zeiten.push(performance.now() - t0);
        await new Promise((r) => setTimeout(r, 90));
      }
    } catch {
      return null;
    }
    const ohneErsten = zeiten.slice(1);
    return Math.round(ohneErsten.reduce((a, b) => a + b, 0) / ohneErsten.length);
  }, []);

  const fuehreAus = useCallback(
    async (roh: string): Promise<Zeile[]> => {
      const teile = roh.trim().split(/\s+/);
      const befehl = (teile[0] ?? '').toLowerCase();
      const arg = teile[1] ?? '';
      const argKlein = arg.toLowerCase();

      switch (befehl) {
        case 'hilfe':
        case 'help':
          return [
            {
              art: 'ausgabe',
              text: en
                ? 'filter <area> · sort <year|name> · open <id> · next · prev · study <id> · measure · status · reset'
                : 'filter <bereich> · ordne <jahr|name> · zeig <kennung> · weiter · vorige · fallstudie <kennung> · messen · status · zurueck',
            },
            {
              art: 'ausgabe',
              text: en
                ? `areas: ${DOMAENEN.join(', ')}`
                : `Bereiche: ${DOMAENEN.join(', ')}`,
            },
            // Die Tastatur gehoert in die Hilfe, sonst findet sie niemand.
            {
              art: 'ausgabe',
              text: en
                ? 'keys: Tab completes · Up/Down recalls · Esc closes'
                : 'Tasten: Tabulator vervollständigt · Pfeil hoch und runter holt zurück · Esc schließt',
            },
          ];

        case 'filter': {
          if (!argKlein) return [{ art: 'fehler', text: en ? 'filter needs an area' : 'filter braucht einen Bereich' }];
          const treffer = DOMAENEN.find((d) => d.toLowerCase() === argKlein);
          if (!treffer) {
            return [
              {
                art: 'fehler',
                text: en ? `unknown area: ${arg}` : `unbekannter Bereich: ${arg}`,
              },
            ];
          }
          steuere('filter', treffer);
          const n = arbeiten.filter((a) => a.domain === treffer).length;
          return [
            {
              art: 'ausgabe',
              text: en
                ? `${n} of ${arbeiten.length} works in ${treffer}`
                : `${n} von ${arbeiten.length} Arbeiten in ${treffer}`,
            },
          ];
        }

        case 'ordne':
        case 'sort': {
          if (argKlein === 'jahr' || argKlein === 'year') {
            steuere('ordnung', 'jahr');
            return [{ art: 'ausgabe', text: en ? 'newest first' : 'neueste zuerst' }];
          }
          if (argKlein === 'name') {
            steuere('ordnung', 'name');
            return [{ art: 'ausgabe', text: en ? 'sorted by name' : 'nach Namen geordnet' }];
          }
          return [{ art: 'fehler', text: en ? 'sort year | name' : 'ordne jahr | name' }];
        }

        case 'zurueck':
        case 'reset':
          steuere('filter', null);
          steuere('ordnung', null);
          // Schliesst auch die offene Arbeit: `zurueck` heisst „Feld wie am
          // Anfang". Eine Zelle, die danach noch aufgeklappt daliegt, waere
          // ein halb ausgefuehrter Befehl.
          oeffne(null);
          return [{ art: 'ausgabe', text: en ? 'all works, original order' : 'alle Arbeiten, urspruengliche Ordnung' }];

        case 'messen':
        case 'measure': {
          const ms = await messen();
          if (ms === null) {
            return [{ art: 'fehler', text: en ? 'measurement failed' : 'Messung fehlgeschlagen' }];
          }
          setMessung(`${ms} ms`);
          return [
            {
              art: 'ausgabe',
              text: en
                ? `health endpoint answered in ${ms} ms, measured in this browser just now`
                : `Gesundheitsendpunkt antwortet in ${ms} ms, eben in diesem Browser gemessen`,
            },
          ];
        }

        case 'status':
          return [
            {
              art: 'ausgabe',
              text: en
                ? `${arbeiten.length} works in ${new Set(arbeiten.map((a) => a.domain)).size} areas`
                : `${arbeiten.length} Arbeiten in ${new Set(arbeiten.map((a) => a.domain)).size} Bereichen`,
            },
          ];

        // Oeffnet die Arbeit IM FELD, statt auf die Fallstudie zu springen
        // (Entscheid 2026-10-17). Der Weg zur ganzen Fallstudie bleibt
        // die Zelle selbst, und als Befehl `fallstudie`.
        case 'zeig':
        case 'open': {
          if (!argKlein) return [{ art: 'fehler', text: en ? 'open needs an id' : 'zeig braucht eine Kennung' }];
          const a = arbeiten.find((x) => x.id === argKlein);
          if (!a) return [{ art: 'fehler', text: en ? `no work: ${arg}` : `keine Arbeit: ${arg}` }];
          oeffne(a.id);
          return [
            {
              art: 'ausgabe',
              text: en
                ? `${a.title} opened in the field, Esc closes it`
                : `${a.title} im Feld geöffnet, Esc schließt wieder`,
            },
          ];
        }

        case 'weiter':
        case 'next':
        case 'vorige':
        case 'prev': {
          const vor = befehl === 'weiter' || befehl === 'next';
          const ziel = schritt(vor ? 1 : -1);
          if (!ziel) {
            return [{ art: 'fehler', text: en ? 'nothing to step through' : 'nichts zum Durchgehen' }];
          }
          oeffne(ziel);
          const t = arbeiten.find((x) => x.id === ziel)?.title ?? ziel;
          return [{ art: 'ausgabe', text: t }];
        }

        // Der eine Befehl, der die Seite verlaesst. Ohne Angabe nimmt er die
        // offene Arbeit, sonst braucht er eine Kennung.
        case 'fallstudie':
        case 'study': {
          const ziel = argKlein || offen;
          if (!ziel) {
            return [
              {
                art: 'fehler',
                text: en ? 'study needs an id, or open one first' : 'fallstudie braucht eine Kennung, oder erst eine oeffnen',
              },
            ];
          }
          const a = arbeiten.find((x) => x.id === ziel);
          if (!a) return [{ art: 'fehler', text: en ? `no work: ${ziel}` : `keine Arbeit: ${ziel}` }];
          router.push(localePath(locale, `/projekte/${a.id}`));
          return [{ art: 'ausgabe', text: en ? `opening ${a.title}` : `oeffne ${a.title}` }];
        }

        default:
          return [
            {
              art: 'fehler',
              text: en ? `unknown: ${befehl}, try help` : `unbekannt: ${befehl}, versuch hilfe`,
            },
          ];
      }
    },
    [arbeiten, en, locale, messen, oeffne, offen, router, schritt, steuere],
  );

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    const roh = eingabe.trim();
    setEingabe('');
    if (!roh) return;
    verlauf.current.push(roh);
    verlaufPos.current = null;
    if (roh.toLowerCase() === 'clear') {
      setZeilen([]);
      return;
    }
    setZeilen((alt) => [...alt, { art: 'eingabe', text: roh }]);
    const aus = await fuehreAus(roh);
    setZeilen((alt) => [...alt, ...aus]);
  }

  /**
   * Tastatur. Drei Dinge, die eine Konsole mitbringen muss, und ohne die sie
   * eine Nachbildung ist: Verlauf, Vervollstaendigung, Abbruch.
   */
  function taste(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      // Erst die offene Arbeit, dann die Eingabe. Zwei Bedeutungen fuer eine
      // Taste, aber in einer Rangfolge, die man nicht erklaeren muss.
      if (offen) {
        oeffne(null);
        e.preventDefault();
        return;
      }
      if (eingabe) {
        setEingabe('');
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const n = verlauf.current.length;
      if (n === 0) return;
      e.preventDefault();
      const pos = verlaufPos.current;
      if (e.key === 'ArrowUp') {
        const neu = pos === null ? n - 1 : Math.max(0, pos - 1);
        verlaufPos.current = neu;
        setEingabe(verlauf.current[neu] ?? '');
      } else {
        if (pos === null) return;
        const neu = pos + 1;
        if (neu >= n) {
          verlaufPos.current = null;
          setEingabe('');
        } else {
          verlaufPos.current = neu;
          setEingabe(verlauf.current[neu] ?? '');
        }
      }
      return;
    }

    if (e.key === 'Tab') {
      // ⚠️ Nur abfangen, wenn es etwas zu vervollstaendigen gibt. Sonst
      // verliert die Seite ihren Tabulator-Sprung aus dem Eingabefeld heraus,
      // und das ist der einzige Weg weiter fuer jemanden, der nur die Tastatur
      // hat.
      const teile = eingabe.split(/\s+/);
      const letzte = (teile[teile.length - 1] ?? '').toLowerCase();
      if (!letzte) return;
      const erstes = (teile[0] ?? '').toLowerCase();
      const kandidaten =
        teile.length === 1
          ? BEFEHLE.filter((b) => b.startsWith(letzte))
          : erstes === 'filter'
            ? DOMAENEN.filter((d) => d.toLowerCase().startsWith(letzte))
            : ['zeig', 'open', 'fallstudie', 'study'].includes(erstes)
              ? arbeiten.map((a) => a.id).filter((id) => id.startsWith(letzte))
              : [];
      if (kandidaten.length === 0) return;
      e.preventDefault();
      if (kandidaten.length === 1) {
        teile[teile.length - 1] = kandidaten[0] ?? '';
        setEingabe(teile.join(' '));
        return;
      }
      setZeilen((alt) => [...alt, { art: 'ausgabe', text: kandidaten.join('  ') }]);
    }
  }

  async function chip(befehl: string) {
    setZeilen((alt) => [...alt, { art: 'eingabe', text: befehl }]);
    const aus = await fuehreAus(befehl);
    setZeilen((alt) => [...alt, ...aus]);
  }

  // Die Chips sind der Handy-Weg. Eine Eingabezeile auf einem Telefon ist eine
  // Zumutung, und ohne sie waere die Konsole dort Dekoration. Sie fuehren
  // dieselben Befehle aus, die man auch tippen kann.
  //
  // Einer von ihnen nennt eine konkrete Kennung (`zeig <erste Arbeit>`).
  // Das ist kein Beispiel aus Bequemlichkeit: ohne ihn bliebe das Aufklappen
  // im Feld am Telefon unerreichbar, weil dort niemand eine Kennung tippt, und
  // waere damit genau auf dem Geraet nicht vorhanden, das fuehrt.
  // Die Kennung kommt aus der Liste und steht nicht im Code: eine
  // hartkodierte waere nach dem naechsten Umsortieren eine Fehlermeldung.
  const ersteKennung = arbeiten[0]?.id ?? '';
  const chips = en
    ? [
        { auf: `open ${ersteKennung}`, zeig: `open ${ersteKennung}` },
        { auf: 'next', zeig: 'next' },
        { auf: 'filter Infra', zeig: 'filter Infra' },
        { auf: 'sort year', zeig: 'sort year' },
        { auf: 'measure', zeig: 'measure' },
        { auf: 'reset', zeig: 'reset' },
      ]
    : [
        { auf: `zeig ${ersteKennung}`, zeig: `zeig ${ersteKennung}` },
        { auf: 'weiter', zeig: 'weiter' },
        { auf: 'filter Infra', zeig: 'filter Infra' },
        { auf: 'ordne jahr', zeig: 'ordne jahr' },
        { auf: 'messen', zeig: 'messen' },
        { auf: 'zurueck', zeig: 'zurueck' },
      ];

  return (
    <div className="leitstand nur-mit-js">
      <form onSubmit={absenden} className="leitstand-zeile">
        <label htmlFor={eingabeId} className="sr-only">
          {en ? 'Command for the work list' : 'Befehl für die Werkliste'}
        </label>
        <span aria-hidden className="leitstand-prompt">
          sami@djouhri<span className="text-muted-dim">:</span>
          <span className="text-accent">~</span>
          <span className="text-muted-dim">$</span>
        </span>
        <input
          id={eingabeId}
          value={eingabe}
          onChange={(e) => setEingabe(e.target.value)}
          onKeyDown={taste}
          className="leitstand-eingabe"
          placeholder={en ? 'help' : 'hilfe'}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
        />
        {messung ? <span className="leitstand-messung">{messung}</span> : null}
      </form>

      <div className="leitstand-chips">
        {chips.map((c) => (
          <button key={c.auf} type="button" onClick={() => chip(c.auf)} className="leitstand-chip">
            {c.zeig}
          </button>
        ))}
      </div>

      {zeilen.length > 0 ? (
        <div role="log" aria-live="polite" className="leitstand-verlauf">
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
              {z.art === 'eingabe' ? <span className="text-term">$ </span> : null}
              {z.text}
            </p>
          ))}
          <div ref={ende} />
        </div>
      ) : null}
    </div>
  );
}
