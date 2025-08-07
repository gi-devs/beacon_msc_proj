import AsyncStorage from '@react-native-async-storage/async-storage';

export enum AsyncItemKey {
  OnboardingComplete = 'onboarding-complete',
  DailyCheckInNotificationId = 'daily-check-in-notification-id',
}

const prefix = 'beacon-';

const getPrefixedKey = (key: string) => `${prefix}${key}`;

export const saveAsyncItem = async (
  key: AsyncItemKey,
  value: string,
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(getPrefixedKey(key), value);

    if (__DEV__) {
      console.log(`[async-storage-log] ${key}:${value}`);
    }

    return true;
  } catch (err) {
    console.error(`Failed to save AsyncStorage item "${key}":`, err);
    return false;
  }
};

export const getAsyncItem = async (
  key: AsyncItemKey,
): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(getPrefixedKey(key));
  } catch (err) {
    console.error(`Failed to get AsyncStorage item "${key}":`, err);
    return null;
  }
};

export const deleteAsyncItem = async (key: AsyncItemKey): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(getPrefixedKey(key));
    return true;
  } catch (err) {
    console.error(`Failed to delete AsyncStorage item "${key}":`, err);
    return false;
  }
};
