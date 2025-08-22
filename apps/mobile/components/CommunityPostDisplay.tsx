import { Text, View } from 'react-native';
import { CommunityPostDTO } from '@beacon/types';
import { formateTo24HourTime, formatShortDate } from '@/utils/dateFormatter';
import MoodFace from '@/components/MoodFace';
import { AppStyles } from '@/constants/AppStyles';
import { getMoodColor } from '@/utils/computeColour';

const CommunityPostDisplay = ({ data }: { data: CommunityPostDTO }) => {
  const now = new Date();
  // show time based on hours since post creation
  const postDate = new Date(data.createdAt);
  const hoursSincePost = Math.floor(
    (now.getTime() - postDate.getTime()) / (1000 * 60 * 60),
  );
  return (
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
      <View className="w-full h-px bg-gray-300 my-4" />
      <Text className="text-2xl mb-2">{data.title}</Text>
      <Text className="text-base text-justify">{data.content}</Text>
    </View>
  );
};

export default CommunityPostDisplay;
