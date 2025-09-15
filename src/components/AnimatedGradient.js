import React, { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '../config/theme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function AnimatedGradient({
  style,
  colors = [theme.colors.bg1, theme.colors.bg2],
  animate = true,
  duration = 8000,
  children,
  ...props
}) {
  const animationValue = useSharedValue(0);

  useEffect(() => {
    if (animate) {
      animationValue.value = withRepeat(
        withTiming(1, { duration }),
        -1,
        true
      );
    }
  }, [animate, duration]);

  const animatedProps = useAnimatedProps(() => {
    const color1 = interpolateColor(
      animationValue.value,
      [0, 1],
      colors
    );
    const color2 = interpolateColor(
      animationValue.value,
      [0, 1],
      [colors[1], colors[0]]
    );

    return {
      colors: [color1, color2],
    };
  });

  return (
    <AnimatedLinearGradient
      animatedProps={animatedProps}
      style={style}
      locations={[0, 1]}
      {...props}
    >
      {children}
    </AnimatedLinearGradient>
  );
}