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
        // Paleta de la marca con alias usados por la UI
        brand: {
          DEFAULT: '#08b4d8',
          dark: '#0b3c5d',
          contrast: '#ffffff',
        },
        // Alias para clases bg-primary / bg-secondary empleadas en componentes
        primary: {
          DEFAULT: '#08b4d8',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#0b3c5d',
          foreground: '#ffffff',
        },
        neutral: {
          DEFAULT: '#f5f5f5',
          dark: '#1f2937',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      spacing: {
        // Escala basada en 4px; tailwind ya define 0-96, añadimos alias
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
      },
    },
  },
  plugins: [],
};