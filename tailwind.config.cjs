/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  prefix: 'tw-',
  corePlugins: {
    preflight: false,
  },
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1200px',
      xl: '1440px',
      '2xl': '1920px',
    },
    extend: {
      colors: {
        primary: '#0063ff',
        success: '#0fbe5b',
        warning: '#fc8c00',
        error: '#fe4d4f',
      },
    },
  },
  plugins: [],
}
