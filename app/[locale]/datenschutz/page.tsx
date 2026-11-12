import type { Metadata } from 'next';

import { asLocale, localeAlternates, localeOpenGraph, localePath } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { ABOUT, getAbout } from '@/lib/projects';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/SectionHeader';
import { WindowBar } from '../../components/Terminal';
import { TopBar } from '../../components/TopBar';

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
      ? 'Privacy policy under the GDPR for djouhri.de. One cookie for the language, no tracking, fonts from my own server.'
      : 'Datenschutzerklärung nach DSGVO für djouhri.de. Ein Cookie für die Sprache, kein Tracking, Schriften vom eigenen Server.';
  return {
    title: t(locale, 'footer.datenschutz'),
    description: beschreibung,
    alternates: localeAlternates(locale, '/datenschutz'),
    // Kein `follow: false` mehr, Begründung wie im Impressum.
    openGraph: localeOpenGraph(locale, '/datenschutz', beschreibung, getAbout(locale).name),
  };
}

export default async function DatenschutzPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const en = locale === 'en';
  return (
    <div className="relative">
      <TopBar active="/datenschutz" locale={locale} />

      <main id="main" className="mx-auto max-w-3xl px-6 pb-32 pt-12 sm:px-8 sm:pt-16">
        <PageHeader
          eyebrow="cat datenschutz.md"
          title={en ? 'Privacy policy' : 'Datenschutzerklärung'}
          lead={
            en
              ? 'This site processes as little personal data as possible. Here is an honest account of what happens. The German version is the legally authoritative one.'
              : 'Diese Seite verarbeitet so wenig personenbezogene Daten wie möglich. Hier steht ehrlich, was passiert.'
          }
          command
        />

        <div className="mt-12 overflow-hidden rounded-lg border border-border bg-surface/40">
          <WindowBar
            title="~/recht/datenschutz.md"
            right={
              <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-term">
                <span className="status-dot status-dot--live" aria-hidden />
                {en ? 'no tracking' : 'kein tracking'}
              </span>
            }
          />
          <div className="prose-editorial p-6 sm:p-8">
          {en ? (
            <p className="text-sm text-muted">
              This is a courtesy translation. The German version is the legally authoritative one
              under the GDPR.
            </p>
          ) : null}

          <h2>{en ? '1. Controller' : '1. Verantwortlicher'}</h2>
          <p>
            {ABOUT.name}, {getAbout(locale).location}{en ? '' : ', Deutschland'}.
            <br />
            {en ? 'Email' : 'E-Mail'}:{' '}
            <a href={`mailto:${ABOUT.contact.email}`}>{ABOUT.contact.email}</a>
          </p>

          <h2>{en ? '2. Hosting & delivery' : '2. Hosting & Auslieferung'}</h2>
          <p>
            {en
              ? 'This site runs on a virtual server I rent from netcup GmbH (Karlsruhe, Germany), which acts as a processor under a data processing agreement. Delivery goes through Cloudflare Inc. (USA) as a CDN and reverse proxy. Both process technically necessary connection data (IP address, user agent, requested URL, timestamp) on the basis of legitimate interests (Art. 6 (1) (f) GDPR) to provide and secure the offering. The transfer to Cloudflare in the USA is covered by the EU standard contractual clauses (Art. 46 (2) (c) GDPR). No profiling and no advertising evaluation take place.'
              : 'Die Seite läuft auf einem virtuellen Server, den ich bei der netcup GmbH (Karlsruhe, Deutschland) miete; netcup ist insoweit Auftragsverarbeiter auf Grundlage eines Auftragsverarbeitungsvertrags. Die Auslieferung erfolgt über Cloudflare Inc. (USA) als CDN und Reverse-Proxy. Beide verarbeiten dabei technisch notwendige Verbindungsdaten (IP-Adresse, User-Agent, angeforderte URL, Zeitstempel) auf Basis berechtigter Interessen (Art. 6 Abs. 1 lit. f DSGVO) zur Bereitstellung und Absicherung des Angebots. Die Übermittlung an Cloudflare in die USA ist über die EU-Standardvertragsklauseln abgesichert (Art. 46 Abs. 2 lit. c DSGVO). Es findet kein Profiling und keine werbliche Auswertung statt.'}
          </p>
          <p>
            {en
              ? 'When the site is opened without a language in the address, the web server picks one. It looks at the display language stored in the cookie (section 4), otherwise at the country Cloudflare passes along with the request, otherwise at the language setting of the browser. These details are not stored and serve this redirect alone.'
              : 'Wird die Seite ohne Sprache in der Adresse aufgerufen, wählt der Webserver eine aus. Er sieht dafür auf die im Cookie gespeicherte Anzeigesprache (Abschnitt 4), sonst auf das Land, das Cloudflare mit der Anfrage übermittelt, sonst auf die Spracheinstellung des Browsers. Gespeichert werden diese Angaben nicht, sie dienen allein dieser Weiterleitung.'}
          </p>

          <h2>{en ? '3. Fonts' : '3. Schriften'}</h2>
          <p>
            {en ? (
              <>
                The fonts used (Instrument Serif, JetBrains Mono, IBM Plex Sans) are served locally
                from my own server. <strong>No</strong> connection is made to Google Fonts or other
                external font CDNs.
              </>
            ) : (
              <>
                Die verwendeten Schriftarten (Instrument Serif, JetBrains Mono, IBM Plex Sans)
                werden lokal vom eigenen Server ausgeliefert. Es findet <strong>keine</strong>{' '}
                Verbindung zu Google Fonts oder anderen externen Schrift-CDNs statt.
              </>
            )}
          </p>

          <h2>{en ? '4. Cookies & tracking' : '4. Cookies & Tracking'}</h2>
          <p>
            {en
              ? 'For visitors this site sets exactly one cookie: NEXT_LOCALE stores the display language (value “de” or “en”, lifetime one year). It contains no identifier, allows no recognition of the visitor and is not evaluated. As a strictly necessary cookie it does not require consent (§ 25 (2) no. 2 TDDDG), which is why there is no cookie banner. Beyond that: no analytics tool, no tracking pixel, no advertising technology, and no server-side counters working with personal data.'
              : 'Für Besucher setzt diese Seite genau ein Cookie: NEXT_LOCALE speichert die Anzeigesprache (Wert „de“ oder „en“, Laufzeit ein Jahr). Es enthält keine Kennung, erlaubt keine Wiedererkennung und wird nicht ausgewertet. Als unbedingt erforderliches Cookie ist es einwilligungsfrei (§ 25 Abs. 2 Nr. 2 TDDDG), deshalb gibt es kein Cookie-Banner. Darüber hinaus: kein Analyse-Tool, kein Tracking-Pixel, keine Werbe-Technologie und keine Server-seitigen Counter, die mit personenbezogenen Daten arbeiten.'}
          </p>
          <p>
            {en
              ? 'While the site is closed for maintenance, a second cookie can be set, but only for someone who opens it with an access key I have handed out. It stores that key, is valid for twelve hours and lets the holder through to the site.'
              : 'Solange die Seite wegen Wartung geschlossen ist, kann ein zweites Cookie entstehen, aber nur bei jemandem, der sie mit einem von mir ausgegebenen Zugangsschlüssel aufruft. Es speichert diesen Schlüssel, gilt zwölf Stunden und lässt seinen Inhaber zur Seite durch.'}
          </p>

          <h2>{en ? '5. Contact form' : '5. Kontaktformular'}</h2>
          <p>
            {en ? (
              <>
                When the contact form at{' '}
                <a href={localePath(locale, '/kontakt')}>/kontakt</a> is used, your name, email
                address, the optional subject and the message text are stored in an internal mailbox
                to process the enquiry, and I am notified by email.
                Legal basis: Art. 6 (1) (b) GDPR (pre-contractual measures) or Art. 6 (1) (f) GDPR
                (answering general enquiries).
              </>
            ) : (
              <>
                Wenn das Kontaktformular auf{' '}
                <a href={localePath(locale, '/kontakt')}>/kontakt</a> genutzt wird, werden Name,
                E-Mail-Adresse, der freiwillige Betreff und der Nachrichtentext zur Bearbeitung der
                Anfrage in einem internen Postfach gespeichert, und ich werde per E-Mail
                benachrichtigt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche
                Maßnahmen) bzw. Art. 6 Abs. 1 lit. f DSGVO (Beantwortung allgemeiner Anfragen).
              </>
            )}
          </p>
          <p>
            {en
              ? 'The message is encrypted with my public PGP key on the server before it reaches storage or mail, and only I can decrypt it. Should encryption fail in an individual case, the message is stored unencrypted on the server so that it is not lost. Mail runs on my own mail server on the vServer described in section 2; beyond the hosting providers named there, the data is not passed on to any third party.'
              : 'Die Nachricht wird bereits auf dem Server mit meinem öffentlichen PGP-Schlüssel verschlüsselt, bevor sie Ablage oder Mail erreicht, und nur ich kann sie entschlüsseln. Scheitert die Verschlüsselung im Einzelfall, wird die Nachricht unverschlüsselt auf dem Server abgelegt, damit sie nicht verloren geht. Der Mailversand läuft über einen eigenen Mailserver auf dem in Abschnitt 2 genannten vServer; über die dort genannten Hosting-Dienstleister hinaus werden die Daten an keine Dritten weitergegeben.'}
          </p>
          <p>
            {en
              ? 'Instead of a captcha service, the browser solves a small calculation that the server issues and checks itself; no third party is involved. To limit abuse, the server keeps the IP address of the request in memory for ten minutes and allows five enquiries in that time; it is not written to disk and does not become part of the message. After sending, an automatic confirmation goes to the email address entered, at most one per hour to the same address.'
              : 'Statt eines Captcha-Dienstes löst der Browser eine kleine Rechenaufgabe, die der Server selbst ausstellt und prüft; ein Dritter ist nicht beteiligt. Gegen Missbrauch hält der Server die IP-Adresse der Anfrage zehn Minuten im Arbeitsspeicher und lässt in dieser Zeit fünf Anfragen zu; sie wird nicht auf die Festplatte geschrieben und nicht Teil der Nachricht. Nach dem Absenden geht eine automatische Bestätigung an die angegebene E-Mail-Adresse, höchstens eine je Stunde an dieselbe Adresse.'}
          </p>
          <p>
            {en
              ? 'Storage period: until the enquiry has been conclusively processed, at most 12 months. Messages older than 12 months are deleted from the mailbox of the site automatically.'
              : 'Speicherdauer: bis zur abschließenden Bearbeitung der Anfrage, längstens 12 Monate. Nachrichten, die älter als 12 Monate sind, löscht der Posteingang der Seite automatisch.'}
          </p>

          <h2>{en ? '6. Server logs' : '6. Server-Logs'}</h2>
          <p>
            {en
              ? 'The web server on my vServer keeps no regular access log for this site: normal page views are not written to disk. Only errors and connection problems produce an entry in the system log, which can include the calling IP address; those entries are rotated by the operating system and not merged with other data. Independently of that, Cloudflare keeps its own logs at the edge as part of delivery (see section 2).'
              : 'Der Webserver auf meinem vServer führt für diese Seite kein reguläres Zugriffsprotokoll: normale Seitenaufrufe werden nicht mitgeschrieben. Nur Fehler und Verbindungsprobleme erzeugen einen Eintrag im System-Log, der auch die aufrufende IP-Adresse enthalten kann; diese Einträge rotiert das Betriebssystem und führt sie nicht mit anderen Daten zusammen. Unabhängig davon führt Cloudflare im Rahmen der Auslieferung eigene Protokolle am Edge (siehe Abschnitt 2).'}
          </p>

          <h2>{en ? '7. Data subject rights' : '7. Betroffenenrechte'}</h2>
          <p>{en ? 'You have the right at any time to:' : 'Jederzeit besteht das Recht auf:'}</p>
          <ul>
            <li>
              {en
                ? 'access to the stored data (Art. 15 GDPR)'
                : 'Auskunft über die gespeicherten Daten (Art. 15 DSGVO)'}
            </li>
            <li>
              {en
                ? 'rectification of inaccurate data (Art. 16 GDPR)'
                : 'Berichtigung unrichtiger Daten (Art. 16 DSGVO)'}
            </li>
            <li>{en ? 'erasure (Art. 17 GDPR)' : 'Löschung (Art. 17 DSGVO)'}</li>
            <li>
              {en
                ? 'restriction of processing (Art. 18 GDPR)'
                : 'Einschränkung der Verarbeitung (Art. 18 DSGVO)'}
            </li>
            <li>
              {en ? 'data portability (Art. 20 GDPR)' : 'Datenübertragbarkeit (Art. 20 DSGVO)'}
            </li>
            <li>
              {en
                ? 'objection to the processing (Art. 21 GDPR)'
                : 'Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)'}
            </li>
            <li>
              {en
                ? 'lodging a complaint with the competent supervisory authority (Art. 77 GDPR)'
                : 'Beschwerde bei der zuständigen Aufsichtsbehörde (Art. 77 DSGVO)'}
            </li>
          </ul>
          <p>
            {en
              ? 'The competent supervisory authority is the State Commissioner for Data Protection and Freedom of Information of North Rhine-Westphalia (Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen).'
              : 'Zuständige Aufsichtsbehörde ist die Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen.'}
          </p>

          <h2>{en ? '8. Changes' : '8. Änderungen'}</h2>
          <p>
            {en
              ? 'This privacy policy may be adjusted if the processing changes. The current version is always available here. Last updated: November 2026.'
              : 'Diese Datenschutzerklärung kann angepasst werden, wenn sich die Verarbeitung ändert. Die jeweils aktuelle Fassung ist hier abrufbar. Stand: November 2026.'}
          </p>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
