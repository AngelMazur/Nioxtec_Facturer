/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#08b4d8',
          dark: '#0b3c5d',
          contrast: '#ffffff',
        },
        primary: {
          DEFAULT: '#08b4d8',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#0b3c5d',
          foreground: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}