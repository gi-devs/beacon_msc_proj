import {
  SectionList,
  Pressable,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useBeaconNotificationStore } from '@/store/useBeaconNotificationStore';
import { useEffect } from 'react';
import { SafeWrapper } from '@/components/utils/SafeWrapper';
import { useRouter } from 'expo-router';
import { BeaconNotificationDTO } from '@beacon/types';
import { formateTo24HourTime, formatShortDate } from '@/utils/dateFormatter';
import UIButton from '@/components/ui/UIButton';
import { getMoodColor } from '@/utils/computeColour';
import RippleCirclesAnimated from '@/components/RippleCirclesAnimated';
import { BlurView } from 'expo-blur';
import * as Device from 'expo-device';
import HeaderWithRouteUI from '@/components/ui/HeaderWithRouteUI';
import { Ionicons } from '@expo/vector-icons';

const BeaconNotifications = () => {
  const { refresh, items, loading, hasMore, fetchMore } =
    useBeaconNotificationStore();
  const router = useRouter();

  useEffect(() => {
    refresh();
  }, []);

  const replied = items.filter(
    (n) => n.status === 'REPLIED' || n.status === 'OWNER_NOTIFIED',
  );

  const toReply = items.filter(
    (n) => n.status === 'SENT' || n.status === 'SENT_SILENTLY',
  );

  const sections = [
    {
      title: `You have ${toReply.length} beacon${
        toReply.length !== 1 ? 's' : ''
      } to reply to`,
      data: toReply,
      index: 0,
    },
    {
      title: `Recently replied to ${replied.length} ${
        replied.length > 1 ? 'people' : 'person'
      }`,
      data: replied,
      index: 1,
    },
  ];

  return (
    <>
      <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center">
        <RippleCirclesAnimated size={1200} animate={false} />
      </View>
      {Device.osName === 'iOS' ? (
        <BlurView
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          intensity={20}
        />
      ) : (
        <View className="bg-white opacity-40 absolute inset-0 overflow-y-auto z-10" />
      )}
      <SafeWrapper className="flex-1 z-20 mb-0">
        <Pressable
          className="mt-safe"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(home)');
            }
          }}
        >
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </Pressable>
        <HeaderWithRouteUI
          header="Beacon Notifications"
          style={{
            borderColor: '#1f2937',
          }}
        />
        {replied.length + toReply.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-base  my-4 max-w-64 text-center">
              No beacon notifications yet, keep an eye out!
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id.toString()}
            stickyHeaderHiddenOnScroll={true}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refresh} />
            }
            renderSectionHeader={({ section }) => (
              <>
                {section.index !== 0 && (
                  <View className="h-px bg-gray-800 mt-8" />
                )}
                <Text className="text-2xl font-medium my-4">
                  {section.title}
                </Text>
              </>
            )}
            renderItem={({ item }) => (
              <ReplyCard
                data={item}
                onPress={() => {
                  router.push(`/(beacon)/reply?id=${item.id}`);
                }}
              />
            )}
            renderSectionFooter={({ section }) =>
              section.data.length === 0 ? (
                <Text className="text-base  mx-2 my-4">
                  Nothing at the moment!
                </Text>
              ) : null
            }
            ListFooterComponent={
              <View className="mb-20">
                {loading && (
                  <ActivityIndicator
                    className="my-4"
                    size="small"
                    color="#000"
                  />
                )}
                {!loading && hasMore && (
                  <UIButton
                    variant="ghost"
                    size="sm"
                    onPress={fetchMore}
                    buttonClassName="mt-2"
                    textClassName="text-gray-600"
                  >
                    Load More
                  </UIButton>
                )}
              </View>
            }
          />
        )}
      </SafeWrapper>
    </>
  );
};

const ReplyCard = ({
  data,
  onPress,
}: {
  data: BeaconNotificationDTO;
  onPress: () => void;
}) => {
  const shouldNotDisable =
    data.status === 'SENT' || data.status === 'SENT_SILENTLY';
  const shouldDisable = !shouldNotDisable;

  const shouldNotShow =
    data.status === 'DECLINED' ||
    data.status === 'CANCELLED' ||
    data.status === 'EXPIRED' ||
    data.status === 'PENDING';

  if (shouldNotShow) return null;

  const replied = data.status === 'REPLIED' || data.status === 'OWNER_NOTIFIED';

  return (
    <Pressable
      onPress={onPress}
      disabled={shouldDisable}
      className="p-4 rounded-lg bg-white mb-2"
      style={{
        outlineColor: getMoodColor(data.beacon.moodInfo.moodFace),
        outlineWidth: 1,
        outlineOffset: -3,
      }}
    >
      <Text className="text-xl">{data.beacon.ownerUsername}</Text>
      <Text className="text-base text-gray-500">
        {replied
          ? data.status === 'REPLIED'
            ? 'Replied at: '
            : 'User seen at: '
          : 'Received at: '}
        {formatShortDate(data.updatedAt)} -{' '}
        {formateTo24HourTime(data.updatedAt)}
      </Text>
    </Pressable>
  );
};

export default BeaconNotifications;
