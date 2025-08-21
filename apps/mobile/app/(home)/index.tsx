import { Pressable, ScrollView, Text, View } from 'react-native';
import UIButton from '@/components/ui/UIButton';
import { useEffect, useState } from 'react';
import LogStack, { MoodStackItem, useLogStack } from '@/components/LogStack';
import {
  analyseMoodScales,
  getHighestMoodScale,
} from '@/utils/analyseMoodScore';
import { capitaliseFirstLetter } from '@/utils/capitalise';
import HomeLinks from '@/components/HomeLinks';
import Colors from '@/constants/Colors';
import { useMoodLogs } from '@/context/moodLogContext';
import { formatShortDate } from '@/utils/dateFormatter';
import { useAuthStore } from '@/store/useAuthStore';

const HomeIndex = () => {
  const { user } = useAuthStore();
  const { isLogStackOpen, openLogStack, closeLogStack } = useLogStack();
  const { items: moodLogs } = useMoodLogs();
  const [moodStack, setMoodStack] = useState<MoodStackItem[]>([]);

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

  useEffect(() => {
    console.log('moodLogs changed');
    const formattedMoodStack = moodLogs.map((log) => ({
      moodLogId: log.id,
      mood: analyseMoodScales(log).score,
      date: formatShortDate(log.createdAt),
      broadcasted: log.beaconBroadcasted,
      highestScale: getHighestMoodScale({
        sadnessScale: log.sadnessScale,
        stressScale: log.stressScale,
        anxietyScale: log.anxietyScale,
      }),
    }));
    setMoodStack(formattedMoodStack);
  }, [moodLogs]);

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
          <LogStack isOpen={isLogStackOpen} moodStack={moodStack} />
        </Pressable>
        <UIButton
          variant="ghost"
          buttonClassName="self-end mt-2"
          textClassName="font-normal"
          href="/(home)/moodReview"
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
          linkTo="/(mood-logging)?mode=daily-log"
          disablePress={user?.appConfig?.hasCompletedDailyCheckIn}
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
