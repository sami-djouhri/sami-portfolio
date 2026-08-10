import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', '"Instrument Serif"', 'Georgia', 'serif'],
        // Body: IBM Plex Sans (self-hosted via next/font, --font-sans) statt System-Sans.
        // Familienverwandt mit der Mono-Welt, technisch-präzise, überall identisch
        // gerendert (vorher San Francisco/Segoe/Roboto je Gerät). Systemstack bleibt
        // als Fallback für den Font-Swap-Moment / falls der Build-Download fehlt.
        sans: [
          'var(--font-sans)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'sans-serif',
        ],
        mono: [
          'var(--font-mono)',
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      colors: {
        bg: '#0b0c0e',
        'bg-elev': '#101216',
        surface: '#15171c',
        'surface-2': '#1c1f25',
        border: '#26282f',
        'border-strong': '#383b44',
        text: '#ece9e0',
        muted: '#8a8a8a',
        // muted-dim aufgehellt von #5e6068 (3.12:1 — WCAG-AA-Fail) auf #82848d:
        // 5.25:1 auf bg, 4.81:1 auf surface → AA-konform auf beiden Flächen,
        // tonal nah am Original, weiterhin klar dunkler als muted.
        'muted-dim': '#82848d',
        // Phosphor-Amber: der Marken-Akzent, von #c8884a auf einen wärmeren,
        // helleren Glüh-Ton gehoben (Terminal-Identität). accent-bright nur für
        // Glow-Highlights, accent-dim für inaktive/dezente Striche.
        accent: '#e0a458',
        'accent-bright': '#f3bd78',
        'accent-dim': '#7a4f24',
        // Phosphor-Grün: zweite, FUNKTIONALE Farbe (live/ok/Prompt). Bewusst nur
        // an System-/Status-Signalen, nie dekorativ — siehe ZIELBILD 3.x (evolved).
        term: '#5ac56f',
        'term-dim': '#2f7a45',
      },
      letterSpacing: {
        widest: '0.2em',
      },
      fontSize: {
        // Bewusste Display-Skala: DREI Stufen (hero > title > page) statt vier
        // zufälliger clamp()-Werte quer durch die Seiten. Jede Stufe trägt ihre
        // lineHeight + letterSpacing mit → `text-display-*` ersetzt die Kombi aus
        // `text-[clamp(...)] leading-[...] tracking-tight`. Stufen sind absichtlich
        // verschieden groß (Rang: Landing-Hero > Detail-Titel > Sub-Seiten-Titel).
        'display-hero': ['clamp(3.5rem, 11vw, 8rem)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-title': ['clamp(2.75rem, 7vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-page': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '0.95', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        // Semantische Radius-Tokens, zementieren die ZIELBILD-Konvention token-seitig.
        // panel = grosse WindowBar-Fenster, card = Inhalts-Karten, control = Buttons/Inputs.
        panel: '0.75rem',
        card: '0.5rem',
        control: '0.375rem',
      },
      transitionTimingFunction: {
        // Zentrale Easing-Kurven (vorher in globals.css verstreut dupliziert).
        out: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        spring: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      transitionDuration: {
        fast: '140ms',
        base: '240ms',
      },
      boxShadow: {
        // Sanfter Phosphor-Glow für Akzent-Flächen (CTAs, Cursor, Status).
        glow: '0 0 0 1px rgba(224,164,88,0.25), 0 0 24px -6px rgba(224,164,88,0.35)',
        'glow-term': '0 0 18px -4px rgba(90,197,111,0.45)',
        // Neutrale, warm-schwarz getönte Ruhe-Elevation (fehlte bisher, Tiefe kam
        // nur über Borders). Bewusst flach, kein Material-Drop-Shadow-Kitsch.
        e1: '0 1px 2px -1px rgba(0,0,0,0.5), 0 1px 3px -1px rgba(0,0,0,0.4)',
        e2: '0 4px 12px -4px rgba(0,0,0,0.55), 0 2px 6px -2px rgba(0,0,0,0.4)',
        e3: '0 12px 34px -14px rgba(0,0,0,0.6), 0 6px 14px -6px rgba(0,0,0,0.45)',
        // Haardünne obere Innenkante (Top-Bevel): hebt Panels im Dunklen aus dem
        // Hintergrund, der klassische Premium-Trick für dunkle UIs.
        'inset-hair': 'inset 0 1px 0 0 rgba(236,233,224,0.045)',
        // Kombi-Token: Ruhe-Panel mit Elevation + Bevel in einem.
        panel: '0 4px 12px -4px rgba(0,0,0,0.55), 0 2px 6px -2px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(236,233,224,0.045)',
      },
    },
  },
  plugins: [],
};

export default config;
