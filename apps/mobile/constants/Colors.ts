const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
  app: {
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

    moodColours: {
      stressed: '#FF6B6B',
      anxious: '#d09027',
      sad: '#6a34e0',
      neutral: '#a4ecc7',
      calm: '#6892e3',
      happy: '#fdd835',
      relaxed: '#00ffe1',
    },
  },
};
