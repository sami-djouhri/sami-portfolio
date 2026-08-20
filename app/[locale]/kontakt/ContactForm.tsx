'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { localePath, type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';
import { ABOUT } from '@/lib/projects';
import { TermCursor, WindowBar } from '../../components/Terminal';
import { CaptchaField, type CaptchaHandle } from '../../components/CaptchaField';

type State = 'idle' | 'sending' | 'ok' | 'error';

export function ContactForm({ locale }: { locale: Locale }) {
  const en = locale === 'en';
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const captchaRef = useRef<CaptchaHandle>(null);

  useEffect(() => {
    if (state === 'error' && errorRef.current) {
      errorRef.current.focus();
    }
    if (state === 'ok' && successRef.current) {
      successRef.current.focus();
    }
  }, [state]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    // Referenz VOR dem await sichern: React nullt event.currentTarget nach dem
    // Handler-Durchlauf; ein Zugriff nach fetch würfe TypeError und der catch
    // meldete fälschlich "Fehler" trotz erfolgreichem Versand.
    const form = event.currentTarget;
    const formData = new FormData(form);
    const captchaToken = await captchaRef.current?.ensureToken();
    const payload = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      subject: String(formData.get('subject') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
      website: String(formData.get('website') ?? ''),
      captchaToken,
    };

    const empty = (['name', 'email', 'message'] as const).filter((k) => !payload[k]);
    if (empty.length > 0) {
      setMissing(empty);
      setState('error');
      setError(t(locale, 'form.errorFields'));
      return;
    }

    setMissing([]);
    setState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Status ${res.status}`);
      }
      setState('ok');
      form.reset();
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : t(locale, 'form.errorGeneric'));
      captchaRef.current?.reset();
    }
  }

  if (state === 'ok') {
    return (
      <div className="mt-10 overflow-hidden rounded-lg border border-term/40 bg-surface/40">
        <WindowBar
          title="compose"
          right={
            <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-term">
              <span className="status-dot status-dot--live" aria-hidden />
              {t(locale, 'form.sent')}
            </span>
          }
        />
        <div
          ref={successRef}
          role="status"
          tabIndex={-1}
          className="p-6 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-term"
        >
          <p className="font-mono text-base text-term glow-term">
            <span aria-hidden>{'> '}</span>{en ? 'message sent' : 'nachricht gesendet'}
          </p>
          <p className="mt-3 text-muted">
            {en
              ? 'Your message landed in the inbox. A reply usually follows within 24 hours.'
              : 'Die Nachricht ist im Postfach gelandet. Antwort folgt in der Regel innerhalb von 24 Stunden.'}
          </p>
          <p className="mt-4 font-mono text-sm text-muted">
            <span aria-hidden className="text-accent">›</span>{' '}
            <Link href={localePath(locale, '/cv')} className="text-text transition-colors hover:text-accent">
              /cv
            </Link>{' '}
            <span className="text-muted-dim">, {en ? 'view the résumé in the meantime' : 'in der Zwischenzeit den Lebenslauf ansehen'}</span>
          </p>
        </div>
      </div>
    );
  }

  const hasError = state === 'error' && !!error;

  return (
    <div className="mt-10 overflow-hidden rounded-lg border border-border bg-surface/40">
      {/* WindowBar-Status spiegelt den Formular-Zustand → das „compose“-Fenster liest
          sich in JEDEM State (idle/sending/ok) als lebendes Instrument. Muted, NICHT
          term-grün: Grün ist ausschließlich dem gesendeten/ok-State vorbehalten. */}
      <WindowBar
        title="compose"
        right={
          <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
            {state === 'sending'
              ? (
                <>
                  {en ? 'sending' : 'sende'}
                  <TermCursor />
                </>
              )
              : (en ? 'ready' : 'bereit')}
          </span>
        }
      />
      <form
        onSubmit={onSubmit}
        className="space-y-5 p-6"
        noValidate
        aria-describedby={hasError ? 'contact-form-error' : undefined}
      >
        <Field
          label={t(locale, 'form.name')}
          name="name"
          autoComplete="name"
          autoCapitalize="words"
          required
          invalid={missing.includes('name')}
        />
        <Field
          label={t(locale, 'form.email')}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          required
          invalid={missing.includes('email')}
        />
        <Field
          label={`${t(locale, 'form.subject')} (optional)`}
          name="subject"
          autoComplete="off"
        />
        <TextArea
          label={t(locale, 'form.message')}
          name="message"
          required
          invalid={missing.includes('message')}
        />

        <div aria-hidden className="absolute -left-[9999px] opacity-0">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {hasError ? (
          <p
            id="contact-form-error"
            ref={errorRef}
            role="alert"
            tabIndex={-1}
            className="rounded-md border border-red-400/40 bg-red-400/5 px-3 py-2 text-sm text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <span className="font-mono">
              <span aria-hidden>{'! '}</span>
              {error}
            </span>
            <span className="mt-1 block font-mono text-xs text-red-300/80">
              <span aria-hidden className="text-red-300/60">›</span> {en ? 'directly by mail' : 'direkt per Mail'}:{' '}
              <a
                href={`mailto:${ABOUT.contact.email}`}
                className="underline decoration-red-300/40 underline-offset-4 hover:decoration-red-300"
              >
                {ABOUT.contact.email}
              </a>
            </span>
          </p>
        ) : null}

        {/* Captcha als sichtbarer Terminal-Schritt statt kontextlosem Black-Box-Widget.
            Der <captcha-guard> ist ein clientseitiger Proof-of-Work (HMAC-signierte,
            same-origin Challenge), kein Cookie, kein Drittanbieter. Die mono-Caption
            rahmt das ein; CaptchaField zeigt beim Laden einen sichtbaren Hinweis
            (plus sr-only-Status für AT). Recessed (bg-elev) = eingelassenes Instrument. */}
        <div className="rounded-md border border-border/70 bg-elev/60 px-3.5 py-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]">
          <p className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-widest text-muted-dim">
            <span aria-hidden className="text-accent/70">#</span>
            {en ? 'proof-of-work · human check' : 'proof-of-work · Mensch-Prüfung'}
          </p>
          <CaptchaField
            ref={captchaRef}
            className="mt-2.5"
            loadingLabel={en ? 'Loading security check …' : 'Sicherheitsprüfung wird geladen …'}
          />
          <p className="mt-2.5 font-mono text-[0.68rem] leading-relaxed text-muted-dim">
            {en
              ? 'runs in your browser · no cookie, no third party'
              : 'läuft im Browser · kein Cookie, kein Drittanbieter'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={state === 'sending'}
            aria-busy={state === 'sending'}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg transition-all hover:bg-accent-bright hover:shadow-glow active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent disabled:hover:shadow-none"
          >
            {state === 'sending' ? (
              <>
                {en ? 'sending' : 'sende'}
                <TermCursor />
              </>
            ) : (
              `${t(locale, 'form.send')} →`
            )}
          </button>
          <p className="font-mono text-xs text-muted-dim">
            {en ? 'No cookies, no tracking · see' : 'Keine Cookies, kein Tracking · siehe'}{' '}
            <a
              href={localePath(locale, '/datenschutz')}
              className="underline decoration-border underline-offset-4 transition-colors hover:text-text"
            >
              {t(locale, 'footer.datenschutz')}
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  autoComplete,
  autoCapitalize,
  inputMode,
  spellCheck,
  invalid,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  autoCapitalize?: string;
  inputMode?: 'email' | 'text';
  spellCheck?: boolean;
  invalid?: boolean;
}) {
  return (
    <label className="block">
      <span className="label">
        {label}
        {required ? <span className="text-accent"> *</span> : ''}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        inputMode={inputMode}
        spellCheck={spellCheck}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        className={`mt-2 block w-full rounded-md border bg-elev px-3 py-2 font-mono text-sm text-text shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] transition-colors placeholder:text-muted-dim focus:border-accent focus:outline-none ${
          invalid ? 'border-red-400/40' : 'border-border'
        }`}
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  required,
  invalid,
}: {
  label: string;
  name: string;
  required?: boolean;
  invalid?: boolean;
}) {
  return (
    <label className="block">
      <span className="label">
        {label}
        {required ? <span className="text-accent"> *</span> : ''}
      </span>
      <textarea
        name={name}
        required={required}
        rows={6}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        className={`mt-2 block w-full resize-y rounded-md border bg-elev px-3 py-2 font-mono text-sm leading-relaxed text-text shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] transition-colors placeholder:text-muted-dim focus:border-accent focus:outline-none ${
          invalid ? 'border-red-400/40' : 'border-border'
        }`}
      />
    </label>
  );
}
