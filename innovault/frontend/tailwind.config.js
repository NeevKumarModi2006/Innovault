/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1', // Indigo 500
          dark: '#4f46e5', // Indigo 600
          light: '#818cf8', // Indigo 400
        },
        secondary: {
          DEFAULT: '#ec4899', // Pink 500
        },
        dark: {
          DEFAULT: '#0f172a', // Slate 900
          card: '#1e293b', // Slate 800
          input: '#334155', // Slate 700
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
