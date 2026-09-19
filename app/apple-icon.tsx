import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          backgroundColor: '#0b0c0e',
          backgroundImage:
            'radial-gradient(ellipse 100% 80% at 50% -10%, rgba(224,164,88,0.18), transparent 60%)',
          fontFamily: 'monospace',
          fontSize: 104,
          fontWeight: 700,
        }}
      >
        <span style={{ color: '#5ac56f' }}>$</span>
        <span style={{ color: '#e0a458' }}>_</span>
      </div>
    ),
    size,
  );
}
