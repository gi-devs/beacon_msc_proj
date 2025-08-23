import { ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { Router, useLocalSearchParams, useRouter } from 'expo-router';
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

type ReplyTextOption = {
  id: number;
  text: string;
  key: BeaconReplyTextKey;
};

const BeaconReplyId = () => {
  const [loading, setLoading] = useState(true);
  const { notificationData, setNotificationData } = useNotification() as {
    notificationData: BeaconPushNotificationData | null;
    setNotificationData: (data: BeaconPushNotificationData | null) => void;
  };
  const router = useRouter();
  const [beaconReplyDetails, setBeaconReplyDetails] =
    useState<BeaconNotificationDTO | null>(null);
  const [replyTexts, setReplyTexts] = useState<ReplyTextOption[]>([]);
  const [bannerText, setBannerText] = useState<string>('');
  const [submitFn, setSubmitFn] = useState<(() => void) | null>(null);
  const [hasSelection, setHasSelection] = useState<() => boolean>(
    () => () => false,
  );
  const {
    items: beaconNotifications,
    fetchSingle,
    updateSingleItem,
  } = useBeaconNotificationStore();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const getPageData = async () => {
      setLoading(true);

      try {
        const parseId = Array.isArray(id) ? id[0] : id;
        const notifId = getNotifId(parseId, notificationData);
        if (!notifId)
          return redirectWithError(
            'This beacon cannot be found. Returning to home.',
            router,
          );

        const existsInStore = beaconNotifications.find((n) => n.id === notifId);
        let data;

        if (!existsInStore) {
          const fetchedBeaconNotification = await fetchSingle(notifId);

          if (!fetchedBeaconNotification) {
            redirectWithError(
              'This beacon cannot be found. Returning to home.',
              router,
            );
            return;
          }

          data = fetchedBeaconNotification;
        } else {
          data = existsInStore;
        }

        validateBeaconData(data, router);
        setBeaconReplyDetails(data);

        // --- decide highest mood scale ---
        const { scales } = data.beacon.moodInfo;
        const highestScale = Math.max(
          scales.stress,
          scales.anxiety,
          scales.sadness,
        );

        // --- get mood + generic messages ---
        const moodKey = getHighestMoodKey(data.beacon.moodInfo.scales);
        const selectedReplies = randomiseReplyOptions(moodKey);
        setReplyTexts(selectedReplies);

        // --- banner ---
        const ownerUsername = data.beacon.ownerUsername;
        const banner = formBannerText(moodKey, ownerUsername);
        setBannerText(banner);
      } catch (error) {
        const err = parseToSeverError(error);
        redirectWithError(err.message, router);
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
      const replied = await requestBeaconReply(data);
      updateSingleItem(replied);
      Toast.success('Reply sent successfully!');
      router.replace('/(beacon)');
    } catch (error) {
      const err = parseToSeverError(error);
      Toast.error(err.message);

      if (err.statusCode === 403 || err.statusCode === 404) {
        router.replace('/(beacon)');
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

// -------------- HELPERS --------------
function getNotifId(
  id: string | undefined | null,
  notificationData: BeaconPushNotificationData | null,
): number | null {
  let notifId;

  if (id) {
    notifId = id;
  } else if (notificationData) {
    notifId = notificationData.notificationId;
  } else {
    return null;
  }

  if (typeof notifId === 'string') {
    notifId = parseInt(notifId, 10);
  }

  return typeof notifId === 'number' && !isNaN(notifId) ? notifId : null;
}

function redirectWithError(
  message: string,
  router: Router,
  callback?: () => void,
) {
  Toast.error(message);
  router.replace('/(beacon)');
  if (callback) {
    callback();
  }
}

function validateBeaconData(
  data: BeaconNotificationDTO | null,
  router: Router,
): boolean {
  if (!data) {
    redirectWithError(
      'This beacon cannot be found. Returning to home.',
      router,
    );
    return false;
  }

  if (data.status === 'REPLIED') {
    redirectWithError('You have already replied to this beacon.', router);
    return false;
  }

  if (data.beacon.expiresAt && new Date(data.beacon.expiresAt) < new Date()) {
    redirectWithError('This beacon has expired. Returning to home.', router);
    return false;
  }

  return true;
}

function getHighestMoodKey(scales: {
  stress: number;
  anxiety: number;
  sadness: number;
}): BeaconReplyTextKey {
  const highest = Math.max(scales.stress, scales.anxiety, scales.sadness);

  if (highest === scales.anxiety) return 'anxious' as BeaconReplyTextKey;
  if (highest === scales.sadness) return 'sad' as BeaconReplyTextKey;
  return 'stress' as BeaconReplyTextKey;
}

function randomiseReplyOptions(moodKey: BeaconReplyTextKey): ReplyTextOption[] {
  const moodMessages = Object.entries(replyMessages[moodKey]).map(
    ([id, text]) => ({
      id: Number(id),
      text,
      key: moodKey,
    }),
  );

  const genericMessages = Object.entries(replyMessages.generic).map(
    ([id, text]) => ({
      id: Number(id),
      text,
      key: 'generic' as BeaconReplyTextKey,
    }),
  );

  return pickRandomItemFromArray([...moodMessages, ...genericMessages], 6);
}

function formBannerText(
  moodKey: BeaconReplyTextKey,
  ownerUsername: string,
): string {
  if (moodKey === 'stress') {
    return `${ownerUsername} is feeling pretty stressed today, let them know someone is thinking of them!`;
  }
  if (moodKey === 'anxious') {
    return `${ownerUsername} is feeling pretty anxious today, let them know someone is thinking of them!`;
  }
  return `${ownerUsername} is feeling pretty sad today, let them know someone is thinking of them!`;
}

export default BeaconReplyId;
