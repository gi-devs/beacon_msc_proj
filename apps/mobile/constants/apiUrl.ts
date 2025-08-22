import * as Device from 'expo-device';
import Constants from 'expo-constants';

export const getApiUrl = () => {
  const isAndroid = Device.osName === 'Android';
  const isProd = process.env.NODE_ENV === 'production';
  const isPhysical = Device.isDevice;

  if (isProd) {
    return Constants.expoConfig?.extra?.API_URL;
  }

  if (isPhysical) {
    return Constants.expoConfig?.extra?.DEVICE_URL_N;
  }

  if (isAndroid) {
    return Constants.expoConfig?.extra?.ANDROID_API_URL;
  }

  return Constants.expoConfig?.extra?.API_URL;
};
