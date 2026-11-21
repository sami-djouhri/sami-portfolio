import type { Metadata } from 'next';

import { JsonLd } from '@/app/components/JsonLd';
import { getZiel } from '@/lib/cv';
import {
  asLocale,
  localeAlternates,
  localeOpenGraph,
  localePath,
  localizedSlugPath,
} from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { istBewerbung } from '@/lib/modus';
import { ABOUT, getAbout } from '@/lib/projects';
import { CV_OEFFENTLICH, PGP_FINGERPRINT, PGP_KEY_URL, SIGNAL_URL, SITE_URL } from '@/lib/site';
import Link from 'next/link';

import { Footer } from '../../components/Footer';
import { PageHeader, SectionHeader } from '../../components/SectionHeader';
import { CommandEyebrow, WindowBar } from '../../components/Terminal';
import { TopBar } from '../../components/TopBar';
import { ContactForm } from './ContactForm';

/**
 * Die Seite „Wer, und wie erreichen“ (seit 2026-11-21). Bis dahin gab es zwei
 * Seiten, `/uber-mich` und `/kontakt`; Entscheid aus dem Interview vom
 * 09.11.: zusammenlegen unter `/kontakt`, Menüpunkt „Kontakt“, `/uber-mich`
 * leitet um (`next.config.mjs`), die vier Grundsätze entfallen. Deshalb trägt
 * diese Seite jetzt auch die ProfilePage-Auszeichnung.
 */
function buildProfileJsonLd(locale: ReturnType<typeof asLocale>) {
  const about = getAbout(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    inLanguage: locale,
    mainEntity: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: ABOUT.name,
      description: about.bio,
      jobTitle: about.role,
      url: `${SITE_URL}/${locale}${localizedSlugPath(locale, '/kontakt')}`,
      image: `${SITE_URL}/${locale}/og.png`,
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
      ? 'Who runs this site and how to reach me: form, email, Signal or encrypted mail. Every message comes straight to me and I read it myself.'
      : 'Wer diese Seite betreibt und wie Sie mich erreichen: Formular, Mail, Signal oder verschlüsselt per PGP. Jede Nachricht landet direkt bei mir, ich lese sie selbst.';
  return {
    title: t(locale, 'nav.kontakt'),
    description: beschreibung,
    alternates: localeAlternates(locale, '/kontakt'),
    openGraph: localeOpenGraph(locale, '/kontakt', beschreibung, getAbout(locale).name),
  };
}

export default async function KontaktPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const en = locale === 'en';
  return (
    <div className="relative">
      <TopBar active="/kontakt" locale={locale} />

      <main id="main" className="mx-auto max-w-3xl px-6 pb-32 pt-12 sm:px-8 sm:pt-16">
        <PageHeader
          eyebrow="whoami"
          title={t(locale, 'kontakt.title')}
          lead={t(locale, istBewerbung ? 'kontakt.lead' : 'kontakt.leadNeutral')}
          command
        />

        {/* Aus derselben Quelle wie das `seeks` im Dokumentkopf und der
            Nebensatz am Fuß der Startseite (getZiel, lib/cv.ts).
            Recruiter landen oft direkt hier, ohne die Startseite gesehen zu haben;
            dann waere die gesuchte Position auf dem gesamten Weg bis zum Absenden
            nirgends genannt. Hängt bewusst NICHT an CV_OEFFENTLICH, wohl aber am
            Modus: ein Schaufenster nennt keine gesuchte Stelle (lib/modus.ts).
            Seit dem 2026-10-25 ist das die prominenteste Nennung der Rolle
            auf der ganzen Seite. Auf der Startseite ist sie an den Fuß gerückt
            (Entscheid „Schaufenster führt"), hier bleibt sie oben: wer
            diese Seite öffnet, will ohnehin schreiben. */}
        {/* Hängender Einzug wie im Hero, aus demselben Grund: mit `flex
            flex-wrap` stand das `›` auf 390 px allein über dem Satz. `pl-9`
            trägt hier zweierlei, den Abstand zur Rahmenlinie und die Breite des
            Markers, den `-indent-5` aus der ersten Zeile wieder herauszieht. */}
        {istBewerbung && (
          <div className="mt-8 border-l-2 border-term/40 pl-9">
            <p className="-indent-5 text-base leading-snug">
              <span aria-hidden className="font-mono text-term">
                ›{' '}
              </span>
              <span className="text-text">{getZiel(locale).satz}</span>
            </p>
            {/* Der Satz, ohne den das Abschalten des Lebenslaufs ein Loch
                wäre: ein Personaler sucht ihn, findet nichts und weiß nicht, ob
                es keinen gibt oder ob er ihn nur nicht findet. Entscheid
                vom 2026-10-25, zusammen mit `CV_FREIGEGEBEN = false`.
                Er erscheint genau dann, wenn der Lebenslauf nicht öffentlich
                liegt. Steht er wieder öffentlich, nennt ihn die Liste darunter
                mit Link, und dieser Satz wäre dann die zweite Antwort auf
                dieselbe Frage. */}
            {!CV_OEFFENTLICH && (
              <p className="mt-2 text-sm leading-snug text-muted">
                {en
                  ? 'The full résumé is not published here. I will send it on request.'
                  : 'Der vollständige Lebenslauf liegt hier nicht öffentlich. Ich schicke ihn auf Anfrage.'}
              </p>
            )}
          </div>
        )}

        {/* Wer. Kam am 2026-11-21 von `/uber-mich` herüber, ohne die vier
            Grundsätze und ohne den Schluss-Abschnitt (der wies auf diese Seite).
            Kein Gerätemodell (Interview 09.11.: Hardware nur in
            Größenordnung), deshalb „ein Einplatinenrechner“ statt des Modells.
            Prosa im Markup sieht der Stilprüfer nicht (die Projektregeln, sechste
            Ausprägung): wer hier Text ändert, ändert ihn in BEIDEN Sprachen. */}
        <section id="wer" className="scroll-mt-24 pt-16">
          <SectionHeader
            index="01"
            eyebrow="cat über-mich.md"
            title={en ? 'Who runs this' : 'Wer das hier betreibt'}
          />
          <div className="prose-editorial mt-8">
            <p>
              {en ? (
                <>
                  I am {getAbout(locale).shortName}. Grew up in the Rhineland and stayed, within
                  commuting distance of the metro area.
                </>
              ) : (
                <>
                  Ich bin {getAbout(locale).shortName}. Aufgewachsen im Rheinland und geblieben, in
                  Pendel-Distanz zum Ballungsraum.
                </>
              )}
            </p>
            <p>
              {en ? (
                <>
                  It started small: one single-board computer, a few smart plugs and lights from
                  different vendors. Every device wanted its own app, and almost all of them phoned
                  home. That bothered me. So I set up Home Assistant to get everything into one
                  place, then my own DNS filter to cut the phoning home, and one thing led to
                  another until the single board had grown into a cluster of servers.
                </>
              ) : (
                <>
                  Angefangen hat das klein: ein Einplatinenrechner, ein paar smarte Steckdosen und
                  Lampen von verschiedenen Herstellern. Jedes Gerät wollte seine eigene App, und
                  fast alles telefonierte nach Hause. Das hat mich gestört. Also habe ich Home
                  Assistant aufgesetzt, um alles an einem Ort zu haben, dann einen eigenen
                  DNS-Filter gegen das Nachhausetelefonieren, und eins führte zum anderen, bis aus
                  der einen Platine ein Verbund aus Servern geworden war.
                </>
              )}
            </p>
            <p>
              {en ? (
                <>
                  Out of the tinkering grew an operation with fixed routines. Updates run in waves,
                  not on impulse. Every change goes through a repository, so I can tell what
                  changed and roll it back. Failures report themselves over two separate channels,
                  because a single one is exactly as reliable as the service it runs on. Backups
                  are not just configured but restored on a schedule, with real samples.
                </>
              ) : (
                <>
                  Aus dem Basteln ist ein Betrieb mit festen Abläufen geworden. Updates laufen in
                  Wellen statt spontan. Jede Änderung geht über ein Repository, damit
                  nachvollziehbar bleibt, was sich geändert hat, und rückholbar ist. Ausfälle
                  melden sich über zwei getrennte Wege, weil ein einzelner genau so verlässlich ist
                  wie der Dienst, auf dem er läuft. Sicherungen werden nicht nur eingerichtet,
                  sondern nach Plan zurückgespielt, mit echten Stichproben.
                </>
              )}
            </p>
            <p>
              {en ? (
                <>
                  The individual pieces are in{' '}
                  <Link
                    href={localePath(locale, '/projekte')}
                    className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                  >
                    the projects
                  </Link>
                  . How it is wired internally is not on this site on purpose.
                </>
              ) : (
                <>
                  Die einzelnen Stücke stehen in den{' '}
                  <Link
                    href={localePath(locale, '/projekte')}
                    className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                  >
                    Projekten
                  </Link>
                  . Wie das intern verkabelt ist, steht bewusst nicht auf dieser Seite.
                </>
              )}
            </p>
          </div>
          <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.7rem] uppercase tracking-widest text-muted-dim">
            <span className="whitespace-nowrap">
              {en ? 'Linux · infrastructure · operations' : 'Linux · Infrastruktur · Betrieb'}
            </span>
            <span aria-hidden>·</span>
            <span className="whitespace-nowrap">
              {en ? 'continuously since 2024' : 'seit 2024 durchgehend'}
            </span>
          </p>
        </section>

        <section id="schreiben" className="scroll-mt-24 pt-16">
          <SectionHeader
            index="02"
            eyebrow={'mail -s "Hallo" sami'}
            title={en ? 'Get in touch' : 'Schreiben'}
          />
          <ContactForm
            locale={locale}
            email={ABOUT.contact.email}
            lebenslaufFeld={istBewerbung && !CV_OEFFENTLICH}
          />
        </section>

        <section className="mt-16 overflow-hidden rounded-lg border border-border bg-surface/40">
          <WindowBar title="~/kontakt --direkt" />
          <div className="p-6">
            <CommandEyebrow>{t(locale, 'kontakt.ways')}</CommandEyebrow>
            <ul className="mt-5 space-y-3 font-mono text-sm">
              <li className="flex items-baseline gap-3">
                <span aria-hidden className="text-term">›</span>
                <a
                  href={`mailto:${ABOUT.contact.email}`}
                  className="text-text transition-colors hover:text-accent"
                >
                  {ABOUT.contact.email}
                </a>
                <span className="text-muted-dim">, {t(locale, 'kontakt.mailDirect')}</span>
              </li>
              {/* Am Schalter CV_OEFFENTLICH (lib/site.ts). Der ganze Listenpunkt
                  entfällt, nicht nur der Link: „/cv, Lebenslauf ansehen" ohne
                  Ziel wäre eine Einladung ins Leere. */}
              {CV_OEFFENTLICH && (
                <li className="flex items-baseline gap-3">
                  <span aria-hidden className="text-term">›</span>
                  <Link href={localePath(locale, '/cv')} className="text-text transition-colors hover:text-accent">
                    /cv
                  </Link>
                  <span className="text-muted-dim">, {t(locale, 'kontakt.cvView')}</span>
                </li>
              )}
              <li className="flex items-baseline gap-3">
                <span aria-hidden className="text-term">›</span>
                <Link href={localePath(locale, '/projekte')} className="text-text transition-colors hover:text-accent">
                  /projekte
                </Link>
                <span className="text-muted-dim">, {t(locale, 'kontakt.builtProjects')}</span>
              </li>
            </ul>
            <p className="mt-5 border-t border-border/60 pt-4 text-xs text-muted">
              {getAbout(locale).location}{en ? '' : ', Deutschland'} · Remote · LAN-First
            </p>
          </div>
        </section>

        {/* Sichere Kanäle: bewusst als eigene Box, hebt die Security-Praxis hervor.
            Signal-Deeplink (ohne Nummer) + PGP-Public-Key zum verschlüsselten Mailen. */}
        <section className="mt-8 overflow-hidden rounded-lg border border-border bg-surface/40">
          <WindowBar title="~/kontakt --verschluesselt" />
          <div className="p-6">
            <CommandEyebrow>gpg --encrypt</CommandEyebrow>
            <ul className="mt-5 space-y-4 font-mono text-sm">
              <li className="flex items-baseline gap-3">
                <span aria-hidden className="text-term">›</span>
                <a
                  href={SIGNAL_URL}
                  target="_blank"
                  rel="noopener"
                  className="text-text transition-colors hover:text-accent"
                >
                  Signal
                </a>
                <span className="text-muted-dim">, {t(locale, 'kontakt.signalNote')}</span>
              </li>
              <li className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-3">
                  <span aria-hidden className="text-term">›</span>
                  <a
                    href={PGP_KEY_URL}
                    className="text-text transition-colors hover:text-accent"
                  >
                    pgp-key.asc
                  </a>
                  <span className="text-muted-dim">, {t(locale, 'kontakt.pgpNote')}</span>
                </div>
                <p className="pl-6 text-xs leading-relaxed text-muted-dim">
                  <span className="text-muted">fingerprint</span>{' '}
                  <span className="select-all break-all text-text/70">{PGP_FINGERPRINT}</span>
                </p>
              </li>
            </ul>
            <p className="mt-5 border-t border-border/60 pt-4 text-xs text-muted">
              {t(locale, 'kontakt.secureHint')}
            </p>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
      <JsonLd data={buildProfileJsonLd(locale)} />
    </div>
  );
}
