import React, { useEffect } from 'react';
import { Svg, Circle, Path } from 'react-native-svg';
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Circle as SVGCircle } from 'react-native-svg';

type MoodFaceProps = {
  mood: number; // 1-100
  size?: number; // Optional size prop for future use
};

const AnimatedCircle = Animated.createAnimatedComponent(SVGCircle);

const MoodFace = ({ mood, size = 50 }: MoodFaceProps) => {
  const mouthPath = generateMouthPath(mood);
  const moodValue = useSharedValue(mood);

  useEffect(() => {
    moodValue.value = withTiming(mood, { duration: 500 });
  }, [mood]);

  const animatedProps = useAnimatedProps(() => {
    const fill = interpolateColor(
      moodValue.value,
      [1, 25, 50, 75, 100],
      ['#f5cf27', '#05EEC3', '#019090', '#d196ec', '#e75b87'],
    );
    return { fill };
  });

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <AnimatedCircle cx="16" cy="16" r="16" animatedProps={animatedProps} />
      <Circle cx="9.5" cy="17" r="2" fill="black" />
      <Circle cx="22.5" cy="17" r="2" fill="black" />
      <Path d={mouthPath} stroke="black" strokeWidth={1.5} fill="none" />
    </Svg>
  );
};

function generateMouthPath(value: number): string {
  const clamped = Math.max(1, Math.min(100, value));
  const normalized = (clamped - 50) / 50; // range from -1 to 1
  const curveAmount = normalized * 5; // Adjust the multiplier to change the curve depth

  const startX = 9.5;
  const endX = 22.5;
  const centerX = (startX + endX) / 2;
  const baseY = 24;
  const controlY = baseY - curveAmount; // this is what controls the curve depth (-6px to 6px for a full range)

  // Q for quadratic bezier curve
  return `M${startX} ${baseY} Q ${centerX} ${controlY} ${endX} ${baseY}`;
}

export default MoodFace;
