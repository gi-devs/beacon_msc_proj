import * as SecureStore from 'expo-secure-store';

const isSecureStoreAvailable = SecureStore.isAvailableAsync;
const prefix = 'beacon-';

const getPrefixedKey = (key: string) => `${prefix}${key}`;

export const saveSecureItem = async (
  key: string,
  value: string,
): Promise<boolean> => {
  try {
    const available = await isSecureStoreAvailable();
    if (!available) {
      console.warn('SecureStore not available');
      return false;
    }

    await SecureStore.setItemAsync(getPrefixedKey(key), value);

    if (__DEV__) {
      console.log(`[secure-token-log] ${key}:${value}`);
    }

    return true;
  } catch (err) {
    console.error(`Failed to save SecureStore item "${key}":`, err);
    return false;
  }
};

export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    const available = await isSecureStoreAvailable();
    if (!available) {
      console.warn('SecureStore not available');
      return null;
    }

    return await SecureStore.getItemAsync(getPrefixedKey(key));
  } catch (err) {
    console.error(`Failed to get SecureStore item "${key}":`, err);
    return null;
  }
};

export const deleteSecureItem = async (key: string): Promise<boolean> => {
  try {
    const available = await isSecureStoreAvailable();
    if (!available) {
      console.warn('SecureStore not available');
      return false;
    }

    await SecureStore.deleteItemAsync(getPrefixedKey(key));
    return true;
  } catch (err) {
    console.error(`Failed to delete SecureStore item "${key}":`, err);
    return false;
  }
};
