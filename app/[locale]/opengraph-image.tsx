import { ImageResponse } from 'next/og';

import { asLocale, type Locale } from '@/lib/i18n/config';
import { getAbout } from '@/lib/projects';
import { SITE_HOST } from '@/lib/site';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateImageMetadata({ params }: { params: { locale: string } }) {
  const locale = asLocale(params.locale);
  return [
    {
      id: 'main',
      alt:
        locale === 'en'
          ? 'Sami Djouhri, own systems & infrastructure'
          : 'Sami Djouhri, Eigen-Systeme & Infrastruktur',
      contentType,
      size,
    },
  ];
}

export default function OpenGraphImage({ params }: { params: { locale: string } }) {
  const locale: Locale = asLocale(params.locale);
  const about = getAbout(locale);
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
            'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(224,164,88,0.22), transparent 60%), linear-gradient(to bottom, rgba(38,40,47,0.5) 1px, transparent 1px), linear-gradient(to right, rgba(38,40,47,0.5) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
          color: '#ece9e0',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontFamily: 'monospace',
            fontSize: 22,
            color: '#8a8a8a',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ width: 12, height: 12, backgroundColor: '#5ac56f', borderRadius: 999 }} />
          <span>{about.role}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontFamily: 'monospace',
              fontSize: 26,
              color: '#82848d',
              letterSpacing: '0.04em',
            }}
          >
            <span style={{ color: '#5ac56f' }}>sami@djouhri</span>
            <span>:~$</span>
            <span style={{ color: '#ece9e0' }}>whoami</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              marginTop: 18,
              fontSize: 140,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            <span style={{ display: 'flex' }}>{about.name}.</span>
            <span
              style={{
                display: 'flex',
                width: 36,
                height: 96,
                marginLeft: 22,
                marginBottom: 12,
                backgroundColor: '#e0a458',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 32,
              fontStyle: 'italic',
              fontSize: 44,
              lineHeight: 1.15,
              color: '#e0a458',
              maxWidth: 980,
            }}
          >
            {about.tagline}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'monospace',
            fontSize: 22,
            color: '#82848d',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          <span>{SITE_HOST}</span>
          <span>{about.location}</span>
        </div>
      </div>
    ),
    size,
  );
}
