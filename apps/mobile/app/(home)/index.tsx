import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/authContext';
import { useNotification } from '@/context/notificationContext';
import UIButton from '@/components/ui/UIButton';
import { requestNotificationPermissions } from '@/lib/requestNotificationPermissions';
import { useEffect } from 'react';
import { Link } from 'expo-router';
import * as Notifications from 'expo-notifications';

const HomeIndex = () => {
  const { logout } = useAuth();
  const { hasNotificationsEnabled } = useNotification();

  useEffect(() => {
    // const sendTestNotification = async () => {
    //   await Notifications.scheduleNotificationAsync({
    //     content: {
    //       title: '🚨 Test Notification',
    //       body: 'This is a test. It should take you to do a daily log.',
    //       data: {
    //         route: '/(mood-logging)?mode=daily-log',
    //       },
    //     },
    //     trigger: {
    //       type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    //       seconds: 5,
    //     }, // fire in 5 seconds
    //   });
    // };
    // sendTestNotification();
  }, []);

  return (
    <View className="mt-safe">
      <Text>Welcome to home page!</Text>
      <Link href="/(mood-logging)?mode=daily-log">
        <Text className="text-blue-500">Go to Mood Logging</Text>
      </Link>
    </View>
  );
};

export default HomeIndex;
