import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteSecureItem, SecureItemKey } from '@/lib/secureStore';
import * as Notification from 'expo-notifications';

export async function resetApp() {
  const allAsyncKeys = await AsyncStorage.getAllKeys();
  console.log(
    `AsyncStorage keys before reset: ${allAsyncKeys.length} keys found.`,
  );
  await AsyncStorage.multiRemove(allAsyncKeys);
  const allAsyncKeysAfterClean = await AsyncStorage.getAllKeys();
  console.log(
    `AsyncStorage keys after reset: ${allAsyncKeysAfterClean.length} keys remaining.`,
  );

  const secureKeys = Object.values(SecureItemKey) as SecureItemKey[];
  await Promise.all(secureKeys.map((key) => deleteSecureItem(key)));

  await Notification.cancelAllScheduledNotificationsAsync();

  console.log('App data reset complete.');
}
