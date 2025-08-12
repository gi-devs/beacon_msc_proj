import RippleCircles from '@/components/RippleCircles';
import { useLogCreator } from '@/context/logCreatorContext';
import { createDailyLogRequest } from '@/api/moodLoggerApi';
import { parseToSeverError } from '@/utils/parseToSeverError';
import { Toast } from 'toastify-react-native';
import { useRouter } from 'expo-router';

const Broadcast = () => {
  const { shouldBroadcast, createJournalEntryData, createMoodLogData } =
    useLogCreator();
  const router = useRouter();

  const sendDataWithBroadcast = async () => {
    try {
      const data = {
        moodLog: createMoodLogData,
        journalEntry: createJournalEntryData,
        shouldBroadcast,
      };

      await new Promise((resolve) => setTimeout(resolve, 10000));

      await createDailyLogRequest(data);
      Toast.success('Mood logged and beacon sent successfully!');
    } catch (error) {
      console.error('Error sending broadcast:', error);
      const parsedError = parseToSeverError(error);

      Toast.error(parsedError.message);
      throw error;
    }
  };

  return (
    <RippleCircles
      callback={sendDataWithBroadcast}
      onAnimateEnd={() => {
        router.replace('/(home)');
      }}
    />
  );
};

export default Broadcast;
