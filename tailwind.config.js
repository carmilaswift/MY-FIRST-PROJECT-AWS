/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/client/**/*.{tsx,ts,html}'],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b1b9c9',
          400: '#8793ab',
          500: '#687591',
          600: '#535e78',
          700: '#444d62',
          800: '#3b4253',
          900: '#1e2130',
          950: '#14161f',
        },
      },
    },
  },
  plugins: [],
};
