import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/authContext';
import UIButton from '@/components/ui/UIButton';
import { requestNotificationPermissions } from '@/lib/notification';
import { useNotification } from '@/context/notificationContext';

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
    </View>
  );
};

export default Profile;
