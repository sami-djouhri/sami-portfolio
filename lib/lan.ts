import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

/**
 * LAN-Gate fürs Eigen-CMS (Node-Runtime statt Edge-Middleware, letztere läuft in
 * einer Sandbox, die in manchen Umgebungen `eval` verbietet und dann jeden Request
 * killt). Öffentliche Requests kommen über den Cloudflare-Tunnel und tragen cf-Header;
 * LAN/WireGuard-Requests (direkt an den Container) tragen sie nicht.
 *
 * Primäre Sperre bleibt der cloudflared-Ingress (404 auf /admin*); das hier ist die
 * zweite, app-eigene Verteidigungslinie.
 */
export async function isPublicRequest(): Promise<boolean> {
  const h = await headers();
  return (
    Boolean(h.get('cf-connecting-ip')) ||
    Boolean(h.get('cf-ray')) ||
    (h.get('cdn-loop') || '').toLowerCase().includes('cloudflare') ||
    Boolean(h.get('cf-worker'))
  );
}

/** Für Server-Components/Pages: 404, wenn der Request nicht aus dem eigenen Netz kommt. */
export async function assertLanOrNotFound(): Promise<void> {
  if (await isPublicRequest()) notFound();
}
