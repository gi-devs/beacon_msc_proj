import { ImageBackground, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Link } from 'expo-router';

import { useUI } from '@/context/uiContext';
import UIButton from '@/components/ui/UIButton';
import { useOpeningAnimation } from '@/hooks/ui/useOpeningAnimation';

const Index = () => {
  const {
    openingScreen: { hasAnimated, setHasAnimated },
  } = useUI();
  const { animatedBeacon, animatedInfo } = useOpeningAnimation(
    hasAnimated,
    setHasAnimated,
  );

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
