import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/context/authContext';
import { useNotification } from '@/context/notificationContext';
import UIButton from '@/components/ui/UIButton';
import { requestNotificationPermissions } from '@/lib/notification';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import * as Notifications from 'expo-notifications';
import LogStack, { useLogStack } from '@/components/LogStack';
import { getHighestMoodScale } from '@/utils/analyseMoodScore';
import { capitaliseFirstLetter } from '@/utils/capitalise';

const HomeIndex = () => {
  const { logout, user } = useAuth();
  const { hasNotificationsEnabled } = useNotification();
  const { isLogStackOpen, openLogStack, closeLogStack } = useLogStack();

  const greetingTimeText = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return 'Good Morning';
    } else if (currentHour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  const tempMoodStack = [
    {
      mood: 90,
      date: '2023-10-01',
      broadcasted: false,
      highestScale: getHighestMoodScale({
        sadnessScale: 80,
        stressScale: 97,
        anxietyScale: 99,
      }),
    },
    {
      mood: 67,
      date: '2023-10-02',
      broadcasted: true,
      highestScale: getHighestMoodScale({
        sadnessScale: 60,
        stressScale: 70,
        anxietyScale: 75,
      }),
    },
    {
      mood: 46,
      date: '2023-10-03',
      broadcasted: false,
      highestScale: getHighestMoodScale({
        sadnessScale: 40,
        stressScale: 50,
        anxietyScale: 45,
      }),
    },
  ];

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
    <ScrollView
      className="mt-safe px-6 w-full"
      onTouchEnd={() => {
        if (isLogStackOpen) {
          closeLogStack();
        }
      }}
    >
      <View className="">
        <Text className="mt-4 mb-2 text-xl">Recent logs</Text>
        <Pressable
          onTouchEnd={(e) => {
            e.stopPropagation(); // prevents ScrollView onTouchEnd
          }}
          onPress={(e) => {
            e.stopPropagation();
            if (!isLogStackOpen) {
              openLogStack();
            }
          }}
        >
          <LogStack isOpen={isLogStackOpen} moodStack={tempMoodStack} />
        </Pressable>
        <UIButton
          variant="ghost"
          buttonClassName="self-end mt-2"
          textClassName="font-normal"
        >
          View all
        </UIButton>
      </View>
      <Text className="mt-4 mb-2 font-light">
        {greetingTimeText() +
          ', ' +
          capitaliseFirstLetter(user?.username || 'user')}
      </Text>
      <Text className="text-4xl font-medium mb-4 leading-tight max-sm:max-w-64 tracking-widest">
        How Are You Feeling
      </Text>
    </ScrollView>
  );
};

export default HomeIndex;
