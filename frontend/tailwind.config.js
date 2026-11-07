/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e8f6f3',
          100: '#d1ede7',
          200: '#a3dbcf',
          300: '#75c9b7',
          400: '#47b79f',
          500: '#00897b',
          600: '#00695c',
          700: '#00574a',
          800: '#004d40',
          900: '#00251a',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

