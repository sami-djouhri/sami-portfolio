// Server-only: PGP-Verschlüsselung eingehender Kontaktanfragen mit dem ÖFFENTLICHEN
// Schlüssel des Betreibers. Der private Schlüssel liegt bewusst NIE auf diesem
// (öffentlich erreichbaren) Server — entschlüsselt wird ausschließlich offline bzw.
// im LAN-Admin (client-seitig im Browser). Damit liegt selbst bei einer vollständigen
// Kompromittierung des netcup-Hosts kein Klartext einer Anfrage vor.
import { promises as fs } from 'fs';
import path from 'path';

import * as openpgp from 'openpgp';

// Der öffentliche Schlüssel ist kein Geheimnis (liegt ohnehin unter /pgp-key.asc).
// Eine Wahrheitsquelle: dieselbe Datei zur Laufzeit lesen (im Container /app/public),
// nicht dupliziert einbetten. Lazy + gecacht, damit ein Lesefehler nicht den Modul-Load
// killt und beim nächsten Aufruf neu versucht werden kann.
let cachedKey: Promise<openpgp.Key> | null = null;

function loadPublicKey(): Promise<openpgp.Key> {
  if (!cachedKey) {
    cachedKey = (async () => {
      const armoredKey = await fs.readFile(
        path.join(process.cwd(), 'public', 'pgp-key.asc'),
        'utf8',
      );
      return openpgp.readKey({ armoredKey });
    })().catch((err) => {
      cachedKey = null; // beim nächsten Aufruf erneut versuchen
      throw err;
    });
  }
  return cachedKey;
}

/**
 * Verschlüsselt Klartext an den Betreiber. Gibt bei Fehler `null` zurück, damit der
 * Aufrufer bewusst entscheidet (niemals stillschweigend Klartext ausliefern statt
 * verschlüsseltem Inhalt). Ausgabe ist ASCII-Armor (`-----BEGIN PGP MESSAGE-----`).
 */
export async function encryptToOwner(plaintext: string): Promise<string | null> {
  try {
    const encryptionKeys = await loadPublicKey();
    const message = await openpgp.createMessage({ text: plaintext });
    const armored = await openpgp.encrypt({ message, encryptionKeys });
    return typeof armored === 'string' ? armored : null;
  } catch (err) {
    console.error('[pgp] encryptToOwner failed', err);
    return null;
  }
}
