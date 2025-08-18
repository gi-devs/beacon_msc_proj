import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useNotification } from '@/context/notificationContext';
import { Toast } from 'toastify-react-native';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBeaconReplyDetails } from '@/api/beaconApi';
import { parseToSeverError } from '@/utils/parseToSeverError';
import { getMoodColor } from '@/utils/computeColour';
import MoodFace from '@/components/MoodFace';
import { NoteSpeechBubble } from '@/components/NoteSpeechBubble';
import Colors from '@/constants/Colors';
import replyMessages from '@/constants/beaconReplyMessages';
import { pickRandomItemFromArray } from '@beacon/utils';
import UIButton from '@/components/ui/UIButton';

const BeaconReplyId = () => {
  const [loading, setLoading] = useState(true);
  const { notificationData } = useNotification() as {
    notificationData: BeaconPushNotificationData | null;
  };
  const router = useRouter();
  const [beaconReplyDetails, setBeaconReplyDetails] =
    useState<BeaconReplyDetailsDTO | null>(null);

  const [replyTexts, setReplyTexts] = useState<{ id: number; text: string }[]>(
    [],
  );
  const [bannerText, setBannerText] = useState<string>('');

  useEffect(() => {
    const fetchBeaconReplyDetails = async () => {
      console.log(notificationData);
      setLoading(true);
      if (
        !notificationData?.dataType ||
        notificationData.dataType !== 'BEACON_NOTIFICATION'
      ) {
        router.replace('/(home)');
        Toast.warn('This beacon cannot be found. Returning to home.');
        return;
      }

      if (notificationData.beaconExpiresAt) {
        const expiresAt = new Date(notificationData.beaconExpiresAt);
        const now = new Date();
        if (expiresAt < now) {
          router.replace('/(home)');
          Toast.warn('This beacon has expired. Returning to home.');
          return;
        }
      }

      if (!notificationData.beaconId || !notificationData.notificationId) {
        router.replace('/(home)');
        Toast.warn('This beacon cannot be found. Returning to home.');
        return;
      }

      try {
        const data = await getBeaconReplyDetails(
          notificationData.beaconId.toString(),
          notificationData.notificationId.toString(),
        );
        setBeaconReplyDetails(data);

        // --- decide highest mood scale ---
        const { dailyCheckInMoodScales } = data;
        const highestScale = Math.max(
          dailyCheckInMoodScales.stressScale,
          dailyCheckInMoodScales.anxietyScale,
          dailyCheckInMoodScales.sadnessScale,
        );

        let moodKey: 'stress' | 'anxious' | 'sad' = 'stress';
        if (highestScale === dailyCheckInMoodScales.anxietyScale) {
          moodKey = 'anxious';
        } else if (highestScale === dailyCheckInMoodScales.sadnessScale) {
          moodKey = 'sad';
        }

        // --- pick mood + generic messages ---
        const moodMessages = Object.entries(replyMessages[moodKey]).map(
          ([id, text]) => ({ id: Number(id), text }),
        );
        const genericMessages = Object.entries(replyMessages.generic).map(
          ([id, text]) => ({ id: Number(id), text }),
        );

        // combine and pick 6 random
        const combined = [...moodMessages, ...genericMessages];
        const selected = pickRandomItemFromArray(combined, 6);
        setReplyTexts(selected);

        // --- banner ---
        if (moodKey === 'stress') {
          setBannerText(
            `${data.ownerUsername} is feeling pretty stressed today, let them know someone is thinking of them!`,
          );
        } else if (moodKey === 'anxious') {
          setBannerText(
            `${data.ownerUsername} is feeling pretty anxious today, let them know someone is thinking of them!`,
          );
        } else {
          setBannerText(
            `${data.ownerUsername} is feeling pretty sad today, let them know someone is thinking of them!`,
          );
        }
      } catch (error) {
        const e = parseToSeverError(error);
        Toast.error(e.message);
        router.replace('/(home)');
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchBeaconReplyDetails();
  }, []);

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
                {beaconReplyDetails.ownerUsername}
              </Text>
            </View>

            <View
              className="bg-white rounded-md px-6 py-2 items-center"
              style={{
                borderColor: getMoodColor(beaconReplyDetails.moodFace),
                borderWidth: 5,
              }}
            >
              <View className="flex-row gap-6 items-center">
                <MoodFace mood={beaconReplyDetails.moodFace} size={70} />
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
              {replyTexts.map((reply, index) => {
                const colourIndex = (6 - index) as 1 | 2 | 3 | 4 | 5 | 6;

                return (
                  <ReplyButton
                    key={index}
                    onPress={() => console.log('Selected:', reply.text)}
                    colourIndex={colourIndex}
                  >
                    {reply.text}
                  </ReplyButton>
                );
              })}
            </View>
          </>
        ) : (
          <View>
            <Text>No beacon reply details found.</Text>
          </View>
        )}
      </ScrollView>
      <View className="mt-6">
        <UIButton variant="destructive">Decline</UIButton>
      </View>
    </SafeAreaView>
  );
};

const ReplyButton = ({
  onPress,
  children,
  colourIndex,
}: {
  onPress: () => void;
  children: React.ReactNode;
  colourIndex: 1 | 2 | 3 | 4 | 5 | 6;
}) => {
  return (
    <TouchableOpacity
      className="rounded-md px-6 py-4 justify-center"
      onPress={onPress}
      style={{
        backgroundColor: Colors.app.ripple[`${colourIndex || 1}00`],
        height: 70,
      }}
    >
      <View className="justify-center items-start">
        <Text
          className="text-white font-semibold leading-normal"
          style={{ flexWrap: 'wrap', flexShrink: 1 }}
          numberOfLines={0}
        >
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default BeaconReplyId;
