import { ScrollView, Text, View } from 'react-native';
import { useBeaconNotificationStore } from '@/store/useBeaconNotificationStore';
import { useEffect } from 'react';
import { SafeWrapper } from '@/components/utils/SafeWrapper';

const BeaconNotifications = () => {
  const { refresh, items } = useBeaconNotificationStore();

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SafeWrapper className="flex-1">
      <ScrollView className="flex-1">
        {items.map((item) => (
          <View key={item.id}>
            <Text>{item.id}</Text>
            <Text>{item.status}</Text>
            <Text>{item.beacon.ownerUsername}</Text>
            <Text>{item.beacon.moodInfo.moodFace}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeWrapper>
  );
};

export default BeaconNotifications;
