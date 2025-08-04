import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/authContext';
import { useNotification } from '@/context/notificationContext';
import UIButton from '@/components/ui/UIButton';
import { requestNotificationPermissions } from '@/lib/requestNotificationPermissions';
import { useEffect } from 'react';
// import * as Notifications from 'expo-notifications';

const HomeIndex = () => {
  const { logout } = useAuth();
  const { hasNotificationsEnabled } = useNotification();

  useEffect(() => {
    // const sendTestNotification = async () => {
    //   await Notifications.scheduleNotificationAsync({
    //     content: {
    //       title: '🚨 Test Notification',
    //       body: 'This is a test. Everything is working!',
    //       data: {
    //         route: '/(home)/settings',
    //       },
    //     },
    //     trigger: {
    //       type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    //       seconds: 10,
    //     }, // fire in 5 seconds
    //   });
    // };
    // sendTestNotification();
  }, []);

  return (
    <View className="mt-safe">
      <Text>Welcome to home page!</Text>
    </View>
  );
};

export default HomeIndex;
