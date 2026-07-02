/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00236F',
          hover: '#001A52',
        },
        accent: '#57DFFE',
        secondary: '#00687A',
        background: '#F7F9FB',
        surface: '#FFFFFF',
        border: '#C4D0D8',
        textPrimary: '#151B30',
        textSecondary: '#72727A',
        success: {
          DEFAULT: '#166534',
          background: '#DBFCE6',
        },
        warning: {
          DEFAULT: '#B45309',
          background: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#B91C1C',
          background: '#FEE2E2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
