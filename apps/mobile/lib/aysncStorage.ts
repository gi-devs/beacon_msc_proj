import AsyncStorage from '@react-native-async-storage/async-storage';

const prefix = 'beacon-';

const getPrefixedKey = (key: string) => `${prefix}${key}`;

export const saveAsyncItem = async (
  key: string,
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

export const getAsyncItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(getPrefixedKey(key));
  } catch (err) {
    console.error(`Failed to get AsyncStorage item "${key}":`, err);
    return null;
  }
};

export const deleteAsyncItem = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(getPrefixedKey(key));
    return true;
  } catch (err) {
    console.error(`Failed to delete AsyncStorage item "${key}":`, err);
    return false;
  }
};
