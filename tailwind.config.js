/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark-mode-first sports palette.
        pitch: {
          950: '#05070f',
          900: '#0a0e1a',
          800: '#0f1525',
          700: '#161f36',
        },
        accent: {
          DEFAULT: '#22d3ee', // cyan — "live" / interactive
          glow: '#06b6d4',
        },
        gold: {
          DEFAULT: '#f5c542',
          deep: '#d4a017',
        },
        win: '#34d399', // emerald — winners advance
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.37)',
        'glow-win': '0 0 0 1px rgba(52, 211, 153, 0.5), 0 0 24px rgba(52, 211, 153, 0.25)',
        'glow-accent': '0 0 0 1px rgba(34, 211, 238, 0.5), 0 0 24px rgba(34, 211, 238, 0.25)',
        'glow-gold': '0 0 0 1px rgba(245, 197, 66, 0.6), 0 0 60px rgba(245, 197, 66, 0.35)',
      },
      keyframes: {
        'flow-dash': {
          to: { strokeDashoffset: '-24' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'flow-dash': 'flow-dash 1s linear infinite',
        'float-slow': 'float-slow 4s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};
