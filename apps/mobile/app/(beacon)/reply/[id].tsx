import { Text, View } from 'react-native';
import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotification } from '@/context/notificationContext';
import { Toast } from 'toastify-react-native';

const BeaconReplyId = () => {
  const { id } = useLocalSearchParams();
  const { notificationData } = useNotification() as {
    notificationData: BeaconPushNotificationData | null;
  };
  const router = useRouter();

  useEffect(() => {
    if (
      !notificationData?.dataType ||
      notificationData.dataType !== 'BEACON_NOTIFICATION'
    ) {
      router.push('/');
      Toast.warn('This beacon cannot be found. Returning to home.');
      return;
    }

    if (notificationData.beaconExpiresAt) {
      const expiresAt = new Date(notificationData.beaconExpiresAt);
      const now = new Date();
      if (expiresAt < now) {
        router.push('/');
        Toast.warn('This beacon has expired. Returning to home.');
        return;
      }
    }

    // Cleanup function to run when the component unmounts
    return () => {
      console.log('BeaconReplyId component unmounted');
    };
  }, []);
  return (
    <View>
      <Text>
        Beacon Reply ID: {id} - Notification Data:{' '}
        {JSON.stringify(notificationData)}
      </Text>
    </View>
  );
};

export default BeaconReplyId;
