import { Pressable, ScrollView, Text, View } from 'react-native';
import UIButton from '@/components/ui/UIButton';
import { useEffect } from 'react';
import LogStack, { useLogStack } from '@/components/LogStack';
import { getHighestMoodScale } from '@/utils/analyseMoodScore';
import { capitaliseFirstLetter } from '@/utils/capitalise';
import HomeLinks from '@/components/HomeLinks';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/authContext';

const HomeIndex = () => {
  const { user } = useAuth();
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
      style={{ marginBottom: 100 }}
    >
      <View>
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
      <Text className="text-5xl font-medium mb-4 leading-tight tracking-widest">
        How Are You Feeling
      </Text>
      <View className="gap-6 pb-8">
        <HomeLinks
          color={Colors.app.ripple['200']}
          title="Complete Daily Check In"
          imgSrc={require('../../assets/items/beacon_circle.png')}
        />
        <HomeLinks
          color="#F5AD4A"
          title="Journal Entry"
          imgSrc={require('../../assets/items/cut_journal_pen.png')}
          imageOffsetX={50}
          imageSize={230}
          linkTo="/(mood-logging)/journal"
        />
        <HomeLinks
          color="#CE0060"
          title="Send Out Affirmations"
          imgSrc={require('../../assets/items/connected_globe.png')}
          imageOffsetX={10}
        />
      </View>
    </ScrollView>
  );
};

export default HomeIndex;
