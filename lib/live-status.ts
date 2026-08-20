/**
 * D1 „Live-Beweis“: echter, EXTERN gemessener Erreichbarkeits-Status der öffentlichen
 * Dienste, geholt von der Gatus-Instanz auf dem netcup-Außenposten (status.djouhri.de).
 * Home-unabhängig gemessen (nicht vom Heim selbst), genau das macht die Zahl glaubwürdig
 * für ein Betriebs-Portfolio: „beweisen statt behaupten“.
 *
 * Robust by design: schlägt der Abruf fehl (DNS-Record noch nicht gesetzt, Gatus down,
 * Timeout), liefert die Funktion { reachable:false } und die UI degradiert sauber auf die
 * statische Selbstauskunft, es wird NIE fälschlich „live“ behauptet. Sobald der DNS-Record
 * existiert (scripts/ensure-dns.sh im netcup-sentinel-Repo, owner-gated), leuchtet der
 * Streifen beim nächsten ISR-Revalidate (5 min) von selbst auf.
 *
 * Konfigurierbar per ENV (ohne Rebuild-Zwang der Logik):
 *   STATUS_API_URL, Gatus-Endpunkt-Statuses-API (Default: öffentliche status.djouhri.de)
 *   STATUS_PAGE_URL, verlinkte öffentliche Status-Seite (Default: https://status.djouhri.de)
 *
 * Privacy: an die UI gehen NUR Aggregate (erreichbar / gesamt / Verfügbarkeit%), keine
 * Endpunkt-Namen, konsistent mit lib/proof.ts.
 */

const API_URL =
  process.env.STATUS_API_URL ||
  'https://status.djouhri.de/api/v1/endpoints/statuses?page=1&pageSize=100';
const STATUS_PAGE = process.env.STATUS_PAGE_URL || 'https://status.djouhri.de';
const TIMEOUT_MS = 4000;
/** Ab wie vielen Einzelmessungen wir überhaupt eine Verfügbarkeits-% zeigen (sonst Rauschen). */
const MIN_SAMPLES = 30;

export interface LiveStatus {
  /** true nur wenn Gatus tatsächlich erreichbar war UND mind. ein Endpunkt Daten hatte. */
  reachable: boolean;
  /** aktuell erreichbare öffentliche Endpunkte (letzte Messung success). */
  up: number;
  /** insgesamt überwachte öffentliche Endpunkte mit Messdaten. */
  total: number;
  /** grobe Verfügbarkeit über das verfügbare Messfenster, oder null bei zu wenig Samples. */
  uptimePct: number | null;
  /** öffentliche Status-Seite für den Deep-Link. */
  statusUrl: string;
}

interface GatusResult {
  success?: boolean;
}
interface GatusEndpoint {
  results?: GatusResult[];
}

export async function getLiveStatus(): Promise<LiveStatus> {
  const fallback: LiveStatus = {
    reachable: false,
    up: 0,
    total: 0,
    uptimePct: null,
    statusUrl: STATUS_PAGE,
  };

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(API_URL, { signal: ctrl.signal, next: { revalidate: 300 } });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return fallback;

    const data = (await res.json()) as GatusEndpoint[];
    if (!Array.isArray(data) || data.length === 0) return fallback;

    let up = 0;
    let total = 0;
    let samples = 0;
    let ok = 0;
    for (const ep of data) {
      const results = Array.isArray(ep?.results) ? ep.results : [];
      if (results.length === 0) continue;
      total += 1;
      const last = results[results.length - 1];
      if (last?.success) up += 1;
      for (const r of results) {
        samples += 1;
        if (r?.success) ok += 1;
      }
    }
    if (total === 0) return fallback;

    const uptimePct =
      samples >= MIN_SAMPLES ? Math.round((ok / samples) * 1000) / 10 : null;
    return { reachable: true, up, total, uptimePct, statusUrl: STATUS_PAGE };
  } catch {
    // DNS fehlt / Timeout / Netzfehler / kaputtes JSON → still auf statisch degradieren.
    return fallback;
  }
}
