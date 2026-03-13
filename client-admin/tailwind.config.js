/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a', // Deep slate
        surface: 'rgba(30, 41, 59, 0.7)', // Glassmorphic slate
        surfaceHighlight: 'rgba(51, 65, 85, 0.9)',
        primary: '#6366f1', // Indigo
        primaryHover: '#4f46e5',
        secondary: '#10b981', // Emerald
        secondaryHover: '#059669',
        danger: '#ef4444', // Rose
        textLight: '#f8fafc',
        textMuted: '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'glass': '12px',
      }
    },
  },
  plugins: [],
}
