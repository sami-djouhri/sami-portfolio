import type { Locale } from './i18n/config';

/**
 * Stack-Begriffe sind fast alle Produkt- oder Techniknamen und bleiben stehen.
 * Diese fünf sind deutsche Wörter und standen bis zum 2026-10-30 so auf `/en`.
 * Übersetzt wird nur die Anzeige: der deutsche Begriff bleibt Schlüssel für Filter,
 * Zählung und Verwandtschaft, damit beide Sprachen dieselbe Menge sehen.
 *
 * Eigenes Modul, weil die Werkliste eine Client-Komponente ist: ein Import aus
 * `lib/projects.ts` zöge sämtliche Projekttexte ins Browser-Bundle.
 */
const STACK_ITEM_EN: Record<string, string> = {
  'Container-Härtung': 'Container hardening',
  'Dateisystem-Verschlüsselung': 'Filesystem encryption',
  Paketfilter: 'Packet filter',
  Ratenbegrenzung: 'Rate limiting',
  'Vektor-Embeddings': 'Vector embeddings',
};

export function localizedStackItem(item: string, locale: Locale): string {
  return locale === 'en' ? STACK_ITEM_EN[item] ?? item : item;
}
