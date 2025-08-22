import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCommunitiesStore } from '@/store/useCommunitiesStore';
import { useEffect, useState } from 'react';
import { CommunityPostDTO, UserCommunityRoomDTO } from '@beacon/types';
import CommunityPostDisplay from '@/components/CommunityPostDisplay';
import { SafeWrapper } from '@/components/utils/SafeWrapper';
import { useCommunityPostStore } from '@/store/useCommunityRoomPostStore';
import UIButton from '@/components/ui/UIButton';

const CommunityRoom = () => {
  const { id } = useLocalSearchParams();
  const { items } = useCommunitiesStore();
  const [currentCommunity, setCurrentCommunity] =
    useState<UserCommunityRoomDTO | null>(null);
  const router = useRouter();
  const navigation = useNavigation();
  const { setRoomId, refresh, loading, activeRoomId, rooms, fetchMore } =
    useCommunityPostStore();
  const postItems =
    activeRoomId && rooms[activeRoomId] ? rooms[activeRoomId].items : [];
  const hasMore =
    activeRoomId && rooms[activeRoomId] ? rooms[activeRoomId].hasMore : false;

  useEffect(() => {
    const community = items.find((c) => c.id === id);
    if (community) {
      setCurrentCommunity(community);
      navigation.setOptions({ title: community.roomName });
      setRoomId(community.id);
      refresh();
    } else {
      router.push(`/(home)/(community)`);
    }
  }, [id, items]);

  if (!currentCommunity) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeWrapper
      style={{
        marginTop: 0,
      }}
    >
      <FlatList
        data={postItems}
        keyExtractor={(item: CommunityPostDTO) => item.id.toString()}
        renderItem={({ item }) => <CommunityPostDisplay data={item} />}
        ListHeaderComponent={
          <Text className="text-3xl pt-6">
            Welcome To {currentCommunity.roomName}
          </Text>
        }
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        ListFooterComponent={
          <>
            {loading && (
              <ActivityIndicator className="my-8" size="small" color="#000" />
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
          </>
        }
      />
    </SafeWrapper>
  );
};

export default CommunityRoom;
