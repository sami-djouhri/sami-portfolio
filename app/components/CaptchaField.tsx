'use client';
// Captcha-Widget-Feld (self-loading <captcha-guard>-Web-Component aus /captcha-guard/).
// Challenge same-origin unter /api/captcha/challenge (lokal HMAC-signiert). Über die ref
// bekommt der Aufrufer ensureToken()/reset().
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface CaptchaHandle {
  ensureToken: () => Promise<string | undefined>;
  reset: () => void;
}

const SCRIPT_ID = 'captcha-guard-script';

function ensureAssets() {
  if (typeof document === 'undefined' || document.getElementById(SCRIPT_ID)) return;
  const s = document.createElement('script');
  s.id = SCRIPT_ID;
  s.src = '/captcha-guard/captcha-guard.js';
  s.defer = true;
  document.head.appendChild(s);
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = '/captcha-guard/captcha-guard.css';
  document.head.appendChild(l);
}

export const CaptchaField = forwardRef<CaptchaHandle, { className?: string; loadingLabel?: string }>(
  function CaptchaField({ className, loadingLabel }, ref) {
    const elRef = useRef<HTMLElement | null>(null);
    // Das Widget lädt sein Skript erst clientseitig nach. Bis die Web-Component
    // registriert ist, ist das Feld für assistive Technik ein leerer Container →
    // aria-busy + ein sr-only Statustext machen das Laden wahrnehmbar.
    const [ready, setReady] = useState(false);
    useEffect(() => {
      ensureAssets();
      if (typeof window === 'undefined' || !window.customElements) {
        setReady(true);
        return;
      }
      let alive = true;
      window.customElements.whenDefined('captcha-guard').then(() => {
        if (alive) setReady(true);
      });
      return () => {
        alive = false;
      };
    }, []);
    useImperativeHandle(ref, () => ({
      async ensureToken() {
        const el = elRef.current as (HTMLElement & { ensureToken?: () => Promise<string> }) | null;
        try { return el?.ensureToken ? await el.ensureToken() : undefined; } catch { return undefined; }
      },
      reset() {
        const el = elRef.current as (HTMLElement & { reset?: () => void }) | null;
        el?.reset?.();
      },
    }));
    const Tag = 'captcha-guard' as unknown as React.ElementType;
    return (
      <div className={className} aria-busy={!ready}>
        <Tag ref={elRef as never} challenge-url="/api/captcha/challenge" />
        {!ready ? (
          <>
            {/* Sichtbarer Lade-Hinweis für Sehende (das Widget lädt sein Skript async
                nach; vorher war das Feld optisch leer). Statisch → kein neues
                Bewegungs-Budget. aria-hidden, weil der sr-only role=status unten
                dieselbe Info AT-gerecht ansagt (kein Doppel-Announce). */}
            <span
              aria-hidden
              className="inline-flex items-center gap-2 font-mono text-xs text-muted-dim"
            >
              <span className="text-accent/50">…</span>
              {loadingLabel ?? '…'}
            </span>
            {loadingLabel ? (
              <span role="status" className="sr-only">
                {loadingLabel}
              </span>
            ) : null}
          </>
        ) : null}
      </div>
    );
  }
);
