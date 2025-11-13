/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5750f1',
          dark: '#4338ca',
        },
        gray: {
          1: '#f9fafb',
          2: '#f3f4f6',
          3: '#e5e7eb',
          4: '#d1d5db',
          5: '#9ca3af',
          6: '#6b7280',
          dark: '#1f2937',
        },
        dark: {
          1: '#111827',
          2: '#1f2937',
          3: '#374151',
          4: '#4b5563',
          5: '#072768',
          6: '#9ca3af',
        },
        stroke: {
          DEFAULT: '#e5e7eb',
          dark: '#374151',
        }
      },
      fontFamily: {
        satoshi: ['Satoshi', 'Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}