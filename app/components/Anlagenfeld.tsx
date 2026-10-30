'use client';

import { useEffect, useRef } from 'react';

/**
 * Der lebende Grund der Startseite: ein ruhiges Punktraster hinter dem Werkfeld.
 *
 * Seit dem 2026-10-30 ein Muster ohne Mengenaussage (Entscheid).
 * Bis dahin zeichnete es genau einen Punkt je gemessenem Dienst, aus der
 * Hausmessung in `proof.json`. Die ist gefallen (Begruendung in `lib/proof.ts`),
 * und ein Feld aus einer festen Zahl waere ein Bild ohne Messung gewesen, also
 * genau das, weshalb das Statusraster mit ihr fiel. Das Raster fuellt jetzt die
 * Flaeche, die es hat. Ein Punkt bedeutet nichts, und auf der Seite steht
 * nirgends etwas anderes.
 *
 * ## Warum Canvas und nicht DOM
 *
 * Einige hundert animierte DOM-Knoten sind auf einem Telefon ein
 * Ruckel-Generator. Ein Canvas traegt das ohne Layout-Kosten: ein Element, ein
 * Zeichenaufruf je Bild.
 *
 * ## Was es NICHT tut
 *
 * - **Es haelt die CPU nicht dauerhaft wach.** Nach dem Hochfahren laeuft es mit
 *   stark gedrosselter Bildrate, und sobald die Seite im Hintergrund liegt oder
 *   das Feld ausserhalb des Blicks ist, steht es still.
 * - **Es traegt keinen Inhalt.** Fehlt JavaScript, fehlt das Feld, und die Seite
 *   ist vollstaendig. Deshalb `aria-hidden` und kein Textersatz.
 *
 * ⚠️ `prefers-reduced-motion`: ein Standbild, kein Schwarz. Nur das Atmen
 * entfaellt.
 */

/** Ruhiger Grundton des Felds (term-dim), als RGB fuer den Canvas. */
const TON = { r: 0x5a, g: 0xc5, b: 0x6f };

/** Abstand der Punkte. Groesser heisst luftiger, aber auch weniger Menge im Blick. */
const RASTER = 24;
const PUNKT = 2.1;

/** Deterministischer Zufall je Punkt: gleiche Seite, gleiches Bild. */
function streuung(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function Anlagenfeld() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lauf = 0;
    let letzte = 0;
    let sichtbar = true;
    const start = performance.now();

    // Wo der Finger oder der Zeiger zuletzt war, und wie stark das noch wirkt.
    // `naehe` faellt nach dem Loslassen langsam ab, damit die Spur ausklingt
    // statt zu verschwinden.
    let zx = -9999;
    let zy = -9999;
    let naehe = 0;

    type Punkt = { x: number; y: number; phase: number; tempo: number };
    let punkte: Punkt[] = [];
    let dpr = 1;

    function legen() {
      const el = ref.current;
      if (!el || !ctx) return;
      const b = el.clientWidth;
      const h = el.clientHeight;
      if (b === 0 || h === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(b * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Spalten aus der Breite, Zeilen aus der Hoehe: das Raster fuellt die
      // Flaeche, die es hat, und behauptet damit keine Menge.
      const spalten = Math.max(4, Math.floor(b / RASTER));
      const zeilen = Math.max(1, Math.floor(h / RASTER));
      const anzahl = spalten * zeilen;
      const randX = (b - (spalten - 1) * RASTER) / 2;
      const randY = (h - (zeilen - 1) * RASTER) / 2;

      punkte = Array.from({ length: anzahl }, (_, i) => {
        const sp = i % spalten;
        const ze = Math.floor(i / spalten);
        return {
          x: randX + sp * RASTER + (streuung(i) - 0.5) * 7,
          y: randY + ze * RASTER + (streuung(i + 991) - 0.5) * 7,
          phase: streuung(i + 17) * Math.PI * 2,
          // Jeder Punkt hat sein eigenes Tempo. Ein gemeinsamer Takt saehe aus
          // wie ein Blinken, und ein Blinken liest sich als Warnung.
          tempo: 0.35 + streuung(i + 55) * 0.5,
        };
      });
    }

    function zeichnen(jetzt: number) {
      const el = ref.current;
      if (!el || !ctx) return;
      const b = el.clientWidth;
      const h = el.clientHeight;
      ctx.clearRect(0, 0, b, h);

      // Hochfahren: die Punkte erscheinen in Wellen von oben nach unten, einmal,
      // ueber gut eine Sekunde. Das ist der Eroeffnungsmoment, und er liegt
      // bewusst im GRUND: der Inhalt daruber ist vom ersten Bild an vollstaendig
      // lesbar, damit die groesste Ueberschrift nicht auf eine Animation wartet
      // (LCP-Disziplin).
      const seit = jetzt - start;
      const hoch = ruhig ? 1 : Math.min(1, seit / 1250);

      for (let i = 0; i < punkte.length; i++) {
        const p = punkte[i];
        if (!p) continue;
        const anteil = p.y / Math.max(h, 1);
        const an = Math.max(0, Math.min(1, (hoch - anteil * 0.55) * 3.2));
        if (an <= 0) continue;

        const atem = ruhig ? 0.55 : 0.5 + 0.5 * Math.sin(jetzt * 0.001 * p.tempo + p.phase);

        // Die Punkte unter dem Zeiger leuchten auf. Das ist der Unterschied
        // zwischen einer Tapete und einem System: die Anlage reagiert darauf,
        // dass jemand hinsieht. Quadratischer Abstand, kein Wurzelziehen, das
        // laeuft je Bild ueber alle Punkte.
        let hell = 0;
        if (naehe > 0.01) {
          const dx = p.x - zx;
          const dy = p.y - zy;
          const d2 = dx * dx + dy * dy;
          const r2 = 130 * 130;
          if (d2 < r2) hell = (1 - d2 / r2) * naehe;
        }

        const staerke = 0.16 + atem * 0.3 + hell * 0.75;
        ctx.globalAlpha = staerke * an;
        ctx.fillStyle = `rgb(${TON.r} ${TON.g} ${TON.b})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, PUNKT * (0.7 + atem * 0.5 + hell * 1.1), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function tick(jetzt: number) {
      // Gedrosselt auf gut 20 Bilder je Sekunde. Das Atmen ist langsam, mehr
      // Bilder waeren nicht sichtbar und kosten auf einem Telefon Akku.
      if (jetzt - letzte > 46 && sichtbar) {
        // Die Spur klingt ueber gut eine Sekunde aus.
        naehe = Math.max(0, naehe - 0.04);
        zeichnen(jetzt);
        letzte = jetzt;
      }
      // Nach dem Hochfahren bleibt das Atmen, aber bei reduzierter Bewegung
      // steht das Bild nach dem ersten Durchlauf endgueltig still.
      if (ruhig && jetzt - start > 1400) return;
      lauf = requestAnimationFrame(tick);
    }

    legen();
    lauf = requestAnimationFrame(tick);

    const beiGroesse = () => {
      legen();
      zeichnen(performance.now());
    };
    window.addEventListener('resize', beiGroesse);

    // Liegt die Seite im Hintergrund, wird nicht gezeichnet. Ein Hintergrundtab,
    // der weiterrechnet, ist genau die Sorte Unart, gegen die diese Seite sonst
    // argumentiert.
    const beiSicht = () => {
      sichtbar = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', beiSicht);

    // ⚠️ Am Canvas selbst zu lauschen geht nicht: es liegt hinter dem Inhalt und
    // hat `pointer-events: none`, sonst waere keine Zelle mehr anklickbar. Also
    // lauscht das Fenster, und weil das Feld fest im Fenster liegt, sind
    // Zeigerkoordinaten und Feldkoordinaten dieselben.
    // `passive` ist hier Pflicht: ein nicht-passiver Touch-Zuhoerer auf dem
    // Fenster kann das Scrollen auf einem Telefon ins Stocken bringen.
    const beiZeiger = (e: PointerEvent) => {
      if (ruhig) return;
      zx = e.clientX;
      zy = e.clientY;
      naehe = 1;
    };
    window.addEventListener('pointermove', beiZeiger, { passive: true });
    window.addEventListener('pointerdown', beiZeiger, { passive: true });

    return () => {
      cancelAnimationFrame(lauf);
      window.removeEventListener('resize', beiGroesse);
      document.removeEventListener('visibilitychange', beiSicht);
      window.removeEventListener('pointermove', beiZeiger);
      window.removeEventListener('pointerdown', beiZeiger);
    };
  }, []);

  return <canvas ref={ref} className="anlagenfeld" aria-hidden />;
}
