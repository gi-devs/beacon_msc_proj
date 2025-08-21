import { useRef } from 'react';
import { Animated, Vibration } from 'react-native';

type Options = {
  activeScale?: number;
  vibrate?: boolean;
};

export function usePressScaleAnimation({
  activeScale = 0.95,
  vibrate = true,
}: Options = {}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: activeScale,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handleVibration = () => {
    if (vibrate) {
      Vibration.vibrate(10);
    }
  };

  return {
    scale,
    animatedStyle: { transform: [{ scale }] },
    handlePressIn,
    handlePressOut,
    handleVibration,
  };
}
