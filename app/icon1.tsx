import { ImageResponse } from 'next/og';

/**
 * Das Prompt-Wortzeichen in 192 px.
 *
 * Next erkennt `icon1`/`icon2` als weitere Einträge derselben Icon-Konvention
 * (app/icon.tsx ist die 64er-Variante) und hängt sie automatisch in den Kopf.
 * Gebraucht werden sie fuer das Manifest: mit nur 64 und 180 gilt eine Seite
 * als nicht installierbar, weil 192 die Mindestgroesse ist.
 *
 * Bewusst dieselbe Grafik wie das kleine Icon, nur proportional skaliert
 * (Schrift 40/64 der Kantenlaenge, Rahmen und Radius mitgezogen). Das Motiv ist
 * das Wortzeichen der Seite und darf zwischen den Groessen nicht abweichen.
 */
export const runtime = 'nodejs';
export const size = { width: 192, height: 192 };
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
          gap: 6,
          backgroundColor: '#0b0c0e',
          fontFamily: 'monospace',
          fontSize: 120,
          fontWeight: 700,
          borderRadius: 36,
          border: '6px solid #26282f',
        }}
      >
        <span style={{ color: '#5ac56f' }}>$</span>
        <span style={{ color: '#e0a458' }}>_</span>
      </div>
    ),
    size,
  );
}
