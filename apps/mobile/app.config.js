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
      package: 'com.gidevs.beaconapp',
      googleServicesFile: './google-services.json',
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      API_URL: process.env.BACKEND_URL,
      ANDROID_API_URL: process.env.BACKEND_URL_ANDROID,
      DEVICE_URL: process.env.BACKEND_URL_DEVICE,
      DEVICE_URL_MO: process.env.BACKEND_URL_DEVICE_MO,
      eas: {
        projectId: '5023d697-c77c-4fe6-bf73-fe7f7987444e',
      },
    },
  },
};
