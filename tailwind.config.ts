import type { Config } from 'tailwindcss';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const preset = require('./design/tokens/tailwind.preset.js');

const config: Config = {
  presets: [preset],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      maxWidth: { page: '1360px' },
      colors: { neutral: { bg: 'var(--k-neutral-bg)' }, panel: { DEFAULT: 'var(--k-panel)', on: 'var(--k-on-panel)', 'on-muted': 'var(--k-on-panel-muted)' } },
      spacing: { gutter: 'clamp(16px, 5vw, 72px)' },
    },
  },
};

export default config;
