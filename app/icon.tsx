import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          backgroundColor: '#0b0c0e',
          fontFamily: 'monospace',
          fontSize: 40,
          fontWeight: 700,
          borderRadius: 12,
          border: '2px solid #26282f',
        }}
      >
        <span style={{ color: '#5ac56f' }}>$</span>
        <span style={{ color: '#e0a458' }}>_</span>
      </div>
    ),
    size,
  );
}
