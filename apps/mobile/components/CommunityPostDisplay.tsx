import { Linking, Modal, Platform, Pressable, Text, View } from 'react-native';
import { CommunityPostDTO } from '@beacon/types';
import { formateTo24HourTime, formatShortDate } from '@/utils/dateFormatter';
import MoodFace from '@/components/MoodFace';
import { AppStyles } from '@/constants/AppStyles';
import { getMoodColor } from '@/utils/computeColour';
import { useAuthStore } from '@/store/useAuthStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePressScaleAnimation } from '@/hooks/ui/usePressScaleAnimation';
import UIButton from '@/components/ui/UIButton';
import { useState } from 'react';
import { useCommunityPostStore } from '@/store/useCommunityRoomPostStore';
import { deleteCommunityRoomPostRequest } from '@/api/communityRoomApi';
import { Toast } from 'toastify-react-native';
import { parseToSeverError } from '@/utils/parseToSeverError';

const CommunityPostDisplay = ({ data }: { data: CommunityPostDTO }) => {
  const { user } = useAuthStore();
  const { handlePressOut, handlePressIn, handleVibration } =
    usePressScaleAnimation();
  const now = new Date();

  // show time based on hours since post creation
  const postDate = new Date(data.createdAt);
  const hoursSincePost = Math.floor(
    (now.getTime() - postDate.getTime()) / (1000 * 60 * 60),
  );

  // modal
  const [shouldDelete, setShouldDelete] = useState(false);

  return (
    <>
      <DeleteModal
        shouldDelete={shouldDelete}
        setShouldDelete={setShouldDelete}
        postId={data.id}
      />
      <View
        className="bg-white shadow-lg py-6 px-5 rounded-md"
        style={[
          AppStyles.cardShadow,
          {
            outlineColor: getMoodColor(data.moodFace),
            outlineWidth: 1,
            outlineOffset: -3,
          },
        ]}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-4 mb-2">
            <MoodFace mood={data.moodFace} size={36} />
            <View className="flex-col">
              <Text className="font-bold text-base uppercase">
                {data.postUser.username}
              </Text>
              <Text className="text-sm">
                {hoursSincePost === 0
                  ? 'less than an hour'
                  : hoursSincePost >= 24
                    ? formatShortDate(data.createdAt) +
                      ' - ' +
                      formateTo24HourTime(data.createdAt)
                    : `${hoursSincePost}h`}
              </Text>
            </View>
          </View>
          {user?.userId == data.postUser.id && (
            <Pressable
              onTouchStart={handlePressIn}
              onTouchEnd={() => {
                handlePressOut();
                handleVibration();
              }}
              onPress={() => setShouldDelete(true)}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color="red"
              />
            </Pressable>
          )}
        </View>
        <View className="w-full h-px bg-gray-300 my-4" />
        <Text className="text-2xl mb-2">{data.title}</Text>
        <Text className="text-base text-justify">{data.content}</Text>
      </View>
    </>
  );
};

const DeleteModal = ({
  shouldDelete,
  setShouldDelete,
  postId,
}: {
  shouldDelete: boolean;
  setShouldDelete: (value: boolean) => void;
  postId: number;
}) => {
  const { removeSingleItem } = useCommunityPostStore();
  const [loading, setLoading] = useState(false);
  const onConfirmDelete = async () => {
    setLoading(true);
    try {
      await deleteCommunityRoomPostRequest(postId);

      removeSingleItem(postId);
      setShouldDelete(false);
    } catch (e) {
      console.error('Error deleting post:', e);

      const message = parseToSeverError(e).message;
      Toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal animationType="fade" transparent={true} visible={shouldDelete}>
      <View className="flex-1 justify-center items-center ">
        <View className="absolute inset-0 bg-gray-800/80" />
        <View className="bg-white rounded-lg p-6 w-11/12 max-w-md justify-center gap-16">
          <View>
            <Text className="text-2xl font-medium mb-4">
              Are you sure you want to delete this post?
            </Text>
            <Text>
              This action cannot be undone and the post will be permanently
              removed.
            </Text>
          </View>

          <View className="gap-4 flex-row">
            <UIButton
              buttonClassName="flex-1"
              variant="outline"
              size="sm"
              onPress={() => setShouldDelete(false)}
            >
              Cancel
            </UIButton>
            <UIButton
              variant="destructive"
              size="sm"
              onPress={onConfirmDelete}
              buttonClassName="flex-1"
            >
              Delete
            </UIButton>
          </View>
        </View>
      </View>
    </Modal>
  );
};
export default CommunityPostDisplay;
