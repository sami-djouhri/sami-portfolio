'use server';

import { revalidatePath } from 'next/cache';

import { isPublicRequest } from '@/lib/lan';
import { setMessageStatus, deleteMessage, type MessageStatus } from '@/lib/store';

/**
 * Die beiden Aktionen des Posteingangs. Bis zum 2026-10-26 lagen hier auch
 * Projektpflege und Medien-Uploads; beide sind mit dem CMS-Speicher
 * abgeräumt, die Arbeiten stehen jetzt in lib/projects.ts.
 *
 * Damit ist auch `revalidatePublic()` entfallen. Es purgte nach jeder
 * Projektänderung das gesamte Root-Layout samt Sitemap. Eine Nachricht im
 * Posteingang ändert an der öffentlichen Seite nichts, deshalb wird hier
 * nur noch der Verwaltungsteil selbst erneuert.
 */

function str(formData: FormData, key: string, max = 2000): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

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
