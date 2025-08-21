/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
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
  safelist: [
    'hover:scale-105',
    'hover:scale-110',
    'hover:scale-[1.02]',
    'hover:shadow-lg',
    'hover:shadow-md',
    'hover:shadow-cyan-500/20',
    'hover:shadow-cyan-500/30',
    'hover:bg-gray-700',
    'hover:bg-gray-800/80',
    'hover:text-white',
    'hover:text-brand',
    'hover:underline',
    'hover:opacity-90',
    'hover:brightness-110',
    'active:scale-95',
    'active:bg-gray-700',
    'focus:scale-105',
    'focus:ring-2',
    'focus:ring-brand',
    'focus:ring-primary',
    'focus:ring-secondary',
    'focus:ring-gray-500',
    'focus:ring-red-500',
    'focus:ring-opacity-50',
    'transition-all',
    'transition-transform',
    'transition-colors',
    'transform',
    'duration-200',
    'duration-300'
  ],
}