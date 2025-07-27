import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/authContext';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Link } from 'expo-router';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const top = useSharedValue(-1000);
  const opacity = useSharedValue(0);
  const infoOpacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAnimation();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const animatedBeacon = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      zIndex: 1,
      top: top.value,
      left: '50%',
      transform: [
        {
          translateX: '-50%',
        },
      ],
    };
  });

  const animatedCircles = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      zIndex: 0,
      opacity: opacity.value,
    };
  });

  // className="flex justify-end flex-col items-center h-full pt-safe px-8 pb-20"
  const animatedInfo = useAnimatedStyle(() => {
    return {
      opacity: infoOpacity.value,
    };
  });

  const handleAnimation = () => {
    opacity.value = withTiming(
      1,
      { duration: 700, easing: Easing.linear },
      () => {
        top.value = withTiming(
          0,
          {
            duration: 1500,
          },
          () => {
            infoOpacity.value = withTiming(1, { duration: 500 });
          },
        );
      },
    );
  };

  if (isAuthenticated) {
    // return <Redirect href="/home" />;
    console.log('User is authenticated, redirecting to home');
  }

  return (
    <View className="h-full w-full bg-[#3E678E]">
      <Animated.Image
        source={require('@/assets/items/beacon_light.png')}
        style={animatedBeacon}
      />
      <Animated.Image
        source={require('@/assets/items/blurred_circles.png')}
        style={animatedCircles}
      />
      <Image
        source={require('@/assets/icons/BEACON_title.png')}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain z-10"
      />
      <Animated.View
        className="flex justify-end flex-col items-center h-full pt-safe px-8 pb-20"
        style={animatedInfo}
      >
        <View className="flex gap-8 items-center w-full">
          <Text className="text-white text-center leading-relaxed">
            By creating an account, you agree to our{' '}
            <Link href="/" className="underline font-bold">
              Terms of Service.
            </Link>{' '}
            Learn how we process your data in our{' '}
            <Link href="/" className="underline font-bold">
              {' '}
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/" className="underline font-bold">
              Cookies Policy
            </Link>
            .
          </Text>
          <View className="flex w-full items-center gap-4">
            <Link href="/(registration)/email" asChild>
              <TouchableOpacity className="bg-secondary py-4 w-full flex justify-center items-center rounded-full">
                <Text className="text-white text-center font-bold">
                  Create an account
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default Index;
