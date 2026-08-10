import type { Metadata } from 'next';

import Link from 'next/link';

import { JsonLd } from '@/app/components/JsonLd';
import { asLocale, localeAlternates, localePath } from '@/lib/i18n/config';
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
      url: `${SITE}/${locale}/uber-mich`,
      image: `${SITE}/${locale}/opengraph-image/main`,
    },
  };
}

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
                distance between Düsseldorf and Wuppertal, close enough to everything that matters,
                yet outside the noise. That fits how I work: quiet, documented, in spaces of my own.
              </>
            ) : (
              <>
                Ich bin {about.shortName}. Aufgewachsen in Heiligenhaus, geblieben in Heiligenhaus,
                in Pendel-Distanz zwischen Düsseldorf und Wuppertal, nah genug an allem Relevanten und
                doch außerhalb des Lärms. Das passt zu der Art, wie ich arbeite: ruhig, dokumentiert,
                in eigenen Räumen.
              </>
            )}
          </p>
          <p>
            {en ? (
              <>
                My day revolves around systems that are mine: a self-run cluster, a growing
                productivity suite, automation that thinks along with me. What may look like a hobby
                from the outside is operational discipline on the inside: hardening in waves, a
                single source of truth, recovery drills, all written down. The details stay behind a
                closed door on purpose; the discipline does not. It started as a learning lab and
                grew over years: every service here is something I taught myself and then took into
                continuous operation.
              </>
            ) : (
              <>
                Mein Tag dreht sich um Systeme, die mir gehören: ein selbst betriebener Cluster, eine
                wachsende Productivity-Suite, Automation, die für mich mitdenkt. Was außen wie Hobby
                aussehen mag, ist innen Betriebsdisziplin, Härtung in Wellen, eine Quelle der Wahrheit,
                Wiederanlauf-Drills, alles aufgeschrieben. Die Details bleiben bewusst hinter
                verschlossener Tür, die Disziplin nicht. Angefangen hat das als Lernlabor und ist
                über Jahre gewachsen: Jeder Dienst hier ist etwas, das ich mir selbst beigebracht und
                dann in den Dauerbetrieb überführt habe.
              </>
            )}
          </p>
          <p>
            {en ? (
              <>
                I learned early that third-party software makes me nervous the moment it becomes
                important. Hence the line that runs through everything: rather build something smaller
                that I understand and can operate than rent a huge product that drifts over time or
                dictates the price. Ownership over rental dependency: a stance that shapes every
                architecture decision I make.
              </>
            ) : (
              <>
                Ich habe früh gemerkt, dass mich Fremdsoftware nervös macht, sobald sie wichtig wird.
                Daher die Linie, die sich durch alles zieht: lieber etwas Kleineres bauen, das ich
                verstehe und betreiben kann, als ein riesiges Produkt mieten, das mit der Zeit driftet
                oder den Preis diktiert. Eigentum statt Mietabhängigkeit: eine Haltung, die jede
                Architektur-Entscheidung trägt.
              </>
            )}
          </p>
          <p>
            {en ? (
              <>
                That line runs through everything here: productive suites, a hardened homelab,
                AI automation with honest limits, plus a few e-commerce shops I build and harden.
                What ties it together is the care: built to run, not to impress. The structured,
                printable résumé lives at{' '}
                <Link
                  href={localePath(locale, '/cv')}
                  className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                >
                  /cv
                </Link>
                ; this page is deliberately the personal reading of it, not the open book.
              </>
            ) : (
              <>
                Diese Linie zieht sich durch alles hier: produktive Suiten, ein gehärtetes Homelab,
                AI-Automation mit ehrlichen Grenzen, dazu ein paar E-Commerce-Shops, die ich baue
                und härte. Was das eint, ist die Sorgfalt: gebaut, um zu laufen, nicht um zu
                beeindrucken. Der strukturierte, druckbare Lebenslauf liegt unter{' '}
                <Link
                  href={localePath(locale, '/cv')}
                  className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                >
                  /cv
                </Link>
                , diese Seite hier ist bewusst die persönliche Lesart davon, nicht das offene Buch.
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
                {en ? 'Self-owned systems · Infrastructure' : 'Eigen-Systeme · Infrastruktur'}
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
