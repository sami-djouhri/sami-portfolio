import type { Metadata } from 'next';
import Link from 'next/link';

import { getCv } from '@/lib/cv';
import { asLocale, localeAlternates, localePath } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { getAbout } from '@/lib/projects';
import { Footer } from '../../components/Footer';
import { Reveal } from '../../components/Reveal';
import { PageHeader } from '../../components/SectionHeader';
import { CommandEyebrow, WindowBar } from '../../components/Terminal';
import { TopBar } from '../../components/TopBar';
import { PrintButton } from './PrintButton';

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale = asLocale(params.locale);
  return {
    title: t(locale, 'nav.cv'),
    description:
      locale === 'en'
        ? 'Résumé to read or print. Focused on my own suites, homelab infrastructure and AI-assisted workflows.'
        : 'Lebenslauf zum Lesen oder Drucken. Schwerpunkt eigene Suiten, Homelab-Infrastruktur, AI-gestützte Workflows.',
    alternates: localeAlternates(locale, '/cv'),
  };
}

export default async function CvPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const about = getAbout(locale);
  const cv = getCv(locale);

  return (
    <div className="relative">
      <TopBar active="/cv" locale={locale} />

      <main id="main" className="mx-auto max-w-3xl px-6 pb-32 pt-12 sm:px-8 sm:pt-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 no-print">
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
            <span className="status-dot status-dot--live" aria-hidden />
            <span className="text-term">{locale === 'en' ? 'open to' : 'offen für'}</span>
            <span className="text-muted-dim">
              {locale === 'en'
                ? 'a permanent junior IT administrator role'
                : 'eine Festanstellung als Junior IT-Administrator'}
            </span>
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <PrintButton label={locale === 'en' ? 'Save as PDF' : 'als PDF speichern'} />
            <a
              href={`/cv.pdf${locale === 'en' ? '?lang=en' : ''}`}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs uppercase tracking-widest text-text transition-colors hover:border-border-strong hover:text-accent"
            >
              {locale === 'en' ? 'Download PDF ↓' : 'PDF herunterladen ↓'}
            </a>
            <a
              href={`/cv.pdf?format=kompakt${locale === 'en' ? '&lang=en' : ''}`}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
            >
              {locale === 'en' ? '1-page ↓' : 'Kompakt · 1 Seite ↓'}
            </a>
            <a
              href={`mailto:${about.contact.email}?subject=CV-Anfrage`}
              className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
            >
              {locale === 'en' ? 'Request CV by mail →' : 'CV per Mail anfragen →'}
            </a>
          </div>
        </div>

        <PageHeader eyebrow="./cv --print" title={about.name} command />

        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm uppercase tracking-widest text-accent/90">
          <span className="text-muted-dim">// </span>
          {about.role}
        </p>

        <div className="drop-cap mt-6">
          <p className="text-base leading-relaxed text-text/90 sm:text-lg">{about.bio}</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-border shadow-panel print:shadow-none">
          <div className="no-print">
            <WindowBar title="~/cv/profil" />
          </div>
          <dl className="grid divide-border sm:grid-cols-3 sm:divide-x">
            <Meta label={locale === 'en' ? 'Location' : 'Standort'} value={about.location} />
            <Meta label={locale === 'en' ? 'Contact' : 'Kontakt'} value={about.contact.email} />
            <Meta
              label={locale === 'en' ? 'Mode' : 'Modus'}
              value={locale === 'en' ? 'Remote · LAN-first' : 'Remote · LAN-First'}
            />
          </dl>
        </div>

        <Section command="cat höhepunkte.md" title={locale === 'en' ? 'Highlights' : 'Höhepunkte'}>
          <ul className="space-y-6">
            {cv.highlights.map((h, i) => (
              <li key={i} className="pull-quote">
                {h}
              </li>
            ))}
          </ul>
        </Section>

        <Section command="cat erfahrung.log" title={locale === 'en' ? 'Experience' : 'Erfahrung'}>
          <ol className="timeline-strand space-y-10">
            {cv.experience.map((e, i) => (
              <li key={i} className="relative">
                <span
                  className="absolute left-[-1.65rem] top-2 size-2 rounded-full bg-accent"
                  aria-hidden
                />
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-2xl leading-tight">{e.role}</h3>
                  <span className="font-mono text-xs uppercase tracking-widest text-muted">
                    {e.period}
                  </span>
                </div>
                <p className="font-mono text-xs text-muted-dim">{e.context}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-text/90">
                  {e.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2.5">
                      <span aria-hidden className="mt-px font-mono text-accent">
                        ›
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Section>

        <Section command="cat ausbildung.txt" title={locale === 'en' ? 'Education' : 'Ausbildung'}>
          <ol className="space-y-6">
            {cv.education.map((e, i) => (
              <li key={i}>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl leading-tight">{e.title}</h3>
                  <span className="font-mono text-xs uppercase tracking-widest text-muted">
                    {e.period}
                  </span>
                </div>
                <p className="font-mono text-xs text-muted-dim">{e.context}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          command="ls projekte/--featured"
          title={locale === 'en' ? 'Selected projects' : 'Auswahl-Projekte'}
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {cv.projectsFeatured.map((p) => {
              const card = (
                <div className="h-full rounded-lg border border-border bg-surface/60 p-4 transition-colors group-hover:border-border-strong group-hover:bg-surface-2/40">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg leading-tight text-text group-hover:text-accent">
                      {p.name}
                    </h3>
                    <span className="font-mono text-xs text-muted-dim">{p.year}</span>
                  </div>
                  <p className="mt-2 text-sm text-text/90">{p.oneLiner}</p>
                  <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted">
                    {p.stack.join(' · ')}
                  </p>
                  {p.id ? (
                    <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-widest text-muted-dim no-print">
                      {locale === 'en' ? 'View details →' : 'Detail ansehen →'}
                    </p>
                  ) : null}
                </div>
              );
              return (
                <li key={p.name}>
                  {p.id ? (
                    <Link href={localePath(locale, `/projekte/${p.id}`)} className="group block h-full">
                      {card}
                    </Link>
                  ) : (
                    <div className="group h-full">{card}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>

        <Section command="cat skills.txt" title="Skills">
          <ul className="grid gap-5 sm:grid-cols-2">
            {cv.skills.map((s) => (
              <li key={s.group}>
                <p className="label flex items-center gap-2">
                  <span aria-hidden className="text-accent">
                    ›
                  </span>
                  {s.group}
                </p>
                <p className="mt-2 text-sm text-text/90">{s.items.join(' · ')}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section command="cat sprachen.txt" title={locale === 'en' ? 'Languages' : 'Sprachen'}>
          <dl className="grid gap-3 sm:grid-cols-2">
            {cv.languages.map((l) => (
              <div
                key={l.name}
                className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-2 last:border-0"
              >
                <dt className="text-text/90">{l.name}</dt>
                <dd className="font-mono text-xs text-muted">{l.level}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}

function Section({
  command,
  title,
  children,
}: {
  command: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 border-t border-border pt-10">
      <div className="flex items-baseline gap-4">
        <CommandEyebrow>{command}</CommandEyebrow>
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted">{title}</h2>
      </div>
      <Reveal className="mt-6">{children}</Reveal>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border p-4 last:border-0 sm:border-b-0">
      <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-text/90">{value}</dd>
    </div>
  );
}
