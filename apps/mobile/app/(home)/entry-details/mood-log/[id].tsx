import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeWrapper } from '@/components/utils/SafeWrapper';
import {
  MoodLogWithBeaconCheckExtended,
  useMoodLogs,
} from '@/context/moodLogContext';
import { useEffect, useState } from 'react';
import { Toast } from 'toastify-react-native';
import MoodLogDetail from '@/components/MoodLogDetail';
import DateTimeDisplay from '@/components/DateTimeDisplay';
import { useJournalEntries } from '@/context/journalEntryContext';
import { JournalEntryDTO } from '@beacon/types';
import { getJournalEntryByMoodLogIdRequest } from '@/api/moodLoggerApi';
import JournalEntryDisplayCard from '@/components/JournalEntryDisplayCard';
import Colors from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MoodLogReview = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { items, fetchSingle, updateSingleItem } = useMoodLogs();
  const { items: journalItems } = useJournalEntries();
  const [selected, setSelected] =
    useState<MoodLogWithBeaconCheckExtended | null>(null);
  const [journalEntry, setJournalEntry] = useState<JournalEntryDTO | null>(
    null,
  );

  useEffect(() => {
    const failed = (message = 'Mood log not found') => {
      Toast.error(message);
      router.push('/(home)');
    };

    const getDetail = async () => {
      try {
        if (!id) return failed();

        const parsedId = parseInt(id as string, 10);
        if (isNaN(parsedId)) return failed();

        const found = items.find((item) => item.id === parsedId);

        if (found) {
          setSelected(found);
        } else {
          const fetched = await fetchSingle(parsedId);
          if (fetched) {
            setSelected(fetched);
          } else {
            failed();
          }
        }
      } catch (e) {
        failed();
      }
    };
    setJournalEntry(null);
    setSelected(null);

    void getDetail();
  }, [id]);

  useEffect(() => {
    const getJournalEntry = async () => {
      if (!selected) return;

      if (selected.journalEntryId) {
        const journal = journalItems.find(
          (item) => item.id === selected.journalEntryId,
        );
        if (journal) {
          setJournalEntry(journal);
          return;
        }
      }

      try {
        const fetched = await getJournalEntryByMoodLogIdRequest(selected.id);
        if (fetched) {
          setJournalEntry(fetched);
          updateSingleItem({ ...selected, journalEntryId: fetched.id });
        }
      } catch (error) {
        console.error('Failed to fetch journal entry:', error);
      }
    };

    void getJournalEntry();
  }, [selected]);

  if (!selected) {
    return (
      <SafeWrapper>
        <Text>Loading...</Text>
      </SafeWrapper>
    );
  }

  return (
    <SafeWrapper className="flex-1 pb-0">
      <ScrollView>
        <DateTimeDisplay date={selected.createdAt} />
        <MaterialCommunityIcons
          name="broadcast"
          size={24}
          color={Colors.app.ripple['100']}
          style={{ marginBottom: 8 }}
        />
        <MoodLogDetail moodLog={selected} />
        <View className="mt-4">
          <Text className="text-xl text-gray-600 my-4">Journal Entry:</Text>
          {journalEntry ? (
            <JournalEntryDisplayCard journalEntry={journalEntry} />
          ) : (
            <Text>No journal entry.</Text>
          )}
        </View>
      </ScrollView>
    </SafeWrapper>
  );
};

export default MoodLogReview;
