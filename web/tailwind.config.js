/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          navy: '#0B1F33',
          navyHover: '#071524',
          accent: '#0891B2',
          brightCyan: '#06B6D4',
          teal: '#0F766E',
          emerald: '#047857',
          amber: '#B45309',
          rose: '#B91C1C',
          purple: '#6D28D9',
          blue: '#1D4ED8',
          border: '#CBD5E1',
          surface: '#F8FAFC',
          surfaceSubtle: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'cyber-sm': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'cyber-card': '0 1px 3px 0 rgba(15, 23, 42, 0.1), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
        'cyber-hover': '0 4px 12px -2px rgba(8, 145, 178, 0.15), 0 2px 4px -1px rgba(15, 23, 42, 0.06)',
        'navy-glow': '0 4px 20px -2px rgba(11, 31, 51, 0.25)',
      },
    },
  },
  plugins: [],
}
