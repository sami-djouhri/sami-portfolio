'use client';

import { useEffect, useState } from 'react';

/**
 * Die Seite misst sich selbst, im Browser des Besuchers, waehrend er sie ansieht.
 *
 * ## Warum das kein Spielzeug ist
 *
 * Jede andere Angabe auf dieser Seite ist eine Messung, die irgendwann irgendwo
 * stattgefunden hat und als Zahl hier steht. Man muss sie glauben. Diese eine
 * Zahl entsteht **jetzt, auf dem Geraet des Lesers**: sein Browser ruft den
 * Gesundheitsendpunkt dieser Seite auf und stoppt die Zeit. Wer ihr nicht traut,
 * oeffnet die Netzwerkansicht und sieht denselben Aufruf.
 *
 * Fuer eine Bewerbung um eine Administrations-Stelle ist das der Unterschied
 * zwischen „ich betreibe Systeme" und „hier ist eins, miss nach".
 *
 * ## Was gemessen wird
 *
 * Die Zeit bis zur Antwort von `/api/health`, also Netz plus Wirt plus
 * Anwendung. Das ist bewusst die ganze Kette und nicht nur die Rechenzeit: fuer
 * den Besucher ist das die Zahl, die zaehlt.
 *
 * Drei Messungen, der **Mittelwert der letzten beiden** wird gezeigt. Der
 * erste Aufruf traegt den Verbindungsaufbau und liegt regelmaessig um ein
 * Mehrfaches hoeher; ihn mitzuzaehlen hiesse, die eigene Seite schlechter
 * darzustellen, als sie ist. Dieselbe Ueberlegung wie bei den Antwortzeit-Proben
 * im Haus.
 *
 * ## Grenzen, die ich bewusst setze
 *
 * - **Kein Dauerlauf.** Drei Aufrufe, dann Ruhe. Eine Seite, die im Sekundentakt
 *   ihren eigenen Server anfragt, ist kein Beweis, sondern eine Last.
 * - **Kein Fehlerbild.** Scheitert die Messung, verschwindet die Zeile, statt
 *   ein rotes Feld zu zeigen. Ein Besucher mit schlechtem Netz soll keinen
 *   Defekt sehen, der keiner ist.
 * - **Server-seitig nichts.** Ohne JavaScript fehlt die Zeile, und die Seite ist
 *   vollstaendig. Sie ergaenzt, sie traegt nicht.
 */
export function Eigenmessung({ beschriftung }: { beschriftung: string }) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    let abgebrochen = false;

    async function messen() {
      const zeiten: number[] = [];
      try {
        for (let i = 0; i < 3; i++) {
          const t0 = performance.now();
          // `cache: 'no-store'` ist der Punkt: aus dem Cache beantwortet waere
          // die Zahl 0 und wuerde etwas messen, das nie stattgefunden hat.
          const antwort = await fetch('/api/health', { cache: 'no-store' });
          if (!antwort.ok) return;
          await antwort.text();
          zeiten.push(performance.now() - t0);
          if (abgebrochen) return;
          await new Promise((r) => setTimeout(r, 120));
        }
      } catch {
        return; // Stille, siehe Kopf: kein Fehlerbild.
      }
      if (abgebrochen || zeiten.length < 3) return;
      const ohneErsten = zeiten.slice(1);
      const mittel = ohneErsten.reduce((a, b) => a + b, 0) / ohneErsten.length;
      setMs(Math.round(mittel));
    }

    // Erst messen, wenn die Seite fertig geladen ist. Waehrend des Ladens
    // konkurriert die Messung mit dem Rest und misst dann vor allem sich selbst.
    const start = window.setTimeout(messen, 600);
    return () => {
      abgebrochen = true;
      window.clearTimeout(start);
    };
  }, []);

  if (ms === null) return null;

  return (
    <span className="eigenmessung" title={beschriftung}>
      <span aria-hidden>{beschriftung} </span>
      <span className="tabular-nums text-term">{ms} ms</span>
      <span className="sr-only">
        {' '}
        {beschriftung}: {ms} Millisekunden, gemessen in diesem Browser.
      </span>
    </span>
  );
}
