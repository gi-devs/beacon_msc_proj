import { Pressable, ScrollView, Text, View } from 'react-native';
import UIButton from '@/components/ui/UIButton';
import LogStack, { useLogStack } from '@/components/LogStack';
import { capitaliseFirstLetter } from '@/utils/capitalise';
import HomeLinks from '@/components/HomeLinks';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/store/useAuthStore';
import HeaderWithRouteUI from '@/components/ui/HeaderWithRouteUI';
import { SafeWrapper } from '@/components/utils/SafeWrapper';

const HomeIndex = () => {
  const { user } = useAuthStore();
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

  return (
    <SafeWrapper className="flex-1">
      <HeaderWithRouteUI header="Home" />
      <ScrollView
        className="flex-1"
        onTouchEnd={() => {
          if (isLogStackOpen) {
            closeLogStack();
          }
        }}
      >
        <View>
          <Text className="mt-4 text-xl">Recent logs</Text>
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
            <LogStack isOpen={isLogStackOpen} />
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
        <View className="gap-6 mb-8">
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
            linkTo="/(beacon)"
          />
        </View>
      </ScrollView>
    </SafeWrapper>
  );
};

export default HomeIndex;
