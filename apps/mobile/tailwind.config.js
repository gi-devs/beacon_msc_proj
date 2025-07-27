/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#3E678E',
        primaryLight: '#79B2E7',
        secondary: '#DCC0D2',
        secondaryLight: '#EEDAD4',
      },
    },
  },
  plugins: [],
};
