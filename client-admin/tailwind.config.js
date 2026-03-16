/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: '#f8fafc', // Overriding default pure white with greyish white
        background: '#f1f5f9', // Slightly darker greyish white for background
        surface: '#f8fafc', // Greyish White
        surfaceHighlight: '#e2e8f0', // Light Grey Highlight
        primary: '#0ea5e9', // Elegant Light Blue
        primaryHover: '#0284c7', // Darker Blue for hover
        secondary: '#64748b', // Slate Grey (neutral)
        secondaryHover: '#475569',
        danger: '#e11d48', // Elegant Red
        textLight: '#1e293b', // Dark Slate for main text
        textMuted: '#64748b', // Medium Slate for muted text
        slate: {
          // Inverting the slate palette so that legacy "bg-slate-900" becomes light and "bg-slate-100" becomes dark.
          950: '#f1f5f9',
          900: '#f8fafc',
          800: '#e2e8f0',
          700: '#cbd5e1', // borders
          600: '#94a3b8',
          500: '#64748b', // textMuted
          400: '#475569',
          300: '#334155',
          200: '#1e293b', // textLight
          100: '#0f172a',
          50: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
      },
      backdropBlur: {
        'glass': '4px',
      }
    },
  },
  plugins: [],
}
