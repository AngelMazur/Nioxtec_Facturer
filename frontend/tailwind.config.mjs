/** @type {import('tailwindcss').Config} */
import animations from 'tailwind-animations'

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji']
      },
      container: {
        center: true,
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1200px',
          '2xl': '1200px'
        },
        padding: '1rem'
      },
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
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '60%': { opacity: '1', transform: 'scale(1.01)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'spin-clockwise': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        // Nota: blurred-fade-in ya viene del plugin; mantenemos este alias por compatibilidad
        'blurred-fade-in': {
          '0%': { opacity: '0', filter: 'blur(8px)', transform: 'scale(0.98)' },
          '100%': { opacity: '1', filter: 'blur(0)', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'shimmer-delayed': 'shimmer-delayed 2s infinite',
        'shimmer-vertical': 'shimmer-vertical 2s infinite',
        'shimmer-vertical-delayed': 'shimmer-vertical-delayed 2s infinite',
        'shimmer-bottom-up': 'shimmer-bottom-up 2s infinite',
        'shimmer-bottom-up-delayed': 'shimmer-bottom-up-delayed 2s infinite',
        'soft-zoom-in': 'soft-zoom-in 300ms ease-out both',
        'spin-clockwise': 'spin-clockwise 0.8s linear infinite',
        'blurred-fade-in': 'blurred-fade-in 350ms ease-out both',
      },
    },
  },
  plugins: [animations],
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
    'animate-blurred-fade-in',
    'animate-spin',
    'animate-spin-clockwise'
  ],
}
