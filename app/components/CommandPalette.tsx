'use client';

/**
 * ⌘K / Ctrl+K Command-Palette, Terminal-Identität, VANILLA (keine cmdk-Dep).
 * A11y: role="dialog" + aria-modal, Fokus-Handling, Pfeil/Enter/Esc. Geöffnet per
 * Tastenkürzel ODER window-Event 'open-command-palette'.
 */
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { localePath, type Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/dict';

type ProjectRef = { id: string; title: string; keywords?: string };

type CommandGroup = 'palette.pages' | 'palette.projects' | 'palette.actions';

type Command = {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  group: CommandGroup;
  run: () => void;
};

// Labels über dict-Keys; keywords bewusst zweisprachig, damit die Suche in beiden
// Sprachen greift. hrefs sind unpräfixiert und werden über go()/localePath lokalisiert.
const NAV: { key: string; href: string; hint: string; keywords: string }[] = [
  { key: 'nav.start', href: '/', hint: 'cd ~', keywords: 'home landing start startseite' },
  { key: 'nav.projekte', href: '/projekte', hint: 'ls projekte', keywords: 'projects arbeiten case studies portfolio' },
  { key: 'nav.uber', href: '/uber-mich', hint: 'cat about', keywords: 'about über wer haltung werdegang' },
  { key: 'nav.toolbox', href: '/toolbox', hint: 'ls toolbox', keywords: 'stack technology tools sprachen infra hardware software setup zahlen stats uses' },
  { key: 'nav.jetzt', href: '/jetzt', hint: 'systemctl status sami', keywords: 'status focus now jetzt aktuell momentaufnahme' },
  { key: 'nav.cv', href: '/cv', hint: 'cat cv', keywords: 'cv resume résumé lebenslauf' },
  { key: 'nav.kontakt', href: '/kontakt', hint: 'mail sami', keywords: 'contact kontakt mail write schreiben' },
  { key: 'footer.impressum', href: '/impressum', hint: 'cat impressum', keywords: 'legal imprint impressum' },
  { key: 'footer.datenschutz', href: '/datenschutz', hint: 'cat datenschutz', keywords: 'privacy datenschutz dsgvo gdpr' },
];

export function CommandPalette({
  locale,
  projects,
  email,
}: {
  locale: Locale;
  projects: ProjectRef[];
  email: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(localePath(locale, href));
    },
    [close, router, locale],
  );

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = NAV.map((n) => ({
      id: `nav:${n.href}`,
      label: t(locale, n.key),
      hint: n.hint,
      keywords: `${t(locale, n.key)} ${n.keywords}`,
      group: 'palette.pages' as const,
      run: () => go(n.href),
    }));
    const proj: Command[] = projects.map((p) => ({
      id: `proj:${p.id}`,
      label: p.title,
      hint: `projekte/${p.id}`,
      keywords: `${p.keywords ?? p.title} projekt project ${p.id}`,
      group: 'palette.projects' as const,
      run: () => go(`/projekte/${p.id}`),
    }));
    const actions: Command[] = [
      {
        id: 'action:cv-pdf',
        label: `${t(locale, 'nav.cv')} · PDF`,
        hint: '/cv.pdf',
        keywords: 'cv pdf resume lebenslauf download herunterladen',
        group: 'palette.actions' as const,
        run: () => {
          close();
          window.location.href = `/cv.pdf?lang=${locale}`;
        },
      },
      {
        id: 'action:mail',
        label: t(locale, 'kontakt.mailDirect'),
        hint: email,
        keywords: 'mail email write schreiben contact kontakt',
        group: 'palette.actions' as const,
        run: () => {
          close();
          window.location.href = `mailto:${email}`;
        },
      },
    ];
    return [...nav, ...proj, ...actions];
  }, [projects, email, go, close, locale]);

  const filtered = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return commands;
    return commands.filter((c) => {
      const hay = c.keywords.toLowerCase();
      return tokens.every((tok) => hay.includes(tok));
    });
  }, [commands, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('open-command-palette', onOpen);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command-palette', onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      lastFocused.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (active < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, filtered.length]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (filtered.length) setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      if (filtered.length) setActive(filtered.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[active]?.run();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className="cmdk-overlay fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t(locale, 'palette.placeholder')}
        onKeyDown={onKeyDown}
        className="cmdk-panel w-full max-w-lg overflow-hidden rounded-lg border border-border-strong bg-surface shadow-glow"
      >
        <div className="flex items-center gap-3 border-b border-border bg-bg/60 px-4 py-2">
          <span className="term-dots" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span className="font-mono text-[0.7rem] tracking-widest text-muted-dim">~/befehl</span>
          <span className="ml-auto hidden font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim sm:inline">
            esc
          </span>
          {/* Sichtbarer Schließer: Touch-Nutzer (Mobile-Menü → Palette) haben keine
              Esc-Taste, und der Overlay-Tap ist nicht entdeckbar. */}
          <button
            type="button"
            onClick={close}
            aria-label={locale === 'en' ? 'Close' : 'Schließen'}
            className="-my-1 ml-auto flex size-8 items-center justify-center rounded-md font-mono text-sm text-muted transition-colors hover:text-accent sm:ml-2"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span aria-hidden className="font-mono text-sm text-accent">
            ›
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder={`${t(locale, 'palette.placeholder')} …`}
            aria-label={t(locale, 'palette.placeholder')}
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={filtered[active] ? `cmdk-item-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent font-mono text-sm text-text placeholder:text-muted-dim focus:outline-none"
          />
          {copied ? (
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-term">✓</span>
          ) : null}
        </div>

        <ul ref={listRef} id="cmdk-list" className="max-h-[50vh] overflow-y-auto py-1" role="listbox">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center font-mono text-xs text-muted-dim">
              {t(locale, 'palette.empty')}
            </li>
          ) : (
            filtered.map((c, i) => {
              const showHeader = i === 0 || filtered[i - 1]?.group !== c.group;
              return (
                <li key={c.id} id={`cmdk-item-${i}`} role="option" aria-selected={i === active} data-idx={i}>
                  {showHeader ? (
                    <p className="px-4 pb-1 pt-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-dim">
                      {t(locale, c.group)}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseMove={() => setActive(i)}
                    onClick={() => c.run()}
                    className={`flex w-full items-center justify-between gap-4 px-4 py-2 text-left transition-colors ${
                      i === active ? 'bg-bg text-accent' : 'text-text/90'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className={i === active ? 'font-mono text-accent' : 'font-mono text-transparent'}
                      >
                        ›
                      </span>
                      <span className="truncate text-sm">{c.label}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[0.65rem] tracking-widest text-muted-dim">
                      {c.hint}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
