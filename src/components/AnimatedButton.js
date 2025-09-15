import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '../config/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AnimatedButton({
  children,
  onPress,
  style,
  pressStyle,
  hapticFeedback = true,
  pulseAnimation = false,
  ...props
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Pulsing animation for CTA button
  React.useEffect(() => {
    if (pulseAnimation) {
      const startPulse = () => {
        scale.value = withSequence(
          withTiming(1.02, { duration: 1600 }),
          withTiming(1, { duration: 1600 })
        );
      };

      startPulse();
      const interval = setInterval(startPulse, 3200);
      return () => clearInterval(interval);
    }
  }, [pulseAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(theme.animations.buttonPress.scale, {
      stiffness: theme.animations.buttonPress.spring.stiffness,
      damping: theme.animations.buttonPress.spring.damping,
    });
    opacity.value = withTiming(0.8, { duration: 150 });
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      stiffness: theme.animations.buttonPress.spring.stiffness,
      damping: theme.animations.buttonPress.spring.damping,
    });
    opacity.value = withTiming(1, { duration: 150 });
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[style, animatedStyle]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}