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
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'shimmer-delayed': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'shimmer-vertical': {
          '0%': { backgroundPosition: '0 -200%' },
          '100%': { backgroundPosition: '0 200%' },
        },
        'shimmer-vertical-delayed': {
          '0%': { backgroundPosition: '0 -200%' },
          '100%': { backgroundPosition: '0 200%' },
        },
        'shimmer-bottom-up': {
          '0%': { backgroundPosition: '0 200%' },
          '100%': { backgroundPosition: '0 -200%' },
        },
        'shimmer-bottom-up-delayed': {
          '0%': { backgroundPosition: '0 200%' },
          '100%': { backgroundPosition: '0 -200%' },
        },
        'soft-zoom-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '50%': { opacity: '1', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'shimmer-delayed': 'shimmer-delayed 2s infinite',
        'shimmer-vertical': 'shimmer-vertical 2s infinite',
        'shimmer-vertical-delayed': 'shimmer-vertical-delayed 2s infinite',
        'shimmer-bottom-up': 'shimmer-bottom-up 2s infinite',
        'shimmer-bottom-up-delayed': 'shimmer-bottom-up-delayed 2s infinite',
        'soft-zoom-in': 'soft-zoom-in 450ms ease-out both',
      },
    },
  },
  plugins: [
    require('tailwind-animations')
  ],
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
    'duration-300',
    'animate-shimmer',
    'animate-shimmer-delayed',
    'animate-shimmer-vertical',
    'animate-shimmer-vertical-delayed',
    'animate-shimmer-bottom-up',
    'animate-shimmer-bottom-up-delayed',
    'animate-blurred-fade-in'
  ],
}
