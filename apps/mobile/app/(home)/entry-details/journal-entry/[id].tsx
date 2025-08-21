import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeWrapper } from '@/components/utils/SafeWrapper';
import { useEffect, useState } from 'react';
import { Toast } from 'toastify-react-native';
import MoodFace from '@/components/MoodFace';
import {
  JournalEntryDTOExtended,
  useJournalEntryStore,
} from '@/store/useJournalEntryStore';
import { getMoodColor } from '@/utils/computeColour';
import { formateTo24HourTime, getFullDateString } from '@/utils/dateFormatter';
import { getMoodLogByJournalEntryIdRequest } from '@/api/moodLoggerApi';
import { MoodLogDTO } from '@beacon/types';
import { useMoodLogStore } from '@/store/useMoodLogStore';
import MoodLogDisplayCard from '@/components/MoodLogDisplayCard';
import { useGetDetail } from '@/hooks/effects/useGetDetails';
import { useRelatedEntity } from '@/hooks/effects/useRelatedEntity';

const MoodLogReview = () => {
  const { id } = useLocalSearchParams();
  const { items, fetchSingle, updateSingleItem } = useJournalEntryStore();
  const { items: moodLogItems } = useMoodLogStore();
  const selected = useGetDetail({ id, items, fetchSingle });
  const moodLog = useRelatedEntity({
    selected,
    selectedRelatedId: selected?.moodLogId,
    storeItems: moodLogItems,
    fetchBySelectedId: getMoodLogByJournalEntryIdRequest,
    updateSelected: updateSingleItem,
  });

  if (!selected) {
    return (
      <SafeWrapper>
        <Text>Loading...</Text>
      </SafeWrapper>
    );
  }

  return (
    <SafeWrapper>
      <ScrollView>
        <View className="my-8 flex items-center">
          <MoodFace mood={selected.moodFace} animated={false} size={100} />
        </View>
        <View
          className="bg-white p-4 rounded-md flex-1"
          style={{
            borderColor: getMoodColor(selected.moodFace),
            borderWidth: 1,
          }}
        >
          <View>
            <Text className="text-lg text-gray-600">
              {getFullDateString(selected.createdAt)}
            </Text>
            <Text className="text-base text-gray-600">
              {formateTo24HourTime(selected.createdAt)}
            </Text>
          </View>
          <Text className="text-2xl font-bold mt-4">{selected.title}</Text>
          <Text className="mt-2 text-base text-justify">
            {selected.content}
          </Text>
        </View>
        {moodLog && (
          <View>
            <Text className="text-xl text-gray-600 my-4">
              Mood Log Details:
            </Text>
            <MoodLogDisplayCard moodLogEntry={moodLog} />
          </View>
        )}
      </ScrollView>
    </SafeWrapper>
  );
};

export default MoodLogReview;
