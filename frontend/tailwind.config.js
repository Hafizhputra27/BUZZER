/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: '#1a73e8',
        'primary-hover': '#1557b0',
        dark: '#040d1a',
        accent: '#00d2ff',
      },
    },
  },
  plugins: [],
}
