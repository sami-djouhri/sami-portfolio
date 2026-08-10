import type { Metadata } from 'next';

import { asLocale, localeAlternates, localePath } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { ABOUT } from '@/lib/projects';
import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/SectionHeader';
import { WindowBar } from '../../components/Terminal';
import { TopBar } from '../../components/TopBar';

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale = asLocale(params.locale);
  return {
    title: t(locale, 'footer.datenschutz'),
    description:
      locale === 'en'
        ? 'Privacy policy under the GDPR for djouhri.de. No cookies, no tracking, locally hosted fonts.'
        : 'Datenschutzerklärung nach DSGVO für djouhri.de. Keine Cookies, kein Tracking, lokal gehostete Fonts.',
    alternates: localeAlternates(locale, '/datenschutz'),
    robots: { index: true, follow: false },
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
          <div className="prose-editorial drop-cap p-6 sm:p-8">
          {en ? (
            <p className="text-sm text-muted">
              This is a courtesy translation. The German version is the legally authoritative one
              under the GDPR.
            </p>
          ) : null}

          <h2>{en ? '1. Controller' : '1. Verantwortlicher'}</h2>
          <p>
            {ABOUT.name}, {ABOUT.location}, {en ? 'Germany' : 'Deutschland'}.
            <br />
            {en ? 'Email' : 'E-Mail'}:{' '}
            <a href={`mailto:${ABOUT.contact.email}`}>{ABOUT.contact.email}</a>
          </p>

          <h2>{en ? '2. Hosting & delivery' : '2. Hosting & Auslieferung'}</h2>
          <p>
            {en
              ? 'The site runs on my own infrastructure and is delivered through a Cloudflare tunnel. In doing so, Cloudflare Inc. (USA) processes technically necessary connection data (IP address, user agent, requested URL, timestamp) on our behalf on the basis of legitimate interests (Art. 6 (1) (f) GDPR) to provide and secure the offering. No profiling and no advertising evaluation take place.'
              : 'Die Seite wird auf eigener Infrastruktur betrieben und über einen Cloudflare-Tunnel ausgeliefert. Dabei verarbeitet Cloudflare Inc. (USA) im Auftrag technisch notwendige Verbindungsdaten (IP-Adresse, User-Agent, angeforderte URL, Zeitstempel) auf Basis berechtigter Interessen (Art. 6 Abs. 1 lit. f DSGVO) zur Bereitstellung und Absicherung des Angebots. Es findet kein Profiling und keine werbliche Auswertung statt.'}
          </p>

          <h2>{en ? '3. Fonts' : '3. Schriften'}</h2>
          <p>
            {en ? (
              <>
                The fonts used (Instrument Serif, JetBrains Mono) are served locally from my own
                server. <strong>No</strong> connection is made to Google Fonts or other external
                font CDNs.
              </>
            ) : (
              <>
                Die verwendeten Schriftarten (Instrument Serif, JetBrains Mono) werden lokal vom
                eigenen Server ausgeliefert. Es findet <strong>keine</strong> Verbindung zu Google
                Fonts oder anderen externen Schrift-CDNs statt.
              </>
            )}
          </p>

          <h2>{en ? '4. Cookies & tracking' : '4. Cookies & Tracking'}</h2>
          <p>
            {en
              ? 'This site sets no cookies. No analytics tool, no tracking pixel and no advertising technology is used. Nor are there any server-side counters that would work with personal data.'
              : 'Diese Seite setzt keine Cookies. Es wird kein Analyse-Tool, kein Tracking-Pixel und keine Werbe-Technologie eingesetzt. Auch keine Server-seitigen Counter, die mit personenbezogenen Daten arbeiten würden.'}
          </p>

          <h2>{en ? '5. Contact form' : '5. Kontaktformular'}</h2>
          <p>
            {en ? (
              <>
                When the contact form at{' '}
                <a href={localePath(locale, '/kontakt')}>/kontakt</a> is used, your name, email
                address and message text are stored in an internal mailbox to process the enquiry.
                Legal basis: Art. 6 (1) (b) GDPR (pre-contractual measures) or Art. 6 (1) (f) GDPR
                (answering general enquiries).
              </>
            ) : (
              <>
                Wenn das Kontaktformular auf{' '}
                <a href={localePath(locale, '/kontakt')}>/kontakt</a> genutzt wird, werden Name,
                E-Mail-Adresse und der Nachrichtentext zur Bearbeitung der Anfrage in einem internen
                Postfach gespeichert. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche
                Maßnahmen) bzw. Art. 6 Abs. 1 lit. f DSGVO (Beantwortung allgemeiner Anfragen).
              </>
            )}
          </p>
          <p>
            {en
              ? 'Storage period: until the enquiry has been conclusively processed, at most 12 months. The data is not passed on to third parties. No processing on behalf via third-party providers takes place.'
              : 'Speicherdauer: bis zur abschließenden Bearbeitung der Anfrage, längstens 12 Monate. Die Daten werden nicht an Dritte weitergegeben. Eine Auftragsverarbeitung über Drittanbieter findet nicht statt.'}
          </p>

          <h2>{en ? '6. Server logs' : '6. Server-Logs'}</h2>
          <p>
            {en
              ? 'The reverse proxy writes minimal access logs (timestamp, status, anonymised IP) for operational purposes. These are rotated after 14 days and not merged with other data.'
              : 'Der Reverse-Proxy schreibt minimale Zugriffslogs (Zeitpunkt, Status, anonymisierte IP) für Betriebszwecke. Diese werden nach 14 Tagen rotiert und nicht mit anderen Daten zusammengeführt.'}
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
              ? 'This privacy policy may be adjusted if the processing changes. The current version is always available here.'
              : 'Diese Datenschutzerklärung kann angepasst werden, wenn sich die Verarbeitung ändert. Die jeweils aktuelle Fassung ist hier abrufbar.'}
          </p>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
