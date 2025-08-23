import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Svg, Circle as SVGCircle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(SVGCircle);

const RippleCirclesAnimated = ({
  size = 300,
  animate = true,
}: {
  size?: number;
  animate?: boolean;
}) => {
  const vWidth = 981;
  const vHeight = 981;

  const shapes = [
    {
      cx: 490.5,
      cy: 490.5,
      r: 490.5,
      transform: 'matrix(1 0 0 -1 0 981)',
      fill: '#014444',
    },
    {
      cx: 435.956,
      cy: 435.956,
      r: 435.956,
      transform: 'matrix(1 0 0 -1 54.1512 960.595)',
      fill: '#036666',
    },
    {
      cx: 382.5,
      cy: 382.5,
      r: 382.5,
      transform: 'matrix(1 0 0 -1 107 944)',
      fill: '#019090',
    },
    {
      cx: 302.5,
      cy: 302.5,
      r: 302.5,
      transform: 'matrix(1 0 0 -1 189 897)',
      fill: '#00B1B1',
    },
    {
      cx: 226.415,
      cy: 226.415,
      r: 226.415,
      transform: 'matrix(1 0 0 -1 266 872.83)',
      fill: '#03D6D6',
    },
    {
      cx: 166.173,
      cy: 166.173,
      r: 166.173,
      transform: 'matrix(1 0 0 -1 326 857.346)',
      fill: '#05EEC3',
    },
  ];

  const progressList = shapes.map(() => useSharedValue(0));

  useEffect(() => {
    if (!animate) {
      return;
    }
    const baseDuration = 1000;
    const delayBetween = 1000;
    const totalCircles = progressList.length;
    const totalWaveDuration =
      baseDuration * 2 + (totalCircles - 1) * delayBetween;

    progressList.forEach((progress, i) => {
      const reverseIndex = totalCircles - 1 - i; // flip to start from inner circle
      const startDelay = reverseIndex * delayBetween;

      const holdDuration = totalWaveDuration - startDelay;

      progress.value = withRepeat(
        withDelay(
          startDelay,
          withSequence(
            withTiming(1, { duration: holdDuration / 2 }),
            withTiming(0, { duration: holdDuration / 2 }),
          ),
        ),
        -1,
        false,
      );
    });
  }, []);

  return (
    <View
      className="justify-center items-center"
      style={{ width: size, height: size }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${vWidth} ${vHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {shapes.map((shape, index) => {
          const animatedProps = useAnimatedProps(() => {
            const strokeColor = interpolateColor(
              progressList[index].value,
              [0, 1],
              [shape.fill, '#FFFFFF'],
            );
            return { stroke: strokeColor };
          });

          return (
            <AnimatedCircle
              key={index}
              cx={shape.cx}
              cy={shape.cy}
              r={shape.r}
              transform={shape.transform}
              fill={shape.fill}
              strokeWidth={3}
              animatedProps={animatedProps}
            />
          );
        })}
      </Svg>
    </View>
  );
};

export default RippleCirclesAnimated;
