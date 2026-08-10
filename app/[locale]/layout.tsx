import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IBM_Plex_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google';

import { getAbout, PROJECTS, localizedProject } from '@/lib/projects';
import { SITE_URL, SOCIAL_LINKS } from '@/lib/site';
import { LOCALES, asLocale, isLocale, type Locale } from '@/lib/i18n/config';
import { CommandPalette } from '../components/CommandPalette';
import { JsonLd } from '../components/JsonLd';
import { SkipLink } from '../components/SkipLink';

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});

// Body-Schrift: IBM Plex Sans, self-hosted via next/font (kein Google-CDN, DSGVO-still).
// Ersetzt System-Sans → identisches Rendering auf jedem Gerät, ruhig-technischer Ton,
// der zu Mono (Struktur) und Instrument Serif (menschliche Momente) passt.
const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-sans',
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const SITE_META: Record<Locale, { title: string; description: string }> = {
  de: {
    title: 'Sami Djouhri, Eigen-Systeme & Infrastruktur',
    description:
      'Infrastruktur, Systeme und Automatisierung aus Heiligenhaus. Productivity-Suiten, Homelab-Cluster, AI-Bots, selbst gebaut, gehärtet und betrieben.',
  },
  en: {
    title: 'Sami Djouhri, self-owned systems & infrastructure',
    description:
      'Infrastructure, systems and automation from Heiligenhaus, Germany. Productivity suites, a homelab cluster, AI bots, self-built, hardened and self-run.',
  },
};

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const about = getAbout(locale);
  const meta = SITE_META[locale];
  return {
    title: { default: meta.title, template: `%s · ${about.name}` },
    description: meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { de: '/de', en: '/en', 'x-default': '/de' },
      types: {
        'application/rss+xml': [
          {
            url: locale === 'en' ? '/feed.xml?lang=en' : '/feed.xml',
            title: `${about.name}, ${locale === 'en' ? 'updates' : 'Updates'}`,
          },
        ],
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}/${locale}`,
      siteName: about.name,
      locale: locale === 'en' ? 'en_US' : 'de_DE',
      alternateLocale: locale === 'en' ? 'de_DE' : 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
  };
}

const GREETING: Record<Locale, string> = {
  de: `
  ╭─────────────────────────────────────────────╮
  │  Quelltext-Ansicht, willkommen.             │
  │  Eigen-Stack: Next.js 16 · Tailwind ·       │
  │  next/font · DSGVO-stille Build-Pipeline.   │
  │  Code-Fragen? mailto:sami@djouhri.de        │
  ╰─────────────────────────────────────────────╯
`,
  en: `
  ╭─────────────────────────────────────────────╮
  │  Source view, welcome.                      │
  │  Own stack: Next.js 16 · Tailwind ·         │
  │  next/font · GDPR-quiet build pipeline.     │
  │  Code questions? mailto:sami@djouhri.de     │
  ╰─────────────────────────────────────────────╯
`,
};

export default async function LocaleLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const about = getAbout(locale);

  // Eine kanonische Person-Entität (@id), auf die WebSite und die ProfilePage
  // (uber-mich) verweisen, ein zusammenhängender Knowledge-Graph statt drei
  // lose Person-Kopien. Bild = stabiler generateImageMetadata-Pfad (…/main).
  const personId = `${SITE_URL}/#person`;
  // Nur bestätigte Profile ins sameAs — „pending"-Einträge (ohne href) fließen
  // nicht in den Knowledge-Graph, sonst stünde dort `undefined`.
  const socials = SOCIAL_LINKS.map((s) => s.href).filter(
    (h): h is string => Boolean(h),
  );
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId,
    name: about.name,
    url: SITE_URL,
    email: `mailto:${about.contact.email}`,
    jobTitle: about.role,
    description: about.bio,
    image: `${SITE_URL}/${locale}/opengraph-image/main`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Heiligenhaus',
      addressRegion: 'NRW',
      addressCountry: 'DE',
    },
    knowsAbout: [
      'Homelab Infrastructure',
      'Docker',
      'Self-Hosting',
      'Linux',
      'Networking',
      'FastAPI',
      'Next.js',
      'SvelteKit',
      'RAG / LLM Tooling',
      'IT Security / Hardening',
    ],
    ...(socials.length ? { sameAs: socials } : {}),
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/${locale}`,
    name: about.name,
    inLanguage: locale,
    publisher: { '@id': personId },
    author: { '@id': personId },
  };

  return (
    <html lang={locale} className={`dark ${serif.variable} ${mono.variable} ${sans.variable}`}>
      <head>
        {/* js-ready synchron VOR First Paint (siehe Reveal-Layer). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js-ready');window.__revealReady=false;window.addEventListener('load',function(){setTimeout(function(){if(!window.__revealReady)document.documentElement.classList.add('reveal-fallback')},4000)})",
          }}
        />
      </head>
      <body>
        {/* Cloudflares Email-Obfuscation (Scrape Shield) ersetzt sonst JEDEN mailto-Link
            durch /cdn-cgi/l/email-protection#… — das ist ohne JavaScript ein toter 404,
            und der sichtbare Text wird zu „[email protected]". Auf einer Bewerbungs-
            seite ist ein nicht erreichbarer Kontaktweg der teuerste denkbare Defekt.
            email_off/email_on nimmt das Dokument davon aus und wirkt unabhängig davon,
            wie der Zonen-Schalter im Cloudflare-Dashboard gerade steht. Nicht entfernen,
            ohne vorher `curl -s https://djouhri.de/de/kontakt | grep email-protection`
            zu prüfen. */}
        <div dangerouslySetInnerHTML={{ __html: '<!--email_off-->' }} />
        <SkipLink locale={locale} />
        {children}
        <CommandPalette
          locale={locale}
          projects={PROJECTS.map((p) => {
            const tx = localizedProject(p, locale);
            return {
              id: p.id,
              title: tx.title,
              // Volltext-Index: Titel + Tagline + Stack + Domäne + Beschreibung,
              // damit ⌘K z.B. "FastAPI" oder "Homelab" auf alle passenden Projekte findet.
              keywords: `${tx.title} ${tx.tagline} ${p.stack.join(' ')} ${p.domain} ${tx.description}`,
            };
          })}
          email={about.contact.email}
        />
        <JsonLd data={personSchema} />
        <JsonLd data={websiteSchema} />
        <div dangerouslySetInnerHTML={{ __html: `<!--${GREETING[locale]}-->` }} />
        <div dangerouslySetInnerHTML={{ __html: '<!--email_on-->' }} />
      </body>
    </html>
  );
}
