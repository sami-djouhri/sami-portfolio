import type { Metadata } from 'next';

import Link from 'next/link';

import { JsonLd } from '@/app/components/JsonLd';
import {
  asLocale,
  localeAlternates,
  localeOpenGraph,
  localePath,
  localizedSlugPath,
} from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { ABOUT, getAbout, getPrinciples } from '@/lib/projects';
import { DIENSTE_PROSA } from '@/lib/proof';
import { CV_OEFFENTLICH, SITE_URL as SITE } from '@/lib/site';
import { Footer } from '../../components/Footer';
import { Reveal } from '../../components/Reveal';
import { PageHeader, SectionHeader } from '../../components/SectionHeader';
import { ConvergeStrands } from '../../components/graphics/ConvergeStrands';
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
  const beschreibung =
    locale === 'en'
      ? 'Infrastructure, systems and automation from the Düsseldorf area. I build and operate my own suites and a hardened homelab in continuous production, documented and recoverable.'
      : 'Infrastruktur, Systeme und Automation aus dem Raum Düsseldorf. Ich baue und betreibe eigene Suiten und ein gehärtetes Homelab im Dauerbetrieb, dokumentiert und wiederherstellbar.';
  return {
    title: t(locale, 'nav.uber'),
    description: beschreibung,
    alternates: localeAlternates(locale, '/uber-mich'),
    openGraph: localeOpenGraph(locale, '/uber-mich', beschreibung, getAbout(locale).name),
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
          {/* Der Lead trug bis 2026-08-27 `about.tagline` — also woertlich denselben
              Satz, der schon auf der Startseite steht. Wer von dort hierher klickt,
              las als Erstes eine Wiederholung. Der Lead nennt jetzt, was DIESE Seite
              leistet: den Weg, nicht die These. */}
          <PageHeader
            eyebrow="cat über-mich.md"
            title={en ? 'Who runs this.' : 'Wer das hier betreibt.'}
            lead={
              en
                ? 'One single board turned into a cluster. This is how that happened.'
                : 'Aus einer Platine wurde ein Verbund. Das ist der Weg dahin.'
            }
            command
          />
        </div>

        {/* Reihenfolge: wer ich bin, wie es anfing, wie es heute betrieben wird, was
            daraus wurde. Das Inventar ist gekuerzt und verweist auf die Seiten, die
            es ohnehin ausfuehren (/projekte, /toolbox), statt sie zu duplizieren.

            ★★ An Position 3 standen bis zum 2026-09-12 zwei Fehler-Anekdoten
            ("Zwei Sachen haben mich mehr gelehrt als jedes Tutorial": der
            heruntergefallene Laptop, das nachgeruestete zweite Konto). Sie sind
            ersetzt durch die BETRIEBSREGELN, die daraus folgen. Der Unterschied ist
            fuer ein Bewerbungsgespraech der entscheidende: eine Lernbehauptung laedt
            zur Nachfrage ein, wie tief das Verstaendnis reicht, eine
            Bestandsbeschreibung ist pruefbar. Owner-Entscheid, zum zweiten Mal nach
            dem 2026-08-14 ("mehr Was habe ich und was verwalte ich, weniger Wie bin
            ich dahin gekommen"). Damals wurden sie entfernt und kamen danach wieder
            herein. Nicht erneut als Anekdote zurueckbauen. */}
        <div className="prose-editorial mt-12">
          <p>
            {en ? (
              <>
                I am {about.shortName}. Grew up in the Rhineland and stayed, within commuting
                distance of the metro area. Close enough to everything that matters, and outside
                the noise. That is roughly how I work too, quietly and in spaces of my own.
              </>
            ) : (
              <>
                Ich bin {about.shortName}. Aufgewachsen im Rheinland und geblieben, in
                Pendel-Distanz zum Ballungsraum. Nah genug an allem, was zählt, und außerhalb
                des Lärms.
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
                single board had grown into a cluster of servers.
              </>
            ) : (
              <>
                Angefangen hat das klein: ein Raspberry Pi 5, ein paar smarte Steckdosen und Lampen
                von verschiedenen Herstellern. Jedes Gerät wollte seine eigene App, und fast alles
                telefonierte nach Hause. Das hat mich gestört. Also habe ich Home Assistant
                aufgesetzt, um alles an einem Ort zu haben, dann einen eigenen DNS-Filter gegen das
                Nachhausetelefonieren, und eins führte zum anderen, bis aus der einen Platine ein
                Verbund aus Servern geworden war.
              </>
            )}
          </p>
          <p>
            {en ? (
              <>
                Out of the tinkering grew an operation with fixed routines. Updates run in waves,
                not on impulse. Every change goes through a repository, so I can tell what changed
                and roll it back. Failures report themselves over two separate channels, because a
                single one is exactly as reliable as the service it runs on. Backups are not just
                configured but restored on a schedule, with real samples. Every lock I put in place
                gets a planned way back in first, and new services start out multi-user, even when
                nobody but me uses them yet.
              </>
            ) : (
              <>
                Aus dem Basteln ist ein Betrieb mit festen Abläufen geworden. Updates laufen in
                Wellen statt spontan. Jede Änderung geht über ein Repository, damit nachvollziehbar
                bleibt, was sich geändert hat, und rückholbar ist. Ausfälle melden sich über zwei
                getrennte Wege, weil ein einzelner genau so verlässlich ist wie der Dienst, auf dem
                er läuft. Sicherungen werden nicht nur eingerichtet, sondern nach Plan
                zurückgespielt, mit echten Stichproben. Jede Absperrung bekommt vorher einen
                geplanten Rückweg, und neue Dienste starten mehrbenutzerfähig, auch wenn sie
                vorerst niemand außer mir benutzt.
              </>
            )}
          </p>
          <p>
            {en ? (
              <>
                What grew out of it: several small machines and an x86 cluster,{' '}
                {DIENSTE_PROSA.en.klein} services in
                continuous operation, my own productivity suite, a few public websites, and a server
                at the network edge for whatever has to be reachable from outside. Plus the whole
                running side of it: hardening, segmented networks, monitoring, encrypted off-site
                backups with a drilled restore. The individual pieces are in{' '}
                <Link
                  href={localePath(locale, '/projekte')}
                  className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                >
                  the projects
                </Link>{' '}
                and in the{' '}
                <Link
                  href={localePath(locale, '/toolbox')}
                  className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                >
                  toolbox
                </Link>
                . How it is wired internally is not on this page on purpose.
              </>
            ) : (
              <>
                Was daraus geworden ist: mehrere kleine Rechner und ein x86-Cluster,{' '}
                {DIENSTE_PROSA.de.klein} Dienste im Dauerbetrieb, eine eigene Productivity-Suite, ein paar öffentliche
                Websites und ein Server am Netz-Rand für das, was von außen erreichbar sein muss.
                Dazu der ganze laufende Betrieb: Härtung, segmentierte Netze, Monitoring,
                verschlüsselte Off-Site-Backups mit geprobtem Restore. Die einzelnen Stücke stehen
                in den{' '}
                <Link
                  href={localePath(locale, '/projekte')}
                  className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                >
                  Projekten
                </Link>{' '}
                und im{' '}
                <Link
                  href={localePath(locale, '/toolbox')}
                  className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                >
                  Werkzeugkasten
                </Link>
                . Wie das intern verkabelt ist, steht bewusst nicht auf dieser Seite.
              </>
            )}
          </p>
          {/* Der ganze Absatz hängt am Schalter CV_OEFFENTLICH (lib/site.ts), nicht
              nur der Link darin: „Diese Seite hier ist die persönliche Lesart
              davon" setzt voraus, dass es ein „davon" öffentlich gibt. */}
          {CV_OEFFENTLICH && (
            <p>
              {en ? (
                <>
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
                  Der strukturierte, druckbare Lebenslauf liegt unter{' '}
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
          )}
        </div>

        {/* Ersetzt die fruehere Sektion „02 Profil“: eine ~/profil-Karte mit sechs
            Feldern Selbstauskunft. Vier davon (Rolle, Standort, Sprache, Modus)
            standen zugleich im Footer DERSELBEN Seite und auf der Startseite. Auf
            der Startseite wurde dieselbe Karte am 2026-08-24 aus genau diesem Grund
            zur Fusszeile gemacht; hier blieb sie stehen. Uebrig bleiben die zwei
            Angaben, die sonst nirgends vorkommen. */}
        <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.7rem] uppercase tracking-widest text-muted-dim">
          <span className="whitespace-nowrap">
            {en ? 'Linux · infrastructure · operations' : 'Linux · Infrastruktur · Betrieb'}
          </span>
          <span aria-hidden>·</span>
          <span className="whitespace-nowrap">
            {en ? 'continuously since 2024' : 'seit 2024 durchgehend'}
          </span>
        </p>

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
                  <p className="mt-2 text-base leading-relaxed text-text/80">{p.body}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </section>

        {/* Bis 2026-08-27 stand hier eine Kopie des Startseiten-Abschlusses: dasselbe
            Terminal-Fenster `mail -s "Hallo" sami`, derselbe Einladungstext. Dieselbe
            Fensterleiste trug auch /kontakt — bei einer Terminal-Oberflaeche heisst
            das, dem Besucher denselben Befehl dreimal vorzutippen. Das Fenster gehoert
            jetzt /kontakt, wo die Konversion sitzt.

            Der Abschluss folgt stattdessen aus DIESER Seite: wer die vier Prinzipien
            gelesen hat, will sie angewandt sehen — nicht als Erstes eine Mail
            schreiben. Also fuehrt der Hauptweg zu den Projekten, Kontakt bleibt als
            zweiter Weg daneben. Nebenbei behoben: der Eyebrow lautete `./say-hi.sh`
            auch auf der deutschen Fassung. */}
        <section className="pt-20">
          <div className="rule pt-10">
            <p className="max-w-xl font-display text-2xl leading-tight">
              {en
                ? 'That is the reasoning. The systems are next door.'
                : 'So weit die Überlegung. Die Systeme stehen nebenan.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href={localePath(locale, '/projekte')}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg transition-all hover:bg-accent-bright hover:shadow-glow"
              >
                {t(locale, 'action.viewProjects')} →
              </Link>
              <Link
                href={localePath(locale, '/kontakt')}
                className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
              >
                {t(locale, 'action.contact')} →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
      <JsonLd data={buildProfileJsonLd(locale)} />
    </div>
  );
}
