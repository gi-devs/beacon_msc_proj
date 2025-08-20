import { StyleProp, Text, View, ViewStyle, Vibration } from 'react-native';
import { AppStyles } from '@/constants/AppStyles';
import MoodFace from '@/components/MoodFace';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import Colors from '@/constants/Colors';

export type MoodStackItem = {
  mood: number;
  date: string;
  broadcasted: boolean;
  highestScale: {
    scale: 'stressed' | 'anxious' | 'sad';
    value: number;
  };
};

type LogStackProps = {
  isOpen: boolean;
  moodStack: MoodStackItem[];
};

export const useLogStack = () => {
  const [isLogStackOpen, setIsLogStackOpen] = useState(false);

  const openLogStack = () => setIsLogStackOpen(true);
  const closeLogStack = () => setIsLogStackOpen(false);

  return { isLogStackOpen, openLogStack, closeLogStack };
};

const LogStack = ({ isOpen, moodStack }: LogStackProps) => {
  const marginTop = useSharedValue(-30);
  const animatedStyle = useAnimatedStyle(() => ({
    marginTop: marginTop.value,
  }));
  const splitMoodStack = moodStack.slice(0, 3);
  useEffect(() => {
    marginTop.value = withTiming(isOpen ? 10 : -30, { duration: 200 });
    if (isOpen) {
      Vibration.vibrate(10);
    }
  }, [isOpen]);

  return (
    <View className="relative w-full">
      {splitMoodStack.map((item, index) => (
        <LogCard
          key={index}
          style={[
            {
              zIndex: 3 - index,
            },
            index === 0 ? null : animatedStyle,
          ]}
          isOpen={isOpen}
          moodItem={item}
        />
      ))}
    </View>
  );
};

const LogCard = ({
  style,
  isOpen,
  moodItem,
}: {
  style?: StyleProp<ViewStyle>;
  isOpen: boolean;
  moodItem: MoodStackItem;
}) => {
  const clicked = () => {
    console.log('Card clicked');
  };
  return (
    <Animated.View
      style={[AppStyles.cardShadow, style]}
      className="rounded-xl w-full"
      onTouchEnd={() => {
        if (isOpen) {
          clicked();
        }
      }}
    >
      <View className="bg-white px-6 py-4 flex-row justify-between items-center rounded-xl">
        <View className="flex-row gap-4 items-center">
          <MoodFace mood={moodItem.mood} size={36} />
          <View>
            <Text
              style={{
                color: colourForScale(moodItem.highestScale.scale),
              }}
            >
              {moodItem.highestScale.scale.charAt(0).toUpperCase() +
                moodItem.highestScale.scale.slice(1)}
            </Text>
            <Text>{moodItem.date}</Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          {/*<AntDesign name="question" size={24} color="black" />*/}
          {moodItem.broadcasted && (
            <MaterialCommunityIcons
              name="broadcast"
              size={24}
              color={Colors.app.ripple['100']}
            />
          )}
          <Ionicons name="journal-outline" size={24} color="black" />
        </View>
      </View>
    </Animated.View>
  );
};

const colourForScale = (scale: 'stressed' | 'anxious' | 'sad') => {
  switch (scale) {
    case 'stressed':
      return Colors.app.moodColours['stressed'];
    case 'anxious':
      return Colors.app.moodColours['anxious'];
    case 'sad':
      return Colors.app.moodColours['sad'];
    default:
      return Colors.app.moodColours['neutral'];
  }
};

export default LogStack;
