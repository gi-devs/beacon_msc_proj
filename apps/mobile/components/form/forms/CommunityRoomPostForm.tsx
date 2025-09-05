import { Text, View } from 'react-native';
import { FormTextInput } from '@/components/form/FormTextInput';
import { Controller, useForm } from 'react-hook-form';
import {
  CreateCommunityRoomPostData,
  createCommunityRoomPostSchema,
} from '@beacon/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import UIButton from '@/components/ui/UIButton';
import Colors from '@/constants/Colors';
import MoodFace from '@/components/MoodFace';
import Slider from '@react-native-community/slider';
import { createCommunityRoomPostRequest } from '@/api/communityRoomApi';
import { useCommunityPostStore } from '@/store/useCommunityRoomPostStore';
import { Toast } from 'toastify-react-native';
import { useRouter } from 'expo-router';
import { parseToSeverError } from '@/utils/parseToSeverError';

const CommunityRoomPostForm = ({ callback }: { callback?: () => void }) => {
  const { activeRoomId, updateSingleItem, loading, setLoading } =
    useCommunityPostStore();
  const router = useRouter();
  const { control, handleSubmit, reset } = useForm<CreateCommunityRoomPostData>(
    {
      resolver: zodResolver(createCommunityRoomPostSchema),
      defaultValues: {
        title: '',
        content: '',
        moodFace: 50,
      },
    },
  );
  const onSubmit = async (data: CreateCommunityRoomPostData) => {
    console.log(data);
    setLoading(true);
    try {
      if (!activeRoomId) {
        Toast.error(
          'This room is not active anymore. Please go back and re-enter the room to post.',
        );
        router.push('/(home)/(community)');
        return;
      }

      const resData = await createCommunityRoomPostRequest(activeRoomId, {
        title: data.title,
        content: data.content,
        moodFace: data.moodFace,
      });

      updateSingleItem(resData);
      reset();
      if (callback) {
        callback();
      }
    } catch (error) {
      console.log(error);
      const e = parseToSeverError(error);

      Toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        outlineWidth: 1,
        outlineColor: Colors.app.ripple['100'],
        outlineOffset: -4,
      }}
      className="border p-2 rounded-md bg-white border-gray-300"
    >
      <View className="mb-6 flex-row items-center gap-4 justify-center mx-4 my-2">
        <Controller
          control={control}
          name="moodFace"
          render={({ field: { onChange, value } }) => {
            return (
              <>
                <MoodFace mood={value} size={36} />
                <View className="flex-1">
                  <Slider
                    value={typeof value === 'number' ? value : 50}
                    onValueChange={onChange}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    thumbTintColor="#C8A69B"
                    minimumTrackTintColor="#C8A69B"
                    maximumTrackTintColor="#e5e5e5"
                    className="w-full"
                  />
                </View>
              </>
            );
          }}
        />
      </View>
      <FormTextInput
        name="title"
        control={control}
        placeholder="Post title"
        placeholderTextColor="#999"
        className="text-black"
      />
      <FormTextInput
        name="content"
        control={control}
        placeholder="Let people know what you are thinking..."
        placeholderTextColor="#999"
        className="text-black"
        style={
          {
            minHeight: 150,
            textAlignVertical: 'top',
            borderWidth: 0,
            marginTop: 0,
          } as any
        }
        wrapperClassName="mb-4"
        variant="textarea"
        multiline
      />
      <UIButton
        variant="primary"
        size="sm"
        buttonClassName="self-end px-10 mb-2 mr-2"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        Post
      </UIButton>
    </View>
  );
};

export default CommunityRoomPostForm;
