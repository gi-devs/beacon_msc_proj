import { Linking, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/authContext';
import UIButton from '@/components/ui/UIButton';
import {
  requestNotificationPermissions,
  toggleDailyCheckInNotification,
} from '@/lib/notification';
import { useNotification } from '@/context/notificationContext';
import { resetApp } from '@/utils/devMode';
import { getLocation, requestLocationPermissions } from '@/lib/location';
import { useLocation } from '@/context/locationContext';

const Profile = () => {
  const { logout, user } = useAuth();
  const { hasNotificationsEnabled } = useNotification();
  const { isLocationEnabled } = useLocation();
  return (
    <View className="mt-safe">
      <Text>You are: {user?.username || "can't get username"}</Text>
      {/*Should clear a storage items for this user if they log out LIKE IN DEV MODE*/}
      <TouchableOpacity onPress={logout}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
      <View>
        <Text className="text-center text-2xl font-bold">
          {hasNotificationsEnabled
            ? 'Your notifications are enabled!'
            : 'Beacon is better with notifications!'}
        </Text>
        <Text className="text-center text-2xl font-bold">
          {isLocationEnabled
            ? 'Location is enabled'
            : 'Location is not enabled'}
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
        onPress={() => {
          void logout();
          void resetApp();
        }}
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
      <UIButton
        variant="ghost"
        onPress={() => requestLocationPermissions()}
        buttonClassName="mt-4"
      >
        Request location permissions
      </UIButton>
      <UIButton
        variant="ghost"
        onPress={async () => {
          console.log(await getLocation());
        }}
        buttonClassName="mt-4"
      >
        Get location
      </UIButton>
      <UIButton
        variant="ghost"
        onPress={async () => {
          if (Platform.OS === 'ios') {
            return await Linking.openURL('app-settings:');
          }

          if (Platform.OS === 'android') {
            return await Linking.openSettings();
          }
        }}
        buttonClassName="mt-4"
      >
        App settings
      </UIButton>
    </View>
  );
};

export default Profile;
