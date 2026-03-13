/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0c', // Deep Charcoal
        surface: 'rgba(20, 20, 25, 0.6)', // Lighter charcoal glass
        surfaceHighlight: 'rgba(30, 30, 40, 0.8)',
        primary: '#8b5cf6', // Electric Violet
        primaryHover: '#7c3aed',
        secondary: '#14b8a6', // Teal
        secondaryHover: '#0d9488',
        danger: '#f43f5e', // Rose
        textLight: '#f1f5f9',
        textMuted: '#64748b',
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
