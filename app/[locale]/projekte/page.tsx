import type { Metadata } from 'next';

import { FEATURED_PROJECT_IDS, type Project } from '@/lib/projects';
import { previewIds } from '@/lib/previews';
import { getProjects } from '@/lib/store';
import { asLocale, localeAlternates, type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { Footer } from '../../components/Footer';
import { ProjectCardCompact } from '../../components/ProjectCard';
import { Reveal } from '../../components/Reveal';
import { PageHeader } from '../../components/SectionHeader';
import { CommandEyebrow } from '../../components/Terminal';
import { TopBar } from '../../components/TopBar';
import { ProjectsBrowser } from './ProjectsBrowser';

// ISR: prerendert, alle 5 min revalidiert; Admin-Writes purgen on-demand via revalidatePath.
export const revalidate = 300;

const PROJECTS_DESC: Record<Locale, string> = {
  de: 'Alle Eigen-Projekte im Überblick, Suite, Infrastructure, AI, Bots, Web. Filterbar nach Domäne und Stack.',
  en: 'All my own projects at a glance: Suite, Infrastructure, AI, Bots, Web. Filterable by domain and stack.',
};

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale = asLocale(params.locale);
  return {
    title: t(locale, 'nav.projekte'),
    description: PROJECTS_DESC[locale],
    alternates: localeAlternates(locale, '/projekte'),
  };
}

export default async function ProjektePage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = asLocale(params.locale);
  const projects = await getProjects();
  const featuredIds = new Set<string>(FEATURED_PROJECT_IDS);
  const featured = FEATURED_PROJECT_IDS.map((id) => projects.find((p) => p.id === id)).filter(
    (p): p is Project => Boolean(p),
  );
  const others = projects.filter((p) => !featuredIds.has(p.id));
  const previews = previewIds(projects);
  const previewSet = new Set(previews);

  return (
    <div className="relative">
      <TopBar active="/projekte" locale={locale} />

      <main id="main" className="mx-auto max-w-5xl px-6 pb-32 pt-12 sm:px-8 sm:pt-16">
        <PageHeader
          eyebrow="ls projekte/"
          title={t(locale, 'projects.title')}
          lead={t(locale, 'projects.lead')}
          command
        />

        <section aria-label="Featured" className="mt-12">
          <CommandEyebrow>grep -l featured projekte/*</CommandEyebrow>
          <Reveal as="div" stagger className="mt-5 grid gap-4 sm:grid-cols-3">
            {featured.map((p) => (
              <ProjectCardCompact
                key={p.id}
                project={p}
                locale={locale}
                featured
                hasPreview={previewSet.has(p.id)}
              />
            ))}
          </Reveal>
        </section>

        <ProjectsBrowser locale={locale} projects={others} />
      </main>

      <Footer locale={locale} />
    </div>
  );
}
