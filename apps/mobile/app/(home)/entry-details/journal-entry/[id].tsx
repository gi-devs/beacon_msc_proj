import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeWrapper } from '@/components/utils/SafeWrapper';
import { useEffect, useState } from 'react';
import { JournalEntryDTO } from '@beacon/types';
import { Toast } from 'toastify-react-native';
import MoodFace from '@/components/MoodFace';
import { useJournalEntryStore } from '@/store/useJournalEntryStore';

const MoodLogReview = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { items, fetchSingle } = useJournalEntryStore();
  const [selected, setSelected] = useState<JournalEntryDTO | null>(null);

  useEffect(() => {
    const failed = (message = 'Mood log not found') => {
      Toast.error(message);
      router.push('/(home)');
    };

    const getDetail = async () => {
      try {
        if (!id) failed();

        const parsedId = parseInt(id as string, 10);

        if (isNaN(parsedId)) failed();

        const found = items.find((item) => item.id === parsedId);

        if (found) {
          setSelected(found);
          return;
        } else {
          // TODO: fetch from server if not found in context
          const fetched = await fetchSingle(parsedId);

          if (fetched) {
            setSelected(fetched);
            return;
          }
        }

        failed();
      } catch (e) {
        failed();
        router.push('/(home)');
      }
    };

    void getDetail();
  }, [id]);

  if (!selected) {
    return (
      <SafeWrapper>
        <Text>Loading...</Text>
      </SafeWrapper>
    );
  }

  return (
    <SafeWrapper>
      <Text>Review Mood Log ID: {id}</Text>
      <Text>{<MoodFace mood={selected.moodFace} animated={false} />}</Text>
    </SafeWrapper>
  );
};

export default MoodLogReview;
