import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import UIButton from '@/components/ui/UIButton';
import {
  pushLocalBeaconNotification,
  requestNotificationPermissions,
  toggleDailyCheckInNotification,
} from '@/lib/notification';
import { useNotification } from '@/context/notificationContext';
import { resetApp } from '@/utils/devMode';
import { getLocation, requestLocationPermissions } from '@/lib/location';
import { useLocation } from '@/context/locationContext';
import { Link } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { SafeWrapper } from '@/components/utils/SafeWrapper';
import HeaderWithRouteUI from '@/components/ui/HeaderWithRouteUI';
import { AntDesign } from '@expo/vector-icons';

const Profile = () => {
  const { logout, user } = useAuthStore();
  const { hasNotificationsEnabled, dailyScheduled, setDailyScheduled } =
    useNotification();
  const { isLocationEnabled } = useLocation();
  return (
    <SafeWrapper className="flex-1">
      <HeaderWithRouteUI header="Settings" />
      <ScrollView className="flex-1 py-8">
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-center text-2xl font-bold capitalize">
              {user?.username || "can't get username"}
            </Text>
            <Pressable onPress={logout}>
              <AntDesign name="login" size={24} color="black" />
            </Pressable>
          </View>
          <View>
            <View className="w-full h-px bg-gray-300 mb-4" />
            <Text className="text-2xl mb-2">Notifications</Text>
            <View className="flex-row items-center justify-between mb-4">
              <Text>
                {hasNotificationsEnabled
                  ? 'Your notifications are enabled!'
                  : 'Beacon is better with notifications!'}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text>Daily log notifications</Text>
              <Switch
                value={dailyScheduled}
                onValueChange={async () => {
                  const isOn = await toggleDailyCheckInNotification();
                  setDailyScheduled(isOn);
                }}
              />
            </View>
          </View>
          <View>
            <View className="w-full h-px bg-gray-300 mb-4" />
            <Text className="text-2xl mb-2">Locations</Text>
            <View className="flex-row items-center justify-between">
              <Text>
                {isLocationEnabled
                  ? 'Location is enabled'
                  : 'Location is not enabled'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeWrapper>
  );
};

export default Profile;
