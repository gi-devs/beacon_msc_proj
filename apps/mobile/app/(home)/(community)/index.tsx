import { Text, View } from 'react-native';
import { useUI } from '@/context/uiContext';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useEffect, useState } from 'react';
import { SafeWrapper } from '@/components/utils/SafeWrapper';
import { useCommunitiesStore } from '@/store/useCommunitiesStore';
import { differenceInSeconds, format, isBefore } from 'date-fns';

const CommunityPage = () => {
  const {
    navbar: { setIsVisible },
  } = useUI();
  const status = useDrawerStatus();
  const { items } = useCommunitiesStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (status === 'open') {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [status, setIsVisible]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeWrapper
      style={{
        marginTop: 16,
      }}
    >
      <Text className="text-lg  mb-4">
        Communities gives you the opportunity to post and interact with other
        users in a safe and supportive environment. Each community is open for a
        limited time only, and are refreshed regularly.
      </Text>
      <Text className="text-base text-gray-600">
        please note: currently communities are only posting and viewing, replied
        and likes will be available on future iterations!
      </Text>
      <View className="w-full h-px bg-gray-300 my-8" />
      <Text className="text-xl font-bold mb-2">Overview</Text>
      <View className="flex-row justify-between mb-8">
        <Text style={{ fontWeight: 'bold' }}>Name</Text>
        <Text>Time Left</Text>
      </View>
      <View className="gap-4">
        {items.map((community) => {
          const expiry = new Date(community.expiresAt); // make sure expiresAt is a valid date
          const isExpired = isBefore(expiry, now);

          let displayText;
          if (isExpired) {
            displayText = `Closed ${format(expiry, 'dd MMM yyyy')}`;
          } else {
            const totalSeconds = differenceInSeconds(expiry, now);

            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            if (hours >= 48) {
              displayText = `${days}d ${hours % 24}h`;
            } else {
              displayText = `${hours}h ${minutes}m ${seconds}s`;
            }
          }

          return (
            <View
              key={community.id}
              className="flex-row justify-between items-center"
            >
              <Text className="font-bold text-2xl">{community.roomName}</Text>
              <Text>{displayText}</Text>
            </View>
          );
        })}
      </View>
    </SafeWrapper>
  );
};

export default CommunityPage;
