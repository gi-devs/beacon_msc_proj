import dotenv from 'dotenv';
dotenv.config({ path: '../../.env.development' });

export default {
  expo: {
    name: 'Beacon',
    slug: 'beacon',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icons/app-icon.png',
    scheme: 'mobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/icons/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#3E678E',
    },
    ios: {
      supportsTablet: false,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icons/app-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      API_URL: process.env.API_URL,
    },
  },
};
