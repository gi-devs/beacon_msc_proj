import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeWrapper } from '@/components/utils/SafeWrapper';
import { useMoodLogs } from '@/context/moodLogContext';
import { useEffect, useState } from 'react';
import { MoodLogWithBeaconCheck } from '@beacon/types';
import { Toast } from 'toastify-react-native';

const MoodLogReview = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { items, fetchSingle } = useMoodLogs();
  const [selected, setSelected] = useState<MoodLogWithBeaconCheck | null>(null);

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

  return (
    <SafeWrapper>
      <Text>Review Mood Log ID: {id}</Text>
      <Text>
        {selected?.id}
        {selected?.beaconBroadcasted && 'broadcasted'}
      </Text>
    </SafeWrapper>
  );
};

export default MoodLogReview;
