import type { Metadata } from 'next';
import Link from 'next/link';
import { schriftKlassen } from '../fonts/schriften';

import { assertLanOrNotFound } from '@/lib/lan';
import { Prompt } from '../components/Terminal';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Admin',
  // /admin ist LAN-only und darf NIE indexiert werden.
  robots: { index: false, follow: false, nocache: true },
};

// Layout liest Header → ganzer /admin-Baum ist dynamisch + LAN-gegated.
export const dynamic = 'force-dynamic';

// Eine Fläche seit dem 2026-10-26 (Projekte und Medien sind mit dem
// CMS-Speicher abgeräumt). Die Leiste bleibt, weil sie den Rückweg zur
// öffentlichen Seite trägt und das LAN-only-Zeichen zeigt.
const ADMIN_NAV = [{ href: '/admin/posteingang', label: 'Posteingang' }];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-Depth: aus dem öffentlichen Netz existiert /admin nicht.
  await assertLanOrNotFound();
  return (
    <html lang="de" className={`dark ${schriftKlassen}`}>
      <body className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 sm:px-8">
          <Link href="/admin" className="rounded-sm">
            <Prompt path="~/admin" className="text-[0.78rem]" />
          </Link>
          <span className="inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-widest text-term">
            <span className="status-dot status-dot--live" aria-hidden />
            LAN-only
          </span>
          <nav
            aria-label="Admin-Navigation"
            className="ml-auto flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs uppercase tracking-widest text-muted"
          >
            {ADMIN_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-accent">
                {item.label}
              </Link>
            ))}
            <Link href="/" className="text-muted-dim transition-colors hover:text-text">
              ↗ Seite
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8">{children}</main>
      </body>
    </html>
  );
}
