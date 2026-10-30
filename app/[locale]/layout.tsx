import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { schriftKlassen } from '../fonts/schriften';

import { getZiel } from '@/lib/cv';
import { istBewerbung } from '@/lib/modus';
import { getAbout, PROJECTS, localizedProject } from '@/lib/projects';
import { SITE_URL, SOCIAL_LINKS } from '@/lib/site';
import { LOCALES, asLocale, isLocale, type Locale } from '@/lib/i18n/config';
import { CommandPalette } from '../components/CommandPalette';
import { JsonLd } from '../components/JsonLd';
import { SkipLink } from '../components/SkipLink';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const SITE_META: Record<Locale, { title: string; description: string }> = {
  de: {
    title: 'Sami Djouhri, Infrastruktur & selbst betriebene Systeme',
    description:
      'Infrastruktur, Systeme und Automatisierung aus dem Raum Düsseldorf. Eigene Productivity-Suiten und ein Homelab-Cluster, selbst aufgebaut und selbst betrieben.',
  },
  en: {
    title: 'Sami Djouhri, self-owned systems & infrastructure',
    description:
      'Infrastructure, systems and automation from the Düsseldorf area, Germany. Productivity suites, a homelab cluster, AI bots, set up, hardened and run myself.',
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
    // `types` mit dem RSS-Auto-Discover ist am 2026-10-15 entfallen, zusammen
    // mit der Route `app/feed.xml` und dem Verweis in der Fußzeile. Ein
    // Auto-Discover-Eintrag auf eine 404 ist schlimmer als keiner: Feed-Leser
    // melden ihn als Defekt der Seite, nicht als fehlendes Angebot.
    alternates: {
      canonical: `/${locale}`,
      languages: { de: '/de', en: '/en', 'x-default': '/de' },
    },
    // Bewusst OHNE `title` und `url`: `openGraph` wird zwischen Segmenten NICHT
    // gemischt, sondern vom letzten Segment ersetzt (Next-Doku „Merging“). Standen
    // Titel und URL der Startseite hier, trugen alle Unterseiten ohne eigenes
    // `openGraph` (Kontakt, Projekte, Notizen, Über, Impressum, Datenschutz) beim
    // Teilen Titel und Adresse der Startseite. Ohne die beiden Felder leitet Next
    // sie je Seite aus deren `title` und `alternates.canonical` ab.
    openGraph: {
      description: meta.description,
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
  // Nur bestätigte Profile ins sameAs, „pending“-Einträge (ohne href) fließen
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
    image: `${SITE_URL}/${locale}/og.png`,
    // Bewusst OHNE addressLocality: strukturierte Daten werden maschinell geerntet und
    // wandern in Personen-Datenbanken. Region und Land genuegen fuer regionale Suche,
    // der Ort selbst gehoert nicht in ein maschinenlesbares Feld.
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Nordrhein-Westfalen',
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
    // Das eigentliche Ziel der Seite, maschinenlesbar. Bis 2026-08-27 stand die
    // gesuchte Position ausschliesslich als Fliesstext auf /cv: Recruiter-Werkzeuge
    // und Suchmaschinen lesen aber zuerst die strukturierten Felder. Wer nicht bis
    // Seite sechs klickt, erfuhr nicht, dass hier jemand Arbeit sucht.
    // Quelle ist lib/cv.ts, damit die Angabe nicht neben /cv und dem PDF driftet.
    //
    // Seit dem 2026-10-25 am Modus (lib/modus.ts). Im Schaufenstermodus
    // faellt das Feld WEG, statt leer zu stehen: `seeks` ist eine Nachfrage, und
    // eine leere Nachfrage ist keine Angabe, sondern eine kaputte. Das ist
    // zugleich die wichtigste der Recruiter-Hilfen, die das Schaufenster
    // ablegt, denn sie wirkt ohne dass ein Mensch die Seite liest.
    ...(istBewerbung
      ? {
          seeks: {
            '@type': 'Demand',
            name: getZiel(locale).satz,
            areaServed: { '@type': 'AdministrativeArea', name: 'Nordrhein-Westfalen, Deutschland' },
          },
        }
      : {}),
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
    <html lang={locale} className={`dark ${schriftKlassen}`}>
      <head>
        {/* js-ready synchron VOR First Paint. Traegt nur noch `.nur-mit-js`
            (TerminalShell): ein Block, der ohne JavaScript gar nicht erst
            erscheinen soll, statt als totes Eingabefeld dazustehen.

            Der frueher hier haengende Reveal-Teil ist am 2026-10-02 entfallen
            (`window.__revealReady` plus ein 4-Sekunden-Watchdog, der bei
            ausbleibender Hydration `html.reveal-fallback` setzte). Das
            Scroll-Reveal laeuft jetzt ohne JavaScript, also gibt es weder eine
            Hydration, auf die zu warten waere, noch ein Zeitfenster, in dem
            Inhalt unsichtbar bleiben koennte. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js-ready')",
          }}
        />
      </head>
      <body>
        {/* Cloudflares Email-Obfuscation (Scrape Shield) ersetzt sonst JEDEN mailto-Link
            durch /cdn-cgi/l/email-protection#…, das ist ohne JavaScript ein toter 404,
            und der sichtbare Text wird zu „[email protected]“. Auf einer Bewerbungs-
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
              keywords: `${tx.title} ${p.title} ${tx.tagline} ${p.stack.join(' ')} ${p.domain} ${tx.description}`,
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
