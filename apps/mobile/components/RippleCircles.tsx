import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { Svg, Circle as SVGCircle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(SVGCircle);

const RippleCircles = ({
  callback,
  disabled = false,
  onAnimateEnd,
}: {
  callback?: () => void | Promise<void>;
  disabled?: boolean;
  onAnimateEnd?: () => void | Promise<void>;
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
  const loopInterval = useRef<number | null>(null);

  const animateOnce = () => {
    for (let i = 0; i < progressList.length; i++) {
      const reverseIndex = progressList.length - 1 - i;
      progressList[reverseIndex].value = withDelay(
        i * 200,
        withSequence(
          withTiming(1, { duration: 1200 }),
          withTiming(0, { duration: 1200 }),
        ),
      );
    }
  };

  const startRippleLoop = () => {
    if (loopInterval.current) return; // prevent multiple loops

    animateOnce(); // kick off once immediately

    loopInterval.current = setInterval(() => {
      animateOnce();
    }, 3400);
  };

  const stopRippleLoop = () => {
    if (loopInterval.current) {
      clearInterval(loopInterval.current);
      loopInterval.current = null;
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-black">
      <Svg
        width={vWidth}
        height={vHeight}
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

            return {
              stroke: strokeColor,
            };
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

      <TouchableOpacity
        onPress={async () => {
          startRippleLoop();

          try {
            if (callback) {
              await callback();
            }

            if (onAnimateEnd) {
              await onAnimateEnd();
            }
          } catch (_) {
          } finally {
            stopRippleLoop();
          }
        }}
        className="absolute bottom-20 h-[330px] w-[330px] rounded-full items-center justify-center disabled:opacity-50"
        disabled={disabled}
      >
        <Text className="text-white font-semibold text-4xl uppercase w-full text-center">
          Send a Beacon
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RippleCircles;
