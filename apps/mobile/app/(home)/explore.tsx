import { SafeWrapper } from '@/components/utils/SafeWrapper';
import SixMonthMoodBarGraph from '@/components/graphs/SixMonthMoodBarGraph';
import TodayMoodLineChart from '@/components/graphs/TodayMoodLineGraph';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Explore = () => {
  const router = useRouter();
  return (
    <SafeWrapper>
      <View className="my-2 flex-row justify-between items-center">
        <Text className="text-lg">Explore</Text>
        <Pressable
          onPress={() => {
            router.push('/(home)/(community)');
          }}
        >
          <MaterialIcons name="people-alt" size={24} color="black" />
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="my-8 mb-4">
          <Text className="text-3xl">
            Explore your mood patterns and insights over time.
          </Text>
          <Text className="text-sm text-gray-400 mt-2">
            Note: Higher scores reflect stronger levels of stress, anxiety, or
            sadness. Lower scores indicate calmer, more positive moods.
          </Text>
        </View>
        <TodayMoodLineChart />
        <SixMonthMoodBarGraph />
        <View className="mb-8">
          <Text className="font-semibold block text-base">
            Why do higher score indicate worst moods?
          </Text>
          <Text className="text-base mb-4">
            Beacon aims to help you understand periods of distress in your life,
            This allows you to better see negative trend and patterns in your
            mood.
          </Text>
          <Text className="font-semibold block text-base">
            Why are these patterns important?
          </Text>
          <Text className="text-base">
            For example, you may notice you feel more anxious during working
            hours. This gives you the opportunity to reflect on potential causes
            and work on strategies to improve your mental health.
          </Text>
        </View>
      </ScrollView>
    </SafeWrapper>
  );
};

export default Explore;
