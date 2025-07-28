/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        secondary: '#DCC0D2',
        secondaryLight: '#EEDAD4',

        ripple: {
          100: '#05EEC3',
          200: '#03D6D6',
          300: '#00B1B1',
          400: '#019090',
          500: '#036666',
          600: '#014444',
        },
      },
    },
  },
  plugins: [],
};
