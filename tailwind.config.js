/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Domine', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      colors: {
        'dark-blue': '#030e2f',
        'medium-blue': '#1a2333',
        'light-blue': '#2a3343',
        'copper': '#b87d42',
        'light-gray': '#e5e5e5',
        'medium-gray': '#4a5363',
        'slate': '#1f2937',
      },
    },
  },
  plugins: [],
} 