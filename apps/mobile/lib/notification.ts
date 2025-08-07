import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Alert, Linking, Platform } from 'react-native';
import { getPermissionsAsync } from 'expo-notifications';
import { getSecureItem, saveSecureItem } from '@/lib/secureStore';
import { syncPushToken } from '@/api/pushTokenApi';

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFFFFF',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log(`Existing notification status: ${existingStatus}`);

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    console.log('Requesting notification permissions...');
    const { status } = await Notifications.requestPermissionsAsync();

    finalStatus = status;

    if (finalStatus === 'denied') {
      Alert.alert(
        'Enable Notifications',
        'If you want to receive notifications, you can enable them in your device settings.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open Profile',
            onPress: () => Linking.openSettings(),
          },
        ],
      );

      return false;
    }
  }

  if (finalStatus !== 'granted') {
    console.warn('Permission not granted for push notifications');
    return false;
  }

  if (!Device.isDevice) {
    console.warn('Must use physical device for push notifications');
    // if permissions are granted but not on a device, we return true
    if (finalStatus === 'granted') {
      console.log('Running on a simulator, no token but permissions granted');
      return true;
    }
    return false;
  }

  return await fetchAndSavePushToken();
}

/**
 * Fetches the Expo push token and saves it securely. It handles the following:
 * - Checks if the device is a physical device.
 * - Checks if the user has granted notification permissions.
 * - Retrieves the Expo push token using the project ID from the app configuration.
 * If the token is successfully retrieved, it saves the token securely using `saveSecureItem`.
 * If the token has changed since the last saved token, it updates the stored token.
 **/
export async function fetchAndSavePushToken(): Promise<boolean> {
  const { status } = await getPermissionsAsync();

  if (status !== 'granted' || !Device.isDevice) {
    console.warn('Notifications not enabled or not on a device');
    return false;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn('No project ID found in app configuration');
    return false;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const oldToken = await getSecureItem('pushToken');

    if (token !== oldToken || !oldToken) {
      await saveSecureItem('pushToken', token);
      await syncPushToken(token); // Sync the token with the backend
    }

    console.log('Push token saved successfully:', token);
    return true;
  } catch (err) {
    console.warn('Failed Fetch and Save Push Token:', err);
    return false;
  }
}
