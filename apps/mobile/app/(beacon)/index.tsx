import { Pressable, ScrollView, Text, View } from 'react-native';
import { useBeaconNotificationStore } from '@/store/useBeaconNotificationStore';
import { useEffect } from 'react';
import { SafeWrapper } from '@/components/utils/SafeWrapper';
import { useRouter } from 'expo-router';

const BeaconNotifications = () => {
  const { refresh, items } = useBeaconNotificationStore();
  const router = useRouter();

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SafeWrapper className="flex-1">
      <ScrollView className="flex-1">
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              router.push(`/(beacon)/reply?id=${item.id}`);
            }}
          >
            <Text>{item.id}</Text>
            <Text>{item.status}</Text>
            <Text>{item.beacon.ownerUsername}</Text>
            <Text>{item.beacon.moodInfo.moodFace}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeWrapper>
  );
};

export default BeaconNotifications;
