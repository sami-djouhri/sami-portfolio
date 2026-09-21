import { ImageResponse } from 'next/og';

/**
 * Das Prompt-Wortzeichen in 512 px, ausgelegt als `maskable`.
 *
 * ★ Ein maskierbares Icon ist NICHT dasselbe Bild in gross. Android schneidet
 * daraus je nach Geraet einen Kreis, ein Quadrat mit runden Ecken oder eine
 * Tropfenform, und garantiert sichtbar bleibt nur der innere Kreis mit 80 %
 * Durchmesser. Deshalb hat diese Variante keinen Rahmen und keinen Eckenradius
 * (beides wuerde angeschnitten und saehe nach Fehler aus) und ein deutlich
 * kleiner gesetztes Motiv: die Zeichen belegen rund die Haelfte der Kante und
 * liegen damit sicher in der Schutzzone. Die Flaeche traegt durchgehend den
 * Grundton, damit an den Schnittkanten nichts Weisses aufblitzt.
 *
 * Wer hier den Rahmen des kleinen Icons nachruestet, macht das Icon kaputt,
 * ohne dass es am Rechner auffaellt: sichtbar wird es erst auf dem Startbildschirm.
 */
export const runtime = 'nodejs';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          backgroundColor: '#0b0c0e',
          fontFamily: 'monospace',
          fontSize: 220,
          fontWeight: 700,
        }}
      >
        <span style={{ color: '#5ac56f' }}>$</span>
        <span style={{ color: '#e0a458' }}>_</span>
      </div>
    ),
    size,
  );
}
