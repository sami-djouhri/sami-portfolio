// Server-only: nutzt fs/crypto, ein versehentlicher Client-Import scheitert daher
// ohnehin beim Bundling. (Kein 'server-only'-Paket, um keine Dependency aufzunehmen.)
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Ablage des Posteingangs: ein schlichter, atomar schreibender JSON-Speicher
 * im beschreibbaren Volume (Container-Root ist read_only). Bewusst kein
 * native-DB-Dependency (better-sqlite3 wuerde auf node:20-alpine/ARM
 * Kompilier-Aufwand kosten); fuer eine Handvoll Kontaktanfragen ist JSON
 * robust und ausreichend.
 *
 * Seit dem 2026-10-26 liegen hier NUR noch Kontaktnachrichten. Davor war
 * diese Datei auch die Ablage der Arbeiten und der hochgeladenen Bilder, und
 * damit eine zweite Wahrheit neben lib/projects.ts: der Speicher seedete nur
 * bei fehlender Datei, eine Aenderung an der Quelldatei erreichte ein bereits
 * befuelltes Volume also NIE, und zwar lautlos. Build gruen, Deploy gruen,
 * Seite alt. Zweimal passiert, zuletzt standen zehnmal die alte und dreimal
 * die neue Dienstzahl auf derselben Seite. Die öffentlichen Seiten lesen
 * jetzt lib/projects.ts direkt.
 *
 * Nachrichten sind der eine Fall, der hier richtig liegt, und das ist keine
 * Ausnahme von der Regel, sondern ihre Begruendung: sie entstehen zur
 * Laufzeit auf dem Wirt. Es gibt keine Quelldatei, aus der sie kommen
 * könnten. Alles andere kam aus dem Quelltext.
 *
 * DATA_DIR: im Container `/data` (Volume), lokal `./.data` (gitignored).
 *
 * Die `turbopackIgnore`-Kommentare an den Pfaden unten sind Pflicht (seit
 * 2026-10-30). Ohne sie haelt Turbopack den dynamischen Pfad fuer einen Zugriff
 * irgendwo ins Projekt und legt den GANZEN Baum in `.next/standalone`: `app/`,
 * `lib/`, `scripts/`, dazu die Doku. Die `.dockerignore` hielt nur die Doku
 * zurueck, der Quelltext lag damit im Image auf dem oeffentlichen Wirt. Gefunden
 * beim Umbau auf statische Auslieferung, deren Ziel genau „kein Quelltext auf dem
 * Wirt" ist. Pruefen: `ls .next/standalone` nach `BAU=dienst npx next build`.
 */
const DATA_DIR =
  process.env.PORTFOLIO_DATA_DIR || path.join(process.cwd(), '.data');

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson<T>(name: string, seed: T): Promise<T> {
  const file = path.join(/*turbopackIgnore: true*/ DATA_DIR, name);
  try {
    const raw = await fs.readFile(/*turbopackIgnore: true*/ file, 'utf8');
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') {
      // Datei fehlt → leer anlegen (idempotent).
      await writeJson(name, seed);
      return seed;
    }
    // Datei existiert, ist aber unlesbar/korrupt (z. B. JSON-Parse-Fehler): NICHT
    // mit dem Seed überschreiben, das wäre stiller Totalverlust der Nachrichten.
    // Fehler sichtbar machen, damit man die Datei retten kann.
    throw err;
  }
}

// Serialisiert Read-Modify-Write-Zyklen pro Datei: zwei gleichzeitige Mutationen
// (z. B. zwei Kontaktanfragen im selben Moment) lesen sonst denselben Stand und
// der spätere Write verwirft die frühere Änderung (last-write-wins-Verlust).
const fileLocks = new Map<string, Promise<unknown>>();

function withLock<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const prev = fileLocks.get(name) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  fileLocks.set(name, next.catch(() => undefined));
  return next;
}

async function mutateJson<T>(
  name: string,
  seed: T,
  mutate: (current: T) => T | Promise<T>,
): Promise<T> {
  return withLock(name, async () => {
    const current = await readJson<T>(name, seed);
    const next = await mutate(current);
    await writeJson(name, next);
    return next;
  });
}

async function writeJson<T>(name: string, data: T): Promise<void> {
  await ensureDir(DATA_DIR);
  const file = path.join(/*turbopackIgnore: true*/ DATA_DIR, name);
  // Eindeutiger Temp-Name PRO Schreibvorgang (nicht nur PID), sonst kollidieren
  // gleichzeitige Writes derselben Datei im selben Prozess und ein rename schlägt fehl.
  const tmp = `${file}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file); // möglichst atomarer Swap
}

// ── Kontaktnachrichten (Posteingang) ───────────────────────────────────────
export type MessageStatus = 'neu' | 'gelesen' | 'erledigt';

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  /**
   * Gesetzt bei PGP-verschlüsselten Anfragen: ASCII-Armor mit dem GESAMTEN
   * Anfrageinhalt (Name/E-Mail/Betreff/Nachricht). Die Klartextfelder oben sind
   * dann leer, entschlüsselt wird nur im LAN-Admin (Private Key nie am Server).
   * Fehlt das Feld, ist die Nachricht eine Klartext-Altnachricht.
   */
  encrypted?: string;
  /** Anonymisierter IP-Hash (kein Klartext, DSGVO). */
  ip_hash: string;
  received_at: string;
  status: MessageStatus;
}

export async function getMessages(): Promise<Message[]> {
  const all = await readJson<Message[]>('messages.json', []);
  // Neueste zuerst.
  return [...all].sort((a, b) => b.received_at.localeCompare(a.received_at));
}

export async function addMessage(
  input: Omit<Message, 'id' | 'status'>,
): Promise<Message> {
  const msg: Message = { ...input, id: randomUUID(), status: 'neu' };
  await mutateJson<Message[]>('messages.json', [], (all) => {
    all.push(msg);
    return all;
  });
  return msg;
}

export async function setMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<void> {
  await mutateJson<Message[]>('messages.json', [], (all) => {
    const m = all.find((x) => x.id === id);
    if (m) m.status = status;
    return all;
  });
}

export async function deleteMessage(id: string): Promise<void> {
  await mutateJson<Message[]>('messages.json', [], (all) =>
    all.filter((x) => x.id !== id),
  );
}

export async function unreadMessageCount(): Promise<number> {
  return (await getMessages()).filter((m) => m.status === 'neu').length;
}
