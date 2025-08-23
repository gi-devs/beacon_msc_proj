import { ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotification } from '@/context/notificationContext';
import { Toast } from 'toastify-react-native';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestBeaconReply } from '@/api/beaconApi';
import { parseToSeverError } from '@/utils/parseToSeverError';
import { getMoodColor } from '@/utils/computeColour';
import MoodFace from '@/components/MoodFace';
import replyMessages from '@/constants/beaconReplyMessages';
import { pickRandomItemFromArray } from '@beacon/utils';
import UIButton from '@/components/ui/UIButton';
import { CreateBeaconFormData } from '@beacon/validation';
import {
  BeaconNotificationDTO,
  BeaconPushNotificationData,
  BeaconReplyTextKey,
} from '@beacon/types';
import BeaconReplyForm from '@/components/form/forms/BeaconReplyForm';
import { useBeaconNotificationStore } from '@/store/useBeaconNotificationStore';

const BeaconReplyId = () => {
  const [loading, setLoading] = useState(true);
  const { notificationData, setNotificationData } = useNotification() as {
    notificationData: BeaconPushNotificationData | null;
    setNotificationData: (data: BeaconPushNotificationData | null) => void;
  };
  const router = useRouter();
  const [beaconReplyDetails, setBeaconReplyDetails] =
    useState<BeaconNotificationDTO | null>(null);
  const [replyTexts, setReplyTexts] = useState<
    { id: number; text: string; key: BeaconReplyTextKey }[]
  >([]);
  const [bannerText, setBannerText] = useState<string>('');
  const [submitFn, setSubmitFn] = useState<(() => void) | null>(null);
  const [hasSelection, setHasSelection] = useState<() => boolean>(
    () => () => false,
  );
  const { items: beaconNotifications, fetchSingle } =
    useBeaconNotificationStore();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const getPageData = async () => {
      setLoading(true);

      try {
        let notifToFindId;

        if (id && typeof id === 'string') {
          notifToFindId = id;
        } else if (notificationData) {
          notifToFindId = notificationData.notificationId;
        } else {
          Toast.error('This beacon cannot be found. Returning to home.');
          router.replace('/(home)');
          return;
        }

        if (typeof notifToFindId === 'string') {
          notifToFindId = parseInt(notifToFindId, 10);
        }

        if (isNaN(notifToFindId)) {
          Toast.error('This beacon cannot be found. Returning to home.');
          router.replace('/(home)');
          return;
        }

        const existsInStore = beaconNotifications.find(
          (n) => n.id === notifToFindId,
        );
        let data;
        if (existsInStore) {
          data = existsInStore;
          setBeaconReplyDetails(existsInStore);
        } else {
          const fetchedBeaconNotification = await fetchSingle(notifToFindId);
          if (fetchedBeaconNotification) {
            data = fetchedBeaconNotification;
            setBeaconReplyDetails(fetchedBeaconNotification);
          } else {
            Toast.error('This beacon cannot be found. Returning to home.');
            router.replace('/(home)');
            return;
          }
        }

        // --- decide highest mood scale ---
        const { scales } = data.beacon.moodInfo;
        const highestScale = Math.max(
          scales.stress,
          scales.anxiety,
          scales.sadness,
        );

        let moodKey: 'stress' | 'anxious' | 'sad' = 'stress';
        if (highestScale === scales.anxiety) {
          moodKey = 'anxious';
        } else if (highestScale === scales.sadness) {
          moodKey = 'sad';
        }

        // --- pick mood + generic messages ---
        const moodMessages = Object.entries(replyMessages[moodKey]).map(
          ([id, text]) =>
            ({ id: Number(id), text, key: moodKey }) as {
              id: number;
              text: string;
              key: BeaconReplyTextKey;
            },
        );
        const genericMessages = Object.entries(replyMessages.generic).map(
          ([id, text]) =>
            ({ id: Number(id), text, key: 'generic' }) as {
              id: number;
              text: string;
              key: BeaconReplyTextKey;
            },
        );

        // combine and pick 6 random
        const combined = [...moodMessages, ...genericMessages];
        const selected = pickRandomItemFromArray(combined, 6);
        setReplyTexts(selected);

        const ownerUsername = data.beacon.ownerUsername;
        // --- banner ---
        if (moodKey === 'stress') {
          setBannerText(
            `${ownerUsername} is feeling pretty stressed today, let them know someone is thinking of them!`,
          );
        } else if (moodKey === 'anxious') {
          setBannerText(
            `${ownerUsername} is feeling pretty anxious today, let them know someone is thinking of them!`,
          );
        } else {
          setBannerText(
            `${ownerUsername} is feeling pretty sad today, let them know someone is thinking of them!`,
          );
        }
      } catch (error) {
        const err = parseToSeverError(error);
        Toast.error(err.message);
        router.replace('/(home)');
      } finally {
        setLoading(false);
      }
    };

    getPageData();
  }, [
    notificationData,
    id,
    beaconNotifications,
    fetchSingle,
    router,
    setNotificationData,
  ]);

  const handleSubmitReply = async (data: CreateBeaconFormData) => {
    try {
      if (!submitFn) {
        return;
      }
      await requestBeaconReply(data);
      Toast.success('Reply sent successfully!');
      router.replace('/(home)');
    } catch (error) {
      const err = parseToSeverError(error);
      Toast.error(err.message);

      if (err.statusCode === 403 || err.statusCode === 404) {
        router.replace('/(home)');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View>
            <Text>Loading beacon reply details...</Text>
          </View>
        ) : beaconReplyDetails ? (
          <>
            <View className="mb-4 gap-2">
              <Text>{format(new Date(), 'MMMM dd, yyyy')}</Text>
              <Text className="text-2xl">
                {beaconReplyDetails.beacon.ownerUsername}
              </Text>
            </View>

            <View
              className="bg-white rounded-md px-6 py-2 items-center"
              style={{
                borderColor: getMoodColor(
                  beaconReplyDetails.beacon.moodInfo.moodFace,
                ),
                borderWidth: 5,
              }}
            >
              <View className="flex-row gap-6 items-center">
                <MoodFace
                  mood={beaconReplyDetails.beacon.moodInfo.moodFace}
                  size={70}
                />
                <Text className="mt-2 flex-shrink flex-wrap leading-normal">
                  {bannerText}
                </Text>
              </View>
              {/*TODO: create a note from owner to show*/}
              {/*<View className="flex-shrink mt-4">*/}
              {/*  <NoteSpeechBubble text="Work has been hard" />*/}
              {/*</View>*/}
            </View>

            <View className="flex-1 flex-col gap-4 mt-8">
              <BeaconReplyForm
                beaconId={beaconReplyDetails.beacon.beaconId}
                beaconNotificationId={beaconReplyDetails.id}
                replyOptions={replyTexts}
                onSubmit={(data) => handleSubmitReply(data)}
                onSelectedReply={(submit, hasSelection) => {
                  setSubmitFn(() => submit);
                  setHasSelection(() => hasSelection);
                }}
              />
            </View>
          </>
        ) : (
          <View>
            <Text>No beacon reply details found.</Text>
          </View>
        )}
      </ScrollView>
      <View className="mt-6">
        {hasSelection() ? (
          <UIButton variant="primary" onPress={() => submitFn && submitFn()}>
            Send
          </UIButton>
        ) : (
          <UIButton
            variant="destructive"
            onPress={() => router.replace('/(home)')}
          >
            Decline
          </UIButton>
        )}
      </View>
    </SafeAreaView>
  );
};

export default BeaconReplyId;
