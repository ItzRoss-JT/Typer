/** @type {import('tailwindcss').Config} */
// Tailwind config — pulls colors/shadows/radii from CSS custom properties in
// src/styles/tokens.css so we never hardcode hex values in component classes.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
        },
        accent: {
          400: 'var(--color-accent-400)',
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        elevated: 'var(--color-elevated)',
        border: 'var(--color-border)',
        ink: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        dim: 'var(--color-text-dim)',
        finger: {
          'l-pinky': 'var(--finger-L-pinky)',
          'l-ring': 'var(--finger-L-ring)',
          'l-middle': 'var(--finger-L-middle)',
          'l-index': 'var(--finger-L-index)',
          'r-index': 'var(--finger-R-index)',
          'r-middle': 'var(--finger-R-middle)',
          'r-ring': 'var(--finger-R-ring)',
          'r-pinky': 'var(--finger-R-pinky)',
          thumb: 'var(--finger-thumb)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        glow: 'var(--shadow-glow)',
      },
      transitionTimingFunction: {
        // §8.5 motion easings
        pop: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'caret-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-3px)' },
          '75%': { transform: 'translateX(3px)' },
        },
      },
      animation: {
        'caret-blink': 'caret-blink 1.1s steps(1, end) infinite',
        'pop-in': 'pop-in 250ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'shake': 'shake 200ms ease-in-out',
      },
    },
  },
  plugins: [],
};
