import RippleCircles from '@/components/RippleCircles';
import { useLogCreator } from '@/context/logCreatorContext';
import { createDailyLogRequest } from '@/api/moodLoggerApi';
import { parseToSeverError } from '@/utils/parseToSeverError';
import { Toast } from 'toastify-react-native';
import { useRouter } from 'expo-router';
import { Linking, Modal, Platform, Text, View } from 'react-native';
import UIButton from '@/components/ui/UIButton';
import { useLocation } from '@/context/locationContext';
import { useState } from 'react';
import { useAuth } from '@/context/authContext';

const Broadcast = () => {
  const {
    shouldBroadcast,
    createJournalEntryData,
    createMoodLogData,
    setShouldBroadcast,
  } = useLogCreator();
  const router = useRouter();
  const { isLocationEnabled } = useLocation();
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const sendDataWithBroadcast = async () => {
    setLoading(true);
    try {
      const data = {
        moodLog: createMoodLogData,
        journalEntry: createJournalEntryData,
        shouldBroadcast,
      };

      // TODO: Remove this timeout
      await new Promise((resolve) => setTimeout(resolve, 5000));

      await createDailyLogRequest(data);

      // user should always be defined here, but just in case
      if (user) {
        setUser({
          ...user,
          appConfig: {
            ...user.appConfig,
            hasCompletedDailyCheckIn: true,
          },
        });
      }

      Toast.success('Mood logged and beacon sent successfully!');
    } catch (error) {
      console.error('Error sending broadcast:', error);
      const parsedError = parseToSeverError(error);

      Toast.error(parsedError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={!isLocationEnabled}
      >
        <View className="flex-1 justify-center items-center ">
          <View className="absolute inset-0 bg-gray-800/80" />
          <View className="bg-white h-1/2 rounded-lg p-6 w-11/12 max-w-md justify-center gap-16">
            <View>
              <Text className="text-2xl font-medium mb-4">
                Hey your locations sharing is disabled!
              </Text>
              <Text>
                Beacon works best when you share your location with us. We never
                save your exact location, but is require to send a beacon.{' '}
              </Text>
              <Text className="mt-4">
                Do you want to enable location sharing now?
              </Text>
              <Text className="mt-4">
                {Platform.OS === 'ios' &&
                  'Please enable location sharing by settings > Privacy > Location Services.'}
                {Platform.OS === 'android' &&
                  'Please enable location sharing by settings > Location.'}
              </Text>
            </View>

            <View className="gap-4">
              <UIButton
                variant="primary"
                onPress={async () => {
                  if (Platform.OS === 'ios') {
                    return await Linking.openURL('app-settings:');
                  }

                  if (Platform.OS === 'android') {
                    return await Linking.openSettings();
                  }
                }}
              >
                Yes ♥️
              </UIButton>
              <UIButton
                variant="outline"
                onPress={async () => {
                  setShouldBroadcast(false);
                  router.replace(
                    '/(mood-logging)/journal?mode=daily-log&noLocationServices=true',
                  );
                }}
              >
                No, I just want to log my mood
              </UIButton>
            </View>
          </View>
        </View>
      </Modal>
      <RippleCircles
        callback={sendDataWithBroadcast}
        onAnimateEnd={() => {
          router.replace('/(home)');
        }}
        disabled={!isLocationEnabled || loading}
      />
    </>
  );
};

export default Broadcast;
