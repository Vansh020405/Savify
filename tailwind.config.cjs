/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#818cf8',
          DEFAULT: '#6366F1', // From UI Kit
          dark: '#4f46e5',
        },
        secondary: {
          DEFAULT: '#76758B', // From UI Kit
        },
        tertiary: {
          DEFAULT: '#8D6C92', // From UI Kit
        },
        neutral: {
          DEFAULT: '#F8F9FB', // From UI Kit
        },
        background: '#F8F9FB',
        surface: '#ffffff',
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 10px 25px -5px rgba(0, 0, 0, 0.03), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
