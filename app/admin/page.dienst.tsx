import { redirect } from 'next/navigation';

import { assertLanOrNotFound } from '@/lib/lan';

// Liest Header (LAN-Gate) → nie statisch prerendern.
export const dynamic = 'force-dynamic';

/**
 * Seit dem 2026-10-26 hat der Verwaltungsteil genau eine Fläche, den
 * Posteingang. Projektpflege und Medien sind mit dem CMS-Speicher abgeräumt.
 * Eine Übersichtsseite mit einer einzigen Karte ist ein Klick ohne Inhalt,
 * deshalb führt /admin direkt dorthin.
 *
 * Die Adresse /admin/posteingang bleibt bestehen und wird nicht
 * zusammengelegt: sie ist der Eintrag, den der Owner als Lesezeichen hat,
 * über den HTTPS-Terminator im eigenen Netz (Pflicht für die Entschlüsselung
 * im Browser, die WebCrypto braucht). Der Weg steht in der die Projektregeln und
 * bewusst nicht hier: diese Datei liegt im öffentlichen Baum, und das
 * Privacy-Gate von deploy.sh hat die Adresse prompt gemeldet.
 *
 * ⚠️ Das LAN-Gate steht hier EIGENS, obwohl das Layout es schon prüft:
 * Next rendert Layout und Seite nicht garantiert in dieser Reihenfolge, und
 * eine Weiterleitung, die vor dem 404 des Layouts rausgeht, verrät aus dem
 * öffentlichen Netz die Existenz des Verwaltungsteils. Eine 307 ist eine
 * Auskunft, auch wenn das Ziel danach 404 liefert.
 */
export default async function AdminIndex() {
  await assertLanOrNotFound();
  redirect('/admin/posteingang');
}
