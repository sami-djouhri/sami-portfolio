'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { isPublicRequest } from '@/lib/lan';
import type { Domain, Project, ProjectStatus } from '@/lib/projects';
import {
  deleteMedia,
  deleteMessage,
  deleteProject,
  getProject,
  getProjects,
  reorderProjects,
  saveMedia,
  saveProject,
  setMessageStatus,
  type MessageStatus,
} from '@/lib/store';
import { DOMAINS, STATUSES, type FormState } from './form-state';

/**
 * Revalidiert die öffentliche Seite nach einer Inhalts-Änderung. `revalidatePath('/',
 * 'layout')` purged alle Routen unter dem Root-Layout — also Landing, /projekte,
 * /projekte/[id], /stack, /stats, /leistungen, Sitemap und Feed in einem Rutsch.
 * Für ein Single-Admin-CMS ist das die robusteste Wahl: keine Seite fällt durchs Raster.
 */
function revalidatePublic(): void {
  revalidatePath('/', 'layout');
  // Route-Handler (sitemap/feed) hängen nicht am Root-Layout → explizit purgen,
  // damit auch sie CMS-Änderungen sofort statt erst nach revalidate-Ablauf zeigen.
  revalidatePath('/sitemap.xml');
  revalidatePath('/feed.xml');
}

function revalidateAdmin(): void {
  revalidatePath('/admin', 'layout');
}

// ── Hilfen ────────────────────────────────────────────────────────────────
function str(formData: FormData, key: string, max = 2000): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

/**
 * Zerlegt ein Textarea-Feld (eine Zeile pro Eintrag, Kommas erlaubt) in eine
 * deduplizierte Liste — doppelte Stack-/Includes-Einträge würden sonst doppelte
 * React-keys erzeugen und Stack-Statistiken verfälschen.
 */
function lines(formData: FormData, key: string): string[] {
  const raw = formData.get(key);
  if (typeof raw !== 'string') return [];
  return [
    ...new Set(
      raw
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
}

const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ── Posteingang (bestehend) ─────────────────────────────────────────────────
const MESSAGE_STATES: MessageStatus[] = ['neu', 'gelesen', 'erledigt'];

export async function markMessageAction(formData: FormData): Promise<void> {
  if (await isPublicRequest()) return; // LAN-only: kein Schreibzugriff aus dem Internet.
  const id = str(formData, 'id', 100);
  const status = str(formData, 'status', 20) as MessageStatus;
  if (!id || !MESSAGE_STATES.includes(status)) return;
  await setMessageStatus(id, status);
  revalidatePath('/admin/posteingang');
  revalidatePath('/admin');
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  if (await isPublicRequest()) return; // LAN-only.
  const id = str(formData, 'id', 100);
  if (!id) return;
  await deleteMessage(id);
  revalidatePath('/admin/posteingang');
  revalidatePath('/admin');
}

// ── Projekte ────────────────────────────────────────────────────────────────
export async function saveProjectAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (await isPublicRequest()) return { error: 'Nicht erlaubt.' };

  const mode = str(formData, 'mode', 10); // 'neu' | 'edit'
  const id = str(formData, 'id', 80).toLowerCase();
  const title = str(formData, 'title', 120);
  const tagline = str(formData, 'tagline', 300);
  const description = str(formData, 'description', 4000);
  const role = str(formData, 'role', 200);
  const year = str(formData, 'year', 60);
  const highlight = str(formData, 'highlight', 300);
  const taglineEn = str(formData, 'taglineEn', 300);
  const descriptionEn = str(formData, 'descriptionEn', 4000);
  const roleEn = str(formData, 'roleEn', 200);
  const highlightEn = str(formData, 'highlightEn', 300);
  const href = str(formData, 'href', 300);
  const domain = str(formData, 'domain', 20) as Domain;
  const status = str(formData, 'status', 20) as ProjectStatus;
  const stack = lines(formData, 'stack');

  if (!id || !ID_RE.test(id)) {
    return { error: 'ID fehlt oder ungültig (nur a–z, 0–9, Bindestriche).' };
  }
  if (!title || !tagline || !description || !role || !year || !highlight) {
    return { error: 'Titel, Tagline, Beschreibung, Rolle, Zeitraum und Kennzahl sind Pflicht.' };
  }
  if (!DOMAINS.includes(domain)) return { error: 'Ungültige Domäne.' };
  if (!STATUSES.includes(status)) return { error: 'Ungültiger Status.' };
  if (stack.length === 0) return { error: 'Mindestens ein Stack-Eintrag nötig.' };
  if (href && !/^https?:\/\//.test(href)) {
    return { error: 'Link muss mit http(s):// beginnen.' };
  }

  const existing = await getProject(id);
  if (mode === 'neu' && existing) {
    return { error: `ID „${id}" ist bereits vergeben.` };
  }

  // Beim Bearbeiten Felder erhalten, die das Formular nicht kennt (z. B. inline-`detail`).
  const project: Project = {
    ...(existing ?? {}),
    id,
    title,
    tagline,
    description,
    role,
    year,
    highlight,
    stack,
    domain,
    status,
    ...(href ? { href } : { href: undefined }),
    taglineEn: taglineEn || undefined,
    descriptionEn: descriptionEn || undefined,
    roleEn: roleEn || undefined,
    highlightEn: highlightEn || undefined,
  };

  await saveProject(project);
  revalidatePublic();
  revalidateAdmin();
  redirect('/admin/projekte'); // wirft NEXT_REDIRECT (nicht in try/catch kapseln)
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  if (await isPublicRequest()) return;
  const id = str(formData, 'id', 80);
  if (!id) return;
  await deleteProject(id);
  revalidatePublic();
  revalidateAdmin();
}

/** Verschiebt ein Projekt in der Reihenfolge um eine Position (dir: 'up' | 'down'). */
export async function moveProjectAction(formData: FormData): Promise<void> {
  if (await isPublicRequest()) return;
  const id = str(formData, 'id', 80);
  const dir = str(formData, 'dir', 4);
  if (!id || (dir !== 'up' && dir !== 'down')) return;

  const order = (await getProjects()).map((p) => p.id);
  const i = order.indexOf(id);
  if (i < 0) return;
  const j = dir === 'up' ? i - 1 : i + 1;
  if (j < 0 || j >= order.length) return;
  // Swap der beiden Nachbarn — durch die Guards oben sind beide Indizes gültig.
  const tmp = order[i]!;
  order[i] = order[j]!;
  order[j] = tmp;

  await reorderProjects(order);
  revalidatePublic();
  revalidateAdmin();
}

// ── Medien ────────────────────────────────────────────────────────────────────
const MAX_MEDIA_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadMediaAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (await isPublicRequest()) return { error: 'Nicht erlaubt.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Keine Datei gewählt.' };
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return { error: 'Datei zu groß (max. 5 MB).' };
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    await saveMedia(file.name, bytes); // wirft bei nicht erlaubtem Typ (kein SVG)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Upload fehlgeschlagen.' };
  }

  revalidatePath('/admin/medien');
  revalidateAdmin();
  redirect('/admin/medien');
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  if (await isPublicRequest()) return;
  const name = str(formData, 'name', 200);
  if (!name) return;
  await deleteMedia(name);
  revalidatePath('/admin/medien');
  revalidateAdmin();
}
