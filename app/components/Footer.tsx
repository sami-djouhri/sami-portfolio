import Link from 'next/link';

import { getAbout } from '@/lib/projects';
import { PORTFOLIO_REPO_URL, SOCIAL_LINKS } from '@/lib/site';
import { localePath, type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { Prompt } from './Terminal';

function buildLabel(): string | null {
  const raw = process.env.BUILD_TIME;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

type FooterLink = { href: string; label: string; external?: boolean };

/**
 * Marken-Glyph für einen sozialen Link. Bewusst inline-SVG (kein Icon-Paket,
 * kein Bundle-Zuwachs), `currentColor` erbt die Footer-/Hover-Farbe. Neue
 * Plattform = einen Pfad ergänzen; unbekanntes Label rendert kein Icon (nur
 * Text-Fallback), also nie kaputt. Ready, sobald in lib/site.ts eine echte URL
 * steht (z. B. LinkedIn).
 */
const SOCIAL_ICON_PATHS: Record<string, string> = {
  linkedin:
    'M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.83v2.19h.05c.53-1 1.84-2.19 3.79-2.19 4.05 0 4.8 2.67 4.8 6.14V24h-4v-6.86c0-1.63-.03-3.73-2.27-3.73-2.27 0-2.62 1.78-2.62 3.61V24h-4V8z',
  github:
    'M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.7.83.58C20.57 22.29 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z',
  // Schild = Security/CTF-Praxis (TryHackMe). Bewusst generisch-erkennbar, kein
  // Marken-Logo-Nachbau; passt zum Terminal/Security-Look der Seite.
  tryhackme:
    'M12 1 3 4.8v6.05c0 5.02 3.84 9.7 9 11.15 5.16-1.45 9-6.13 9-11.15V4.8L12 1zm-1.1 14.5-3.6-3.6 1.4-1.4 2.2 2.2 4.6-4.6 1.4 1.4-6 6z',
};

function SocialIcon({ label, size = 13 }: { label: string; size?: number }) {
  const path = SOCIAL_ICON_PATHS[label.toLowerCase()];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden focusable="false">
      <path d={path} />
    </svg>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const about = getAbout(locale);
  const year = new Date().getFullYear();
  const build = buildLabel();

  const navigation: FooterLink[] = [
    { href: localePath(locale, '/projekte'), label: t(locale, 'nav.projekte') },
    { href: localePath(locale, '/uber-mich'), label: t(locale, 'nav.uber') },
    { href: localePath(locale, '/toolbox'), label: t(locale, 'nav.toolbox') },
    { href: localePath(locale, '/jetzt'), label: t(locale, 'nav.jetzt') },
  ];
  const resources: FooterLink[] = [
    { href: localePath(locale, '/cv'), label: t(locale, 'nav.cv') },
    { href: `/cv.pdf?lang=${locale}`, label: `${t(locale, 'nav.cv')} (PDF)`, external: true },
    { href: '/feed.xml', label: 'RSS-Feed', external: true },
    { href: '/.well-known/security.txt', label: 'security.txt', external: true },
    // Die Seite selbst ist offen: derselbe Beweis-Anspruch wie bei den Projekten.
    { href: PORTFOLIO_REPO_URL, label: t(locale, 'footer.quelltext'), external: true },
  ];
  const legal: FooterLink[] = [
    { href: localePath(locale, '/impressum'), label: t(locale, 'footer.impressum') },
    { href: localePath(locale, '/datenschutz'), label: t(locale, 'footer.datenschutz') },
  ];

  return (
    <footer role="contentinfo" className="mx-auto max-w-5xl px-6 pb-12 pt-16 sm:px-8 no-print">
      <div className="rule" />

      <div className="mt-12 grid gap-10 sm:grid-cols-2 md:grid-cols-12">
        <div className="sm:col-span-2 md:col-span-5">
          <Prompt path="~" command="whoami" className="text-xs" />
          <p className="mt-3 font-display text-2xl leading-tight">{about.name}.</p>
          <p className="mt-2 max-w-xs text-sm text-muted">{about.role}</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-dim">
            {about.location} · {year}
            {build ? (
              <>
                {' '}
                · {t(locale, 'footer.build')} {build}
              </>
            ) : null}
          </p>
        </div>

        <FooterCol heading={t(locale, 'footer.navigation')} links={navigation} className="md:col-span-3" />
        <FooterCol heading={t(locale, 'footer.resources')} links={resources} className="md:col-span-2" />
        <FooterCol heading={t(locale, 'footer.legal')} links={legal} className="md:col-span-2" />
      </div>

      {/* Profile als gerahmte Pills (Icon + Label) statt flacher Text-Zeile, 
          klare Klick-Ziele, konsistent mit dem Panel/Terminal-Look. Aktive Links
          heben bei Hover auf Amber; „pending“-Profile bleiben dezent ausgegraut
          und nicht klickbar (kein toter Link auf der Bewerbungsseite). */}
      <div className="mt-12 flex flex-col gap-6 border-t border-border/60 pt-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <p className="label">{t(locale, 'footer.elsewhere')}</p>
          <div className="flex flex-wrap items-center gap-2.5">
            {SOCIAL_LINKS.map((s) =>
              s.href ? (
                <a
                  key={s.label}
                  href={s.href}
                  rel="me noopener"
                  target="_blank"
                  aria-label={`${s.label} (${locale === 'en' ? 'opens in a new tab' : 'öffnet in neuem Tab'})`}
                  className="group inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface/40 px-3 font-mono text-xs text-muted transition-all hover:-translate-y-px hover:border-accent/60 hover:bg-surface-2 hover:text-accent"
                >
                  <SocialIcon label={s.label} size={15} />
                  <span>{s.label}</span>
                  <span aria-hidden className="text-muted-dim transition-colors group-hover:text-accent">↗</span>
                </a>
              ) : (
                <span
                  key={s.label}
                  aria-disabled="true"
                  title={locale === 'en' ? 'link coming soon' : 'Link folgt'}
                  className="inline-flex h-9 cursor-default items-center gap-2 rounded-md border border-border/50 px-3 font-mono text-xs text-muted-dim/70"
                >
                  <span className="opacity-60"><SocialIcon label={s.label} size={15} /></span>
                  <span>{s.label}</span>
                </span>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <a
            href={`mailto:${about.contact.email}`}
            className="font-mono text-sm text-muted link-underline hover:text-accent"
          >
            {about.contact.email}
          </a>
          <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
            {t(locale, 'footer.tagline')}
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  heading,
  links,
  className,
}: {
  heading: string;
  links: FooterLink[];
  className?: string;
}) {
  return (
    <nav aria-label={heading} className={className}>
      <p className="label">{heading}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            {/* Absolute Ziele verlassen die Seite und bekommen deshalb ein echtes
                <a> mit rel/target statt des Router-Links. Interne Sonderrouten
                (/cv.pdf, /feed.xml) sind zwar auch `external: true`, bleiben aber
                same-origin und laufen weiter über Link. */}
            {/^https?:\/\//.test(link.href) ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener"
                className="link-underline text-text/85 hover:text-accent"
              >
                {link.label}
                <span aria-hidden className="ml-1 text-muted-dim">
                  ↗
                </span>
              </a>
            ) : (
              <Link href={link.href} className="link-underline text-text/85 hover:text-accent">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
