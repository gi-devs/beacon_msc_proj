import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCommunitiesStore } from '@/store/useCommunitiesStore';
import { useCallback, useEffect, useState } from 'react';
import { CommunityPostDTO, UserCommunityRoomDTO } from '@beacon/types';
import CommunityPostDisplay from '@/components/CommunityPostDisplay';
import { SafeWrapper } from '@/components/utils/SafeWrapper';

const CommunityRoom = () => {
  const { id } = useLocalSearchParams();
  const { items } = useCommunitiesStore();
  const [currentCommunity, setCurrentCommunity] =
    useState<UserCommunityRoomDTO | null>(null);
  const router = useRouter();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const community = items.find((c) => c.id === id);
    if (community) {
      setCurrentCommunity(community);
      navigation.setOptions({ title: community.roomName });
    } else {
      router.push(`/(home)/(community)`);
    }
  }, [id, items]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // await refreshPost(id as string); // assuming refreshPost fetches fresh posts
    } finally {
      setRefreshing(false);
    }
  }, [id]);

  if (!currentCommunity) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  const sortedPosts = [...currentCommunity.posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <SafeWrapper
      style={{
        marginTop: 0,
      }}
    >
      <FlatList
        data={sortedPosts}
        keyExtractor={(item: CommunityPostDTO) => item.id}
        renderItem={({ item }) => <CommunityPostDisplay data={item} />}
        ListHeaderComponent={
          <Text className="text-3xl pt-6">
            Welcome To {currentCommunity.roomName}
          </Text>
        }
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeWrapper>
  );
};

export default CommunityRoom;
