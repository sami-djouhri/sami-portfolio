// Same-origin Challenge fürs captcha-guard-Widget, lokal HMAC-signiert (netcup-DMZ,
// kein zentraler Dienst). Öffentlich, read-only.
import { NextResponse } from 'next/server';

import { captchaEnabled, createChallenge } from '@/lib/captcha';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  if (!captchaEnabled()) {
    return NextResponse.json({ error: 'captcha disabled' }, { status: 404 });
  }
  return NextResponse.json(createChallenge(), { headers: { 'Cache-Control': 'no-store' } });
}
