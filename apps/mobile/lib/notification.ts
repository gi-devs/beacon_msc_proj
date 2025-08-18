import * as Notifications from 'expo-notifications';
import {
  getPermissionsAsync,
  SchedulableTriggerInputTypes,
} from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Alert, Linking, Platform } from 'react-native';
import {
  getSecureItem,
  saveSecureItem,
  SecureItemKey,
} from '@/lib/secureStore';
import { syncPushToken } from '@/api/pushTokenApi';
import {
  AsyncItemKey,
  deleteAsyncItem,
  getAsyncItem,
  saveAsyncItem,
} from '@/lib/aysncStorage';
import { updateNotificationSettingRequest } from '@/api/notificationSettingApi';

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

  try {
    console.log(
      '[notification.ts] Updating server push notification setting to true',
    );
    await updateServerPushNotificationSetting(true);
  } catch (error) {
    console.error('Failed to update notification setting:', error);
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
    const oldToken = await getSecureItem(SecureItemKey.PushToken);

    if (token !== oldToken || !oldToken) {
      await saveSecureItem(SecureItemKey.PushToken, token);
      await syncPushToken(token); // Sync the token with the backend
    }

    console.log('Push token saved successfully:', token);
    return true;
  } catch (err) {
    console.warn('Failed Fetch and Save Push Token:', err);
    return false;
  }
}

export async function checkLocalStorageAndUpdatePushSetting() {
  const hasPushNotificationsEnabled = await getAsyncItem(
    AsyncItemKey.HasPushNotificationsEnabled,
  );
  const granted = await getNotificationPermissions();

  if (hasPushNotificationsEnabled === null) {
    await updateServerPushNotificationSetting(granted);
    console.log('[notification.ts] First-time push setting sync:', granted);
    return true;
  }

  const storedEnabled = hasPushNotificationsEnabled === 'true';

  if (!granted && storedEnabled) {
    await updateServerPushNotificationSetting(false);
    console.log(
      '[notification.ts] Push notifications disabled by user, updating server setting',
    );
    return true;
  }

  if (granted && !storedEnabled) {
    await updateServerPushNotificationSetting(true);
    console.log(
      '[notification.ts] Push notifications enabled by user, updating server setting',
    );
    return true;
  }

  console.log(
    '[notification.ts] No changes needed for push notification setting',
  );
  return false;
}

export async function toggleDailyCheckInNotification() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus !== 'granted') return; // exit if permissions are not granted

  const existing = await Notifications.getAllScheduledNotificationsAsync();
  const storedId = await getAsyncItem(AsyncItemKey.DailyCheckInNotificationId); // <- key name fix
  const existingNotification = existing.find(
    (n) => n.content?.data?.key === 'DAILY_CHECK_IN',
  );

  if (storedId || existingNotification) {
    // Turn off the notification
    if (storedId) {
      await Notifications.cancelScheduledNotificationAsync(storedId);
    } else if (existingNotification) {
      await Notifications.cancelScheduledNotificationAsync(
        existingNotification.identifier,
      );
    }

    await deleteAsyncItem(AsyncItemKey.DailyCheckInNotificationId); // <- key name fix

    if (__DEV__) {
      const allScheduledKeys = await getScheduledKeys();

      console.log(
        '[Notifs]Daily check-in notification, remaining keys:',
        allScheduledKeys,
      );
    }

    return; // toggled off
  }

  // Schedule new notification
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hey there! How you feeling today?',
      body: 'Logging your mood helps you understand yourself better.',
      data: {
        route: '/(mood-logging)?mode=daily-log',
        key: 'DAILY_CHECK_IN',
      },
    },
    // TODO: Allow user to change the time in settings
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: 14,
      minute: 30,
    },
  });

  await saveAsyncItem(AsyncItemKey.DailyCheckInNotificationId, id); // <- key name fix

  if (__DEV__) {
    console.log('[Notifs] Daily check-in scheduled:', id);
  }

  return; // toggled on
}

async function getScheduledKeys() {
  const allScheduled = await Notifications.getAllScheduledNotificationsAsync();

  return allScheduled
    .map((n) => n.content?.data?.key)
    .filter((key): key is string => typeof key === 'string');
}

// ---------------------------
//    Notification helpers
// ---------------------------

export async function getNotificationPermissions() {
  const { granted } = await getPermissionsAsync();
  return granted;
}

export async function updateServerPushNotificationSetting(
  enabled: boolean,
): Promise<void> {
  try {
    console.log('[notification.ts] pushing...');
    await updateNotificationSettingRequest({
      push: enabled,
    });
    await saveAsyncItem(
      AsyncItemKey.HasPushNotificationsEnabled,
      String(enabled),
    );
  } catch (error) {
    console.error('Failed to update notification setting:', error);
  }
}

export async function pushLocalBeaconNotification(): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New Notification',
        body: "Someone just put up a beacon near you, why don't you send them something nice!",
        data: {
          dataType: 'BEACON_NOTIFICATION',
          beaconId: 12,
          notificationId: 156,
          receiverUserId: 'cmdmdvby00000fd65z35q7fm5',
          beaconExpiresAt: '2025-08-19T03:00:09.160Z',
          route: '/(beacon)/reply',
        },
      },
      trigger: null, // immediate notification
    });
  } catch (error) {
    console.error('Failed to push local notification:', error);
  }
}
