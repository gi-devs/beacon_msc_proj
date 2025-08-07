import * as SecureStore from 'expo-secure-store';

export enum SecureItemKey {
  PushToken = 'pushToken',
  AccessToken = 'accessToken',
  RefreshToken = 'refreshToken',
}

const isSecureStoreAvailable = SecureStore.isAvailableAsync;
const prefix = 'beacon-';

const getPrefixedKey = (key: SecureItemKey) => `${prefix}${key}`;

export const saveSecureItem = async (
  key: SecureItemKey,
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

export const getSecureItem = async (
  key: SecureItemKey,
): Promise<string | null> => {
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

export const deleteSecureItem = async (
  key: SecureItemKey,
): Promise<boolean> => {
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
