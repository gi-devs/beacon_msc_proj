import { ImageBackground, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Link } from 'expo-router';
import { useUI } from '@/context/uiContext';
import UIButton from '@/components/ui/UIButton';
import { useAuthStore } from '@/store/useAuthStore';

const Index = () => {
  const { isAuthenticated } = useAuthStore();
  const { openingScreen } = useUI();

  // animated values
  const top = useSharedValue(-1000);
  const infoOpacity = useSharedValue(0);

  useEffect(() => {
    if (openingScreen.hasAnimated) {
      top.value = 0;
      infoOpacity.value = 1;
      return;
    }

    const timer = setTimeout(() => {
      handleAnimation();
      openingScreen.setHasAnimated(true);
    }, 500);

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

  const animatedInfo = useAnimatedStyle(() => {
    return {
      opacity: infoOpacity.value,
    };
  });

  const handleAnimation = () => {
    top.value = withTiming(
      0,
      {
        duration: 1000,
      },
      () => {
        infoOpacity.value = withTiming(1, { duration: 500 });
      },
    );
  };

  if (isAuthenticated) {
    // return <Redirect href="/home" />;
    console.log('User is authenticated, redirecting to home');
  }

  return (
    <ImageBackground
      className="h-full w-full bg-ripple-600"
      source={require('@/assets/app/background_2.png')}
    >
      <Animated.Image
        source={require('@/assets/items/beacon_light_thick.png')}
        style={animatedBeacon}
      />
      <Animated.Image
        style={animatedInfo}
        source={require('@/assets/icons/BEACON_title_large.png')}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-screen"
        resizeMode="contain"
      />
      <Animated.View
        className="flex justify-end flex-col items-center h-full pt-safe px-8 pb-20"
        style={animatedInfo}
      >
        <View className="flex gap-8 items-center w-full">
          <Text className="text-black text-center leading-relaxed">
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
            <UIButton
              variant="secondary"
              href="/(auth)/log-in"
              buttonClassName="w-full"
            >
              Sign In
            </UIButton>

            <UIButton href="/(auth)/sign-up" variant="ghost">
              Create an account
            </UIButton>
          </View>
        </View>
      </Animated.View>
    </ImageBackground>
  );
};

export default Index;
