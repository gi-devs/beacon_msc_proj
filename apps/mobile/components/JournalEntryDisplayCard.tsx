import { Pressable, Text, View } from 'react-native';
import { getMoodColor } from '@/utils/computeColour';
import {
  formateTo24HourTime,
  formatShortDate,
  getDayOfWeek,
} from '@/utils/dateFormatter';
import { truncateText } from '@/utils/truncatedText';
import { JournalEntryDTO } from '@beacon/types';
import { usePressScaleAnimation } from '@/hooks/ui/usePressScaleAnimation';
import { useRouter } from 'expo-router';

const JournalEntryDisplayCard = ({
  journalEntry,
}: {
  journalEntry: JournalEntryDTO;
}) => {
  const router = useRouter();
  const { handleVibration } = usePressScaleAnimation();
  return (
    <Pressable
      className="p-4 mb-4 border-gray-200 bg-white rounded-md"
      style={{
        borderColor: getMoodColor(journalEntry.moodFace),
        borderWidth: 1,
      }}
      onPress={() => {
        handleVibration();
        router.push({
          pathname: '/(home)/entry-details/journal-entry/[id]',
          params: { id: journalEntry.id },
        });
      }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row">
          <Text className="text-gray-600">
            {getDayOfWeek(journalEntry.createdAt)} -{' '}
          </Text>
          <Text className="text-gray-600">
            {formatShortDate(journalEntry.createdAt, true)}
          </Text>
        </View>
        <Text className="text-gray-600">
          {formateTo24HourTime(journalEntry.createdAt)}
        </Text>
      </View>
      <View className="flex-col gap-1">
        <Text className="text-xl font-semibold">{journalEntry.title}</Text>
        <Text className="leading-normal font-light">
          {truncateText(journalEntry.content, 120)}
        </Text>
      </View>
    </Pressable>
  );
};

export default JournalEntryDisplayCard;
