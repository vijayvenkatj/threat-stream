/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#070a12',
          900: '#0b0f19',
          850: '#111726',
          800: '#161e2e',
          750: '#1e293b',
          700: '#2d3b54',
          accent: '#06b6d4',
          accentHover: '#0891b2',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
          purple: '#a855f7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'cyber-glow': '0 0 15px -3px rgba(6, 182, 212, 0.25)',
        'emerald-glow': '0 0 15px -3px rgba(16, 185, 129, 0.25)',
        'rose-glow': '0 0 15px -3px rgba(244, 63, 94, 0.25)',
      },
    },
  },
  plugins: [],
}
