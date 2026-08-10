import type { Metadata } from 'next';

import { asLocale, localeAlternates } from '@/lib/i18n/config';
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
    title: t(locale, 'footer.impressum'),
    description:
      locale === 'en'
        ? 'Provider identification pursuant to § 5 DDG (successor to the German TMG) for djouhri.de.'
        : 'Anbieterkennzeichnung gemäß § 5 DDG (TMG-Nachfolger) für djouhri.de.',
    alternates: localeAlternates(locale, '/impressum'),
    robots: { index: true, follow: false },
  };
}

export default async function ImpressumPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const en = locale === 'en';
  return (
    <div className="relative">
      <TopBar active="/impressum" locale={locale} />

      <main id="main" className="mx-auto max-w-3xl px-6 pb-32 pt-12 sm:px-8 sm:pt-16">
        <PageHeader
          eyebrow="cat impressum.md"
          title={en ? 'Legal notice / Imprint' : 'Impressum'}
          lead={
            en
              ? 'Provider identification pursuant to § 5 DDG (German Digital Services Act). Plain, complete, no frills. The German version is the legally authoritative one.'
              : 'Anbieterkennzeichnung gemäß § 5 DDG. Nüchtern, vollständig, ohne Beiwerk.'
          }
          command
        />

        <div className="mt-12 overflow-hidden rounded-lg border border-border bg-surface/40">
          <WindowBar title="~/recht/impressum.md" />
          <div className="prose-editorial p-6 sm:p-8">
          {en ? (
            <p className="text-sm text-muted">
              This is a courtesy translation. The German version below is the legally authoritative
              one under German law.
            </p>
          ) : null}

          <h2>{en ? 'Provider' : 'Anbieter'}</h2>
          <p>
            {ABOUT.name}
            <br />
            {/* TODO: Sammy, vollständige Postanschrift eintragen (Straße, Hausnummer, PLZ, Ort) */}
            &lt;&lt;{en ? 'Postal address' : 'Postanschrift'}&gt;&gt;
            <br />
            {ABOUT.location}, {en ? 'Germany' : 'Deutschland'}
          </p>

          <h2>{en ? 'Contact' : 'Kontakt'}</h2>
          <p>
            {en ? 'Email' : 'E-Mail'}:{' '}
            <a href={`mailto:${ABOUT.contact.email}`}>{ABOUT.contact.email}</a>
          </p>

          <h2>
            {en
              ? 'Responsible for content pursuant to § 18 (2) MStV'
              : 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV'}
          </h2>
          <p>
            {en ? `${ABOUT.name}, address as above.` : `${ABOUT.name}, Anschrift wie oben.`}
          </p>

          <h2>{en ? 'Dispute resolution' : 'Streitschlichtung'}</h2>
          <p>
            {en
              ? 'The European Commission provides a platform for online dispute resolution (ODR):'
              : 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:'}{' '}
            <a href="https://ec.europa.eu/consumers/odr" rel="noreferrer">
              https://ec.europa.eu/consumers/odr
            </a>
            .
          </p>
          <p>
            {en
              ? 'I am neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.'
              : 'Ich bin nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'}
          </p>

          <h2>{en ? 'Liability for content' : 'Haftung für Inhalte'}</h2>
          <p>
            {en
              ? 'As a service provider I am responsible for my own content on these pages under the general laws pursuant to § 7 (1) DDG. Under §§ 8 to 10 DDG, however, I am not obliged as a service provider to monitor transmitted or stored third-party information or to investigate circumstances that indicate unlawful activity.'
              : 'Als Diensteanbieter bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG bin ich als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.'}
          </p>

          <h2>{en ? 'Liability for links' : 'Haftung für Links'}</h2>
          <p>
            {en
              ? 'This offering contains links to external third-party websites over whose content I have no influence. The respective provider or operator of the linked pages is always responsible for their content.'
              : 'Dieses Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.'}
          </p>

          <h2>{en ? 'Copyright' : 'Urheberrecht'}</h2>
          <p>
            {en
              ? 'The content and works created by the site operator on these pages are subject to German copyright law. Reproduction, editing, distribution and any kind of use beyond the limits of copyright require the written consent of the respective author or creator.'
              : 'Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.'}
          </p>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
