import { ImageResponse } from 'next/og';

import { asLocale, type Locale } from '@/lib/i18n/config';
import { localizedProject } from '@/lib/projects';
import { SITE_HOST } from '@/lib/site';
import { getProject } from '@/lib/store';

export const runtime = 'nodejs';
// Wie die Detail-Seite: ISR, damit Share-Cards CMS-Änderungen nachziehen.
export const revalidate = 300;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateImageMetadata({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const locale = asLocale(params.locale);
  const p = await getProject(params.id);
  const text = p ? localizedProject(p, locale) : null;
  const fallback = locale === 'en' ? 'Project' : 'Projekt';
  return [
    {
      id: 'main',
      alt: text ? `${text.title}, ${text.tagline}` : fallback,
      contentType,
      size,
    },
  ];
}

export default async function ProjectOgImage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const locale: Locale = asLocale(params.locale);
  const p = await getProject(params.id);
  const text = p ? localizedProject(p, locale) : null;
  const title = text?.title ?? (locale === 'en' ? 'Project' : 'Projekt');
  const tagline = text?.tagline ?? '';
  const domain = p?.domain ?? '';
  const stack = p?.stack.slice(0, 4) ?? [];
  const isLive = p?.status === 'live';
  // Status-Label inline zweisprachig (Layout zeigt aktuell nur das live-Badge).
  const statusLabels: Record<Locale, Record<string, string>> = {
    de: { live: 'live', 'im-aufbau': 'im Aufbau', wartung: 'Wartung', pivot: 'eingestellt' },
    en: { live: 'live', 'im-aufbau': 'in progress', wartung: 'maintenance', pivot: 'discontinued' },
  };
  const statusLabel = (p?.status && statusLabels[locale][p.status]) || (locale === 'en' ? 'live' : 'live');

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          backgroundColor: '#0b0c0e',
          backgroundImage:
            'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(224,164,88,0.2), transparent 60%), linear-gradient(to bottom, rgba(38,40,47,0.5) 1px, transparent 1px), linear-gradient(to right, rgba(38,40,47,0.5) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
          color: '#ece9e0',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'monospace',
            fontSize: 22,
            color: '#82848d',
            letterSpacing: '0.04em',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#5ac56f' }}>sami@djouhri</span>
            <span>:~$</span>
            <span style={{ color: '#ece9e0' }}>cat projekte/{domain || title}.md</span>
          </span>
          <span style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}>{SITE_HOST}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1040 }}>
          {domain ? (
            <div
              style={{
                display: 'flex',
                marginBottom: 18,
                fontFamily: 'monospace',
                fontSize: 22,
                color: '#e0a458',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              / {domain}
            </div>
          ) : null}
          <div style={{ display: 'flex', fontSize: 120, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontSize: 40,
              lineHeight: 1.2,
              color: '#ece9e0',
              opacity: 0.85,
            }}
          >
            {tagline}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isLive ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 18px',
                border: '1px solid #2f7a45',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 22,
                color: '#5ac56f',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: 11, height: 11, backgroundColor: '#5ac56f', borderRadius: 999 }} />
              <span>{statusLabel}</span>
            </div>
          ) : null}
          {stack.map((s) => (
            <div
              key={s}
              style={{
                padding: '10px 18px',
                border: '1px solid #383b44',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 22,
                color: '#8a8a8a',
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
