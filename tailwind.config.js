/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0b1e36',
          800: '#0d2d52',
          700: '#0f3d6e',
          600: '#144d89',
          500: '#1a60ab',
          100: '#e6f0fa',
          50: '#f0f6fc',
        },
        brand: {
          blue: '#165294',
          lightBlue: '#3b82f6',
          sky: '#0ea5e9',
          dark: '#0f172a',
          card: '#ffffff',
          border: '#e2e8f0',
        }
      }
    },
  },
  plugins: [],
}
