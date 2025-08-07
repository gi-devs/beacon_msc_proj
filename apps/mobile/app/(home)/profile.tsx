import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/authContext';
import UIButton from '@/components/ui/UIButton';
import {
  requestNotificationPermissions,
  toggleDailyCheckInNotification,
} from '@/lib/notification';
import { useNotification } from '@/context/notificationContext';
import { resetApp } from '@/utils/devMode';

const Profile = () => {
  const { logout } = useAuth();
  const { hasNotificationsEnabled } = useNotification();
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
          <Text className="text-center text-lg">
            Settings page is under construction
          </Text>
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
      <UIButton
        variant="destructive"
        size="sm"
        onPress={() => resetApp()}
        buttonClassName="mt-4"
      >
        Reset App
      </UIButton>
      <UIButton
        variant="ghost"
        onPress={() => toggleDailyCheckInNotification()}
        buttonClassName="mt-4"
      >
        Toggle Daily Check-In Notification
      </UIButton>
    </View>
  );
};

export default Profile;
