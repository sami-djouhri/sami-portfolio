import type { Metadata } from 'next';

import { asLocale, localeAlternates, localePath } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { ABOUT } from '@/lib/projects';
import { PGP_FINGERPRINT, PGP_KEY_URL, SIGNAL_URL } from '@/lib/site';
import Link from 'next/link';

import { Footer } from '../../components/Footer';
import { PageHeader } from '../../components/SectionHeader';
import { CommandEyebrow, WindowBar } from '../../components/Terminal';
import { TopBar } from '../../components/TopBar';
import { ContactForm } from './ContactForm';

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
    title: t(locale, 'nav.kontakt'),
    description:
      locale === 'en'
        ? 'Get in touch: form, email or résumé. Every message comes straight to me and I read it myself.'
        : 'Kontakt aufnehmen: Formular, Mail oder CV. Jede Nachricht landet direkt bei mir, ich lese sie selbst.',
    alternates: localeAlternates(locale, '/kontakt'),
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
          eyebrow={'mail -s "Hallo" sami'}
          title={t(locale, 'kontakt.title')}
          lead={t(locale, 'kontakt.lead')}
          command
        />

        <ContactForm locale={locale} />

        <section className="mt-16 overflow-hidden rounded-lg border border-border bg-surface/40">
          <WindowBar title="~/kontakt --direkt" />
          <div className="p-6">
            <CommandEyebrow>{t(locale, 'kontakt.ways')}</CommandEyebrow>
            <ul className="mt-5 space-y-3 font-mono text-sm">
              <li className="flex items-baseline gap-3">
                <span aria-hidden className="text-accent">›</span>
                <a
                  href={`mailto:${ABOUT.contact.email}`}
                  className="text-text transition-colors hover:text-accent"
                >
                  {ABOUT.contact.email}
                </a>
                <span className="text-muted-dim">, {t(locale, 'kontakt.mailDirect')}</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span aria-hidden className="text-accent">›</span>
                <Link href={localePath(locale, '/cv')} className="text-text transition-colors hover:text-accent">
                  /cv
                </Link>
                <span className="text-muted-dim">, {t(locale, 'kontakt.cvView')}</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span aria-hidden className="text-accent">›</span>
                <Link href={localePath(locale, '/projekte')} className="text-text transition-colors hover:text-accent">
                  /projekte
                </Link>
                <span className="text-muted-dim">, {t(locale, 'kontakt.builtProjects')}</span>
              </li>
            </ul>
            <p className="mt-5 border-t border-border/60 pt-4 text-xs text-muted">
              {ABOUT.location}, {en ? 'Germany' : 'Deutschland'} · Remote · LAN-First
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
                <span aria-hidden className="text-accent">›</span>
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
                  <span aria-hidden className="text-accent">›</span>
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
    </div>
  );
}
