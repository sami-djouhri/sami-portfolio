// Server-only: nutzt fs/crypto — ein versehentlicher Client-Import scheitert daher
// ohnehin beim Bundling. (Kein 'server-only'-Paket, um keine Dependency aufzunehmen.)
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

import { PROJECTS, type Project } from './projects';

/**
 * Persistenz-Schicht des Eigen-CMS: ein schlichter, atomar schreibender JSON-Store
 * im beschreibbaren Volume (Container-Root ist read_only). Bewusst kein native-DB-
 * Dependency (better-sqlite3 würde auf node:20-alpine/ARM Kompilier-Aufwand kosten);
 * für ein Single-Admin-Portfolio ist JSON robust und ausreichend.
 *
 * Die statische TS-Quelle lib/projects.ts ist der SEED: beim
 * ersten Lesen wird die Datei daraus erzeugt. Danach ist der Store die Quelle der
 * Wahrheit, gepflegt über /admin.
 *
 * DATA_DIR: im Container `/data` (Volume), lokal `./.data` (gitignored).
 */
const DATA_DIR =
  process.env.PORTFOLIO_DATA_DIR || path.join(process.cwd(), '.data');
const MEDIA_DIR = path.join(DATA_DIR, 'media');

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson<T>(name: string, seed: T): Promise<T> {
  const file = path.join(DATA_DIR, name);
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') {
      // Datei fehlt → aus dem Seed anlegen (idempotent).
      await writeJson(name, seed);
      return seed;
    }
    // Datei existiert, ist aber unlesbar/korrupt (z. B. JSON-Parse-Fehler): NICHT
    // mit dem Seed überschreiben — das wäre stiller Totalverlust der CMS-Daten.
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
  const file = path.join(DATA_DIR, name);
  // Eindeutiger Temp-Name PRO Schreibvorgang (nicht nur PID) — sonst kollidieren
  // gleichzeitige Writes derselben Datei im selben Prozess und ein rename schlägt fehl.
  const tmp = `${file}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file); // möglichst atomarer Swap
}

// ── Projekte ──────────────────────────────────────────────────────────────
export async function getProjects(): Promise<Project[]> {
  return readJson<Project[]>('projects.json', PROJECTS);
}

export async function getProject(id: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => p.id === id);
}

export async function saveProject(project: Project): Promise<void> {
  await mutateJson<Project[]>('projects.json', PROJECTS, (all) => {
    const idx = all.findIndex((p) => p.id === project.id);
    if (idx >= 0) all[idx] = project;
    else all.push(project);
    return all;
  });
}

export async function deleteProject(id: string): Promise<void> {
  await mutateJson<Project[]>('projects.json', PROJECTS, (all) =>
    all.filter((p) => p.id !== id),
  );
}

export async function reorderProjects(orderedIds: string[]): Promise<void> {
  await mutateJson<Project[]>('projects.json', PROJECTS, (all) => {
    const byId = new Map(all.map((p) => [p.id, p]));
    const next: Project[] = [];
    for (const id of orderedIds) {
      const p = byId.get(id);
      if (p) {
        next.push(p);
        byId.delete(id);
      }
    }
    // Nicht genannte hinten anhängen (kein Datenverlust).
    next.push(...byId.values());
    return next;
  });
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
   * dann leer — entschlüsselt wird nur im LAN-Admin (Private Key nie am Server).
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

// ── Medien ──────────────────────────────────────────────────────────────────
// Bewusst NUR Raster-Formate — kein SVG (kann beim direkten Aufruf Skripte
// ausführen → XSS). Logos bitte als PNG/WebP hochladen.
const ALLOWED_MEDIA = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif']);

/** Speichert einen Upload und gibt die öffentliche URL (/api/media/<id>) zurück. */
export async function saveMedia(
  originalName: string,
  bytes: Buffer,
): Promise<{ id: string; url: string }> {
  const ext = (originalName.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_MEDIA.has(ext)) {
    throw new Error(`Dateityp .${ext} nicht erlaubt`);
  }
  await ensureDir(MEDIA_DIR);
  const id = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(MEDIA_DIR, id), bytes);
  return { id, url: `/api/media/${id}` };
}

/** Liest eine Mediendatei sicher aus dem Media-Verzeichnis (kein Path-Traversal). */
export async function readMedia(
  name: string,
): Promise<{ bytes: Buffer; ext: string } | null> {
  const safe = path.basename(name); // verhindert ../-Traversal
  if (safe !== name) return null;
  const ext = (safe.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_MEDIA.has(ext)) return null;
  try {
    const bytes = await fs.readFile(path.join(MEDIA_DIR, safe));
    return { bytes, ext };
  } catch {
    return null;
  }
}

export async function listMedia(): Promise<string[]> {
  try {
    const files = await fs.readdir(MEDIA_DIR);
    return files.filter((f) => ALLOWED_MEDIA.has((f.split('.').pop() || '').toLowerCase()));
  } catch {
    return [];
  }
}

export async function deleteMedia(name: string): Promise<void> {
  const safe = path.basename(name);
  if (safe !== name) return;
  try {
    await fs.unlink(path.join(MEDIA_DIR, safe));
  } catch {
    /* schon weg */
  }
}
