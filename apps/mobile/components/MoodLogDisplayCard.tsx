import { Pressable, Text, View } from 'react-native';
import { getMoodColor } from '@/utils/computeColour';
import {
  formateTo24HourTime,
  formatShortDate,
  getDayOfWeek,
} from '@/utils/dateFormatter';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { usePressScaleAnimation } from '@/hooks/ui/usePressScaleAnimation';
import { MoodLogDTO, MoodLogWithBeaconCheck } from '@beacon/types';
import { analyseMoodScales } from '@/utils/analyseMoodScore';

const MoodLogDisplayCard = ({
  moodLogEntry,
}: {
  moodLogEntry: MoodLogWithBeaconCheck | MoodLogDTO;
}) => {
  const router = useRouter();
  const { handleVibration } = usePressScaleAnimation();
  const { score } = analyseMoodScales(moodLogEntry);

  const isMoodLogWithBeaconCheck = (
    entry: MoodLogDTO | MoodLogWithBeaconCheck,
  ): entry is MoodLogWithBeaconCheck => {
    return 'beaconBroadcasted' in entry || 'isDailyCheckIn' in entry;
  };

  return (
    <Pressable
      className="p-4 mb-2 border-gray-200 relative bg-white"
      onPress={() => {
        handleVibration();
        router.push({
          pathname: '/(home)/entry-details/mood-log/[id]',
          params: { id: moodLogEntry.id },
        });
      }}
    >
      <View
        style={{
          backgroundColor: getMoodColor(score),
        }}
        className="w-1 absolute left-0 top-2 bottom-2"
      />
      <View className="flex-row justify-between items-center">
        <View className="flex-col gap-2 items-start">
          <Text className="text-gray-600">
            {getDayOfWeek(moodLogEntry.createdAt)}{' '}
          </Text>
          <Text className="text-gray-600">
            {formatShortDate(moodLogEntry.createdAt)}
          </Text>
        </View>
        <View className="flex-col gap-2 items-end">
          <Text className="font-semibold">
            {formateTo24HourTime(moodLogEntry.createdAt)}
          </Text>
          {isMoodLogWithBeaconCheck(moodLogEntry) && (
            <View className="flex-row gap-1">
              {moodLogEntry.beaconBroadcasted && (
                <MaterialCommunityIcons
                  name="broadcast"
                  size={20}
                  color={Colors.app.ripple['100']}
                />
              )}
              {moodLogEntry.isDailyCheckIn && (
                <MaterialCommunityIcons
                  name="calendar-today"
                  size={20}
                  color="black"
                />
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default MoodLogDisplayCard;
