import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useScroll } from '@/context/scrollContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { analyseMoodScales } from '@/utils/analyseMoodScore';
import { useLogCreator } from '@/context/logCreatorContext';
import { useState } from 'react';
import UIButton from '@/components/ui/UIButton';
import { createDailyLogRequest } from '@/api/moodLoggerApi';
import { Toast } from 'toastify-react-native';
import { CreateJournalEntryData } from '@beacon/validation';
import { parseToSeverError } from '@/utils/parseToSeverError';
import JournalEntryForm from '@/components/form/forms/JournalEntryForm';

const Journal = () => {
  const { setHasScrolled } = useScroll();
  const router = useRouter();
  const { mode, noLocationServices } = useLocalSearchParams();
  const {
    createMoodLogData,
    setShouldBroadcast,
    shouldBroadcast,
    createJournalEntryData,
  } = useLogCreator();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCallback, setModalCallback] = useState<
    ((value: boolean) => void) | null
  >(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    setHasScrolled(y > 0);
  };

  const handlePost = async (
    journalEntryDataFromForm: CreateJournalEntryData,
  ) => {
    if (mode === 'daily-log') {
      // daily log post logic
      const { shouldPromptBroadcast } = analyseMoodScales(createMoodLogData);

      let wantsBroadcast = false;

      if (shouldPromptBroadcast && !noLocationServices) {
        wantsBroadcast = await showBroadcastPrompt();
        setShouldBroadcast(wantsBroadcast);
      }

      if (wantsBroadcast) {
        return router.push('/(mood-logging)/broadcast');
      }

      try {
        const data = {
          moodLog: createMoodLogData,
          journalEntry: journalEntryDataFromForm,
          shouldBroadcast,
        };
        const res = await createDailyLogRequest(data);

        if (res) {
          Toast.success('Daily log created successfully!');
          router.push('/(home)');
        }
      } catch (error) {
        console.error('Error creating daily log:', error);

        const parsedError = parseToSeverError(error);
        Toast.error(parsedError.message || 'Failed to create daily log');
      }
    } else {
      router.push('/(home)');
    }
  };

  const showBroadcastPrompt = (): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalCallback(() => resolve);
      setModalVisible(true);
    });
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View className="flex-1 justify-center items-center ">
          <View
            className="absolute inset-0 bg-gray-800/80"
            onTouchEnd={() => setModalVisible(false)}
          />
          <View className="bg-white h-1/2 rounded-lg p-6 w-11/12 max-w-md justify-center gap-16">
            <UIButton
              buttonClassName="absolute top-6 left-6"
              variant="ghost"
              onPress={() => setModalVisible(false)}
            >
              Back
            </UIButton>
            <View>
              <Text className="text-2xl font-medium mb-4">
                Hey sorry you're having a rough time :(
              </Text>
              <Text>
                Would you like to send a beacon and so other people can check up
                on you?
              </Text>
            </View>

            <View className="gap-4">
              <UIButton
                variant="primary"
                onPress={() => {
                  modalCallback?.(true);
                  setModalVisible(false);
                }}
              >
                Yes ♥️
              </UIButton>
              <UIButton
                variant="outline"
                onPress={() => {
                  modalCallback?.(false);
                  setModalVisible(false);
                }}
              >
                No, I just want to log my mood
              </UIButton>
            </View>
          </View>
        </View>
      </Modal>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={40}
        className="h-full"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <JournalEntryForm shouldPost={!mode} callback={handlePost} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Journal;
