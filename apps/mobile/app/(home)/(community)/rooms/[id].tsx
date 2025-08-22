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
import CommunityRoomPostForm from '@/components/form/forms/CommunityRoomPostForm';

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
  const [wantsToPost, setWantsToPost] = useState(false);

  useEffect(() => {
    const community = items.find((c) => c.id === id);
    if (community) {
      setCurrentCommunity(community);
      navigation.setOptions({ title: community.roomName });
      setRoomId(community.id);
      void refresh();
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
        onTouchEnd={() => {
          if (wantsToPost) {
            setWantsToPost(false);
          }
        }}
        data={postItems}
        keyExtractor={(item: CommunityPostDTO) => item.id.toString()}
        renderItem={({ item }) => <CommunityPostDisplay data={item} />}
        ListHeaderComponent={
          <View
            className="pt-6"
            onTouchEnd={(e) => {
              e.stopPropagation();
            }}
          >
            <Text className="text-3xl mb-4">
              Welcome To {currentCommunity.roomName}
            </Text>
            {currentCommunity.expired ? (
              <Text className="mb-4 text-red-600">
                This community has expired and is read-only.
              </Text>
            ) : wantsToPost ? (
              <CommunityRoomPostForm callback={() => setWantsToPost(false)} />
            ) : (
              <UIButton
                variant="primary"
                size="sm"
                buttonClassName="px-10 mb-2 mr-2"
                onPress={() => setWantsToPost(true)}
              >
                Create Post
              </UIButton>
            )}
          </View>
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
