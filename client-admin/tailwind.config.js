/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: '#ffffff', // Pure white
        background: '#f8fafc', // Slate-50: slight bluish white
        surface: '#ffffff', // Pure white
        surfaceHighlight: '#f1f5f9', // Slate-100: light bluish grey highlight
        primary: '#3b82f6', // Classic neat blue
        primaryHover: '#2563eb', // Darker blue
        secondary: '#64748b', // Slate-500: grey with slight bluish tint
        secondaryHover: '#475569', // Slate-600
        danger: '#ef4444', // Classic red
        textLight: '#0f172a', // Slate-950: nearly black with blue tint
        textMuted: '#64748b', // Slate-500
        slate: {
          // Inverting the slate palette so that legacy "bg-slate-900" becomes light and "bg-slate-100" becomes dark.
          950: '#ffffff', // Pure white
          900: '#f8fafc', // Slate-50
          800: '#f1f5f9', // Slate-100
          700: '#e2e8f0', // Slate-200 (borders)
          600: '#cbd5e1', // Slate-300
          500: '#94a3b8', // Slate-400
          400: '#64748b', // Slate-500
          300: '#475569', // Slate-600
          200: '#334155', // Slate-700
          100: '#474747ff', // Slate-800
          50: '#0f172a',  // Slate-950
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
