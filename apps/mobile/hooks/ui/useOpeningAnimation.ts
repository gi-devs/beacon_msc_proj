import { useEffect } from 'react';
import {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';

export function useOpeningAnimation(
  hasAnimated: boolean,
  setHasAnimated: (bool: boolean) => void,
) {
  const top = useSharedValue(-1000);
  const infoOpacity = useSharedValue(0);

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

  useEffect(() => {
    if (hasAnimated) {
      top.value = 0;
      infoOpacity.value = 1;
      return;
    }

    const timer = setTimeout(() => {
      handleAnimation();
      setHasAnimated(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [hasAnimated]);

  const animatedBeacon = useAnimatedStyle(() => ({
    position: 'absolute',
    zIndex: 1,
    top: top.value,
    left: '50%',
    transform: [{ translateX: '-50%' }],
  }));

  const animatedInfo = useAnimatedStyle(() => ({
    opacity: infoOpacity.value,
  }));

  return { animatedBeacon, animatedInfo };
}
