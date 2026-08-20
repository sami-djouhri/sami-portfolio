import type { Metadata } from 'next';

import Link from 'next/link';

import { JsonLd } from '@/app/components/JsonLd';
import { asLocale, localeAlternates, localePath, localizedSlugPath } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { ABOUT, getAbout, getPrinciples } from '@/lib/projects';
import { SITE_URL as SITE } from '@/lib/site';
import { Footer } from '../../components/Footer';
import { Reveal } from '../../components/Reveal';
import { ScanReveal } from '../../components/ScanReveal';
import { PageHeader, SectionHeader } from '../../components/SectionHeader';
import { ConvergeStrands } from '../../components/graphics/ConvergeStrands';
import { CommandEyebrow, WindowBar } from '../../components/Terminal';
import { TopBar } from '../../components/TopBar';

function buildProfileJsonLd(locale: ReturnType<typeof asLocale>) {
  const about = getAbout(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    inLanguage: locale,
    mainEntity: {
      '@type': 'Person',
      '@id': `${SITE}/#person`,
      name: ABOUT.name,
      description: about.bio,
      jobTitle: about.role,
      url: `${SITE}/${locale}${localizedSlugPath(locale, '/uber-mich')}`,
      image: `${SITE}/${locale}/opengraph-image/main`,
    },
  };
}

// ISR: seit 2026-08-14 werden diese Seiten statisch vorgerendert. Ohne revalidate
// wuerden sie genau einmal zur Build-Zeit gebaut und das Copyright-Jahr im Footer
// (new Date().getFullYear()) bliebe bis zum naechsten Deploy stehen.
export const revalidate = 3600;

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale = asLocale(params.locale);
  return {
    title: t(locale, 'nav.uber'),
    description:
      locale === 'en'
        ? 'Infrastructure, systems and automation from Heiligenhaus, NRW. I build and operate my own suites and a hardened homelab in continuous production, documented and recoverable.'
        : 'Infrastruktur, Systeme und Automation aus Heiligenhaus, NRW. Ich baue und betreibe eigene Suiten und ein gehärtetes Homelab im Dauerbetrieb, dokumentiert und wiederherstellbar.',
    alternates: localeAlternates(locale, '/uber-mich'),
  };
}

export default async function UeberMichPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const en = locale === 'en';
  const about = getAbout(locale);
  const principles = getPrinciples(locale);

  return (
    <div className="relative">
      <TopBar active="/uber-mich" locale={locale} />

      <main id="main" className="mx-auto max-w-3xl px-6 pb-32 pt-12 sm:px-8 sm:pt-16">
        <div className="relative isolate">
          {/* Werdegang-Strang: mehrere Linien konvergieren auf einen Punkt (abstrakt, kein Foto). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-4 -z-10 hidden h-44 text-accent [mask-image:linear-gradient(to_bottom,#000,transparent)] sm:block"
          >
            <ConvergeStrands className="ml-auto h-full w-full max-w-2xl" />
          </div>
          <PageHeader
            eyebrow="cat über-mich.md"
            title={en ? 'Who builds here.' : 'Wer hier baut.'}
            lead={about.tagline}
            command
          />
        </div>

        <div className="prose-editorial drop-cap mt-12">
          <p>
            {en ? (
              <>
                I am {about.shortName}. Grew up in Heiligenhaus, stayed in Heiligenhaus, in commuting
                distance between Düsseldorf and Wuppertal. Close enough to everything that matters,
                and outside the noise. That is roughly how I work too, quietly and in spaces of my own.
              </>
            ) : (
              <>
                Ich bin {about.shortName}. Aufgewachsen in Heiligenhaus, geblieben in Heiligenhaus,
                in Pendel-Distanz zwischen Düsseldorf und Wuppertal.
              </>
            )}
          </p>
          <p>
            {en ? (
              <>
                My day revolves around systems that are mine: a self-run cluster, a growing
                productivity suite, automation that thinks along with me. What looks like a hobby
                from outside is a fair amount of operational discipline on the inside. Hardening
                happens in waves, there is a single source of truth, recovery gets drilled, and all
                of it is written down. Two lessons shaped that discipline. A broken laptop once
                locked me out of my own, freshly hardened network, so the access path itself is now
                part of the backup scope. And the suite was built for a single user at first, and
                retrofitting it for several accounts cost more than any feature before it. New
                services start out multi-user. The technical details stay behind a closed door on
                purpose. Every service here is something I taught myself and then took into
                continuous operation.
              </>
            ) : (
              <>
                Was ich betreibe: einen Verbund aus mehreren kleinen Rechnern und einem
                x86-Virtualisierungs-Cluster mit über 160 Diensten, dazu eine eigene
                Productivity-Suite, ein paar öffentliche Websites und einen Server am Netz-Rand für
                das, was von außen erreichbar sein muss. Dazu gehört der ganze laufende Betrieb:
                Container-Härtung, segmentierte Netze, zentrale Anmeldung, Monitoring und
                verschlüsselte Off-Site-Backups mit geprobtem Restore. Womit ich mich fachlich
                beschäftige: Linux, Netzwerk und Virtualisierung, Container-Sicherheit, dazu lokal
                betriebene Sprachmodelle und Windows Server mit Active Directory im eigenen Lab.
                Wie das intern verkabelt ist, steht nicht auf dieser Seite; das gehört nicht ins
                Netz.
              </>
            )}
          </p>
          <p>
            {en ? (
              <>
                It started small: one Raspberry Pi 5, a few smart plugs and lights from different
                vendors. Every device wanted its own app, and almost all of them phoned home. That
                bothered me. So I set up Home Assistant to get everything into one place, then my
                own DNS filter to cut the phoning home, and one thing led to another until the
                single board had grown into a cluster of servers. If something is load-bearing, I
                want to know how it works and be able to get at it myself. That is why so much here
                is self-built, even where that makes it smaller than a product I could rent.
              </>
            ) : (
              <>
                Angefangen hat das klein: ein Raspberry Pi 5, ein paar smarte Steckdosen und Lampen
                von verschiedenen Herstellern. Jedes Gerät wollte seine eigene App, und fast alles
                telefonierte nach Hause. Das hat mich gestört. Also habe ich Home Assistant
                aufgesetzt, um alles an einem Ort zu haben, dann einen eigenen DNS-Filter gegen das
                Nachhausetelefonieren, und eins führte zum anderen, bis aus der einen Platine ein
                Verbund aus Servern geworden war. Wenn etwas trägt, will ich wissen, wie es
                funktioniert, und im Zweifel selbst rankommen. Das ist der Grund, warum hier so
                vieles selbst gebaut ist, auch wenn es dadurch kleiner ausfällt als ein gemietetes
                Produkt.
              </>
            )}
          </p>
          <p>
            {en ? (
              <>
                The same line runs through the rest: a hardened homelab, productive suites,
                a few e-commerce shops I build and harden, plus AI automation with honest limits.
                The structured, printable résumé lives at{' '}
                <Link
                  href={localePath(locale, '/cv')}
                  className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                >
                  /cv
                </Link>
                . This page is the personal reading of it.
              </>
            ) : (
              <>
                Das zieht sich durch den Rest: ein gehärtetes Homelab, ein paar E-Commerce-Shops,
                die ich baue und betreibe, dazu AI-Automation, die lieber nichts liefert als etwas
                Erfundenes. Der strukturierte, druckbare Lebenslauf liegt unter{' '}
                <Link
                  href={localePath(locale, '/cv')}
                  className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                >
                  /cv
                </Link>
                . Diese Seite hier ist die persönliche Lesart davon.
              </>
            )}
          </p>
        </div>

        <section className="pt-20">
          <SectionHeader
            index="01"
            eyebrow={en ? 'Values' : 'Wertehaltung'}
            title={en ? 'Four principles' : 'Vier Prinzipien'}
          />
          <Reveal as="ol" stagger className="mt-8 divide-y divide-border/60 overflow-hidden rounded-lg border border-border bg-surface/40">
            {principles.map((p, i) => (
              <li key={p.title} className="flex gap-5 p-5 sm:p-6">
                <span className="mt-0.5 font-mono text-sm text-accent/70">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-mono text-base font-medium uppercase tracking-wide text-text">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </section>

        <section className="pt-20">
          <SectionHeader
            index="02"
            eyebrow={en ? 'Context' : 'Kontext'}
            title={en ? 'Profile' : 'Profil'}
          />
          <ScanReveal as="div" className="mt-8 overflow-hidden rounded-lg border border-border bg-surface/40 shadow-panel">
            <WindowBar title="~/profil" />
            <dl className="grid gap-px bg-border sm:grid-cols-2">
              <ProfileRow label={en ? 'Role' : 'Rolle'}>{about.role}</ProfileRow>
              <ProfileRow label={en ? 'Location' : 'Standort'}>{about.location}</ProfileRow>
              <ProfileRow label={en ? 'Language' : 'Sprache'}>
                {en ? 'German · English' : 'Deutsch · Englisch'}
              </ProfileRow>
              <ProfileRow label={en ? 'Mode' : 'Modus'}>
                {en ? 'Remote · LAN-first' : 'Remote · LAN-First'}
              </ProfileRow>
              <ProfileRow label={en ? 'Focus' : 'Fokus'}>
                {en ? 'Linux · infrastructure · operations' : 'Linux · Infrastruktur · Betrieb'}
              </ProfileRow>
              <ProfileRow label={en ? 'Operating' : 'Betrieb'}>
                {en ? 'continuously since 2024' : 'seit 2024 durchgehend'}
              </ProfileRow>
            </dl>
          </ScanReveal>
        </section>

        <section className="pt-20">
          <div className="overflow-hidden rounded-lg border border-border bg-surface/60">
            <WindowBar title={'mail -s "Hallo" sami'} />
            <div className="p-6 sm:p-8">
              <CommandEyebrow>./say-hi.sh</CommandEyebrow>
              <p className="mt-4 font-display text-2xl leading-tight">
                {en ? 'Start with a short email.' : 'Beginnt mit einer kurzen Mail.'}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                {en
                  ? 'A question about one of the projects, feedback, or just hello. A short message is enough and I will get back to you.'
                  : 'Eine Frage zu einem der Projekte, Feedback oder einfach hallo. Kurze Nachricht reicht, ich melde mich zurück.'}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={localePath(locale, '/kontakt')}
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg transition-all hover:bg-accent-bright hover:shadow-glow"
                >
                  {t(locale, 'action.contact')} →
                </Link>
                <Link
                  href={localePath(locale, '/projekte')}
                  className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
                >
                  {t(locale, 'action.viewProjects')} →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
      <JsonLd data={buildProfileJsonLd(locale)} />
    </div>
  );
}

function ProfileRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface/60 p-4 text-sm">
      <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">{label}</dt>
      <dd className="mt-2 text-text/90">{children}</dd>
    </div>
  );
}
