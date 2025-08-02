import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/authContext';
import { useNotification } from '@/context/notificationContext';
import UIButton from '@/components/ui/UIButton';
import { requestNotificationPermissions } from '@/lib/requestNotificationPermissions';
import { useEffect } from 'react';
import { getSecureItem, saveSecureItem } from '@/lib/secureStore';

const HomeIndex = () => {
  const { logout } = useAuth();
  const { hasNotificationsEnabled } = useNotification();

  useEffect(() => {
    const askForNotificationsFirstTime = async () => {
      if (hasNotificationsEnabled) return;

      const askedForNotifications = await getSecureItem(
        'askedForNotifications',
      );

      if (askedForNotifications === 'true')
        return console.log('User has already been asked for notifications.');

      await requestNotificationPermissions();
      await saveSecureItem('askedForNotifications', 'true');
    };

    askForNotificationsFirstTime();
  }, []);

  return (
    <View className="mt-safe">
      <Text>AUTHED IN</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Sign Out</Text>
      </TouchableOpacity>

      <View>
        <Text className="text-center text-2xl font-bold">
          {hasNotificationsEnabled
            ? 'Your notifications are enabled!'
            : 'Beacon is better with notifications!'}
        </Text>
        {hasNotificationsEnabled ? (
          <Text className="text-center text-lg">Welcome to the Home Page!</Text>
        ) : (
          <UIButton
            onPress={async () => {
              await requestNotificationPermissions();
            }}
          >
            Click here to enable notifications
          </UIButton>
        )}
      </View>
    </View>
  );
};

export default HomeIndex;
