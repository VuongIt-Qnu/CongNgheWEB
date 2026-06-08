/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#11254d',
          900: '#0a1a36',
          950: '#061224',
        },
        gold: {
          400: '#d4bc82',
          500: '#c6a96a',
          600: '#b8954f',
        },
        luxury: {
          gray: '#94a3b8',
          mist: '#f1f5f9',
        },
      },
      boxShadow: {
        soft: '0 12px 40px rgba(2, 6, 23, 0.12)',
        luxury: '0 25px 65px rgba(10, 26, 54, 0.12)',
        card: '0 8px 30px rgba(10, 26, 54, 0.07)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

