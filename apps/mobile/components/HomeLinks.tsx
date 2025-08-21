import {
  Image,
  ImageSourcePropType,
  Pressable,
  Text,
  Vibration,
  View,
  Animated,
} from 'react-native';
import { AppStyles } from '@/constants/AppStyles';
import { Href, LinkProps, useRouter } from 'expo-router';
import { useRef } from 'react';
import { usePressScaleAnimation } from '@/hooks/ui/usePressScaleAnimation';

const HomeLinks = ({
  color,
  children,
  title,
  imgSrc,
  imageOffsetX = 0,
  imageSize = 260,
  disablePress = false,
  linkTo,
}: {
  color: string;
  children?: React.ReactNode;
  title: string;
  imgSrc: ImageSourcePropType | undefined;
  imageOffsetX?: number;
  imageSize?: number;
  disablePress?: boolean;
  linkTo?: Href;
}) => {
  const router = useRouter();
  const { animatedStyle, handlePressIn, handlePressOut, handleVibration } =
    usePressScaleAnimation();

  return (
    <Animated.View
      style={[AppStyles.linkCardShadow, animatedStyle]}
      className="bg-white rounded-lg"
    >
      <Pressable
        className="bg-ripple-200 rounded-lg p-6 h-44 flex items-start justify-center overflow-hidden relative"
        style={{
          backgroundColor: color || '#f0f0f0',
        }}
        onPress={() => {
          handleVibration();
          if (!disablePress && linkTo) {
            router.push(linkTo);
          }
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disablePress}
      >
        {children}
        <Image
          source={imgSrc}
          className="w-72 h-72 absolute -z-10"
          style={{
            right: imageOffsetX - 80,
            width: imageSize,
            height: imageSize,
          }}
          resizeMode="contain"
        />
        <View className="flex-row items-center gap-4">
          <Text className="text-white font-bold text-xl text-wrap flex-1 tracking-wider leading-normal">
            {title}
          </Text>
          <View
            className="w-36 h-full"
            style={{
              width: imageSize + (imageOffsetX - 100),
            }}
          />
        </View>
        {disablePress && <View className="bg-white/50 absolute inset-0 z-0" />}
      </Pressable>
    </Animated.View>
  );
};

export default HomeLinks;
