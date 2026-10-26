// Kuverto – Oliven og sitron. Tailwind v3-preset som leser CSS-variablene i tokens.css.
// Bruk: presets: [require('./tokens/tailwind.preset.js')] og importer tokens.css i app/globals.css.
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--k-bg)',
        surface: { DEFAULT: 'var(--k-surface)', soft: 'var(--k-surface-soft)' },
        border: { DEFAULT: 'var(--k-border)', input: 'var(--k-border-input)' },
        text: { DEFAULT: 'var(--k-text)', muted: 'var(--k-text-muted)' },
        primary: { DEFAULT: 'var(--k-primary)', hover: 'var(--k-primary-hover)', on: 'var(--k-on-primary)', 'on-muted': 'var(--k-on-primary-muted)' },
        accent: { DEFAULT: 'var(--k-accent)', on: 'var(--k-on-accent)' },
        success: { DEFAULT: 'var(--k-success)', bg: 'var(--k-success-bg)' },
        warning: { DEFAULT: 'var(--k-warning)', bg: 'var(--k-warning-bg)' },
        error: { DEFAULT: 'var(--k-error)', bg: 'var(--k-error-bg)' },
        brand: { oliven: '#2E3A12', sitron: '#E2E66A', urt: '#ECEBCF', havre: '#F6F4EA', kull: '#1C2210', stein: '#5F6152' },
      },
      fontFamily: {
        display: ['var(--font-manrope)', 'Manrope', 'system-ui', 'sans-serif'],
        sans: ['var(--font-albert)', 'Albert Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['var(--k-text-display)', { lineHeight: '0.98', letterSpacing: '-0.05em', fontWeight: '800' }],
        h1: ['var(--k-text-h1)', { lineHeight: '1.02', letterSpacing: '-0.045em', fontWeight: '800' }],
        h2: ['var(--k-text-h2)', { lineHeight: '1.05', letterSpacing: '-0.045em', fontWeight: '800' }],
        h3: ['var(--k-text-h3)', { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '800' }],
        body: ['var(--k-text-body)', { lineHeight: '1.55' }],
        small: ['var(--k-text-small)', { lineHeight: '1.45' }],
      },
      borderRadius: {
        input: 'var(--k-radius-input)', alert: 'var(--k-radius-alert)', card: 'var(--k-radius-card)',
        media: 'var(--k-radius-media)', panel: 'var(--k-radius-panel)', pill: 'var(--k-radius-pill)',
      },
      boxShadow: { float: 'var(--k-shadow-float)' },
      minHeight: { touch: 'var(--k-touch)' },
      transitionTimingFunction: { kuverto: 'cubic-bezier(.16, 1, .3, 1)' },
    },
  },
};
