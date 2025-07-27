import * as Device from 'expo-device';

export const API_URL = Device.osName != "Android" || process.env.NODE_ENV == "production" ?
  process.env.EXPO_PUBLIC_BACKEND_URL :
  process.env.EXPO_PUBLIC_BACKEND_URL_ANDROID;