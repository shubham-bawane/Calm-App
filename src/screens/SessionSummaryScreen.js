import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { theme } from '../config/theme';
import { useAppStore } from '../store/useAppStore';

const MOODS = [
  { id: 'calm', emoji: '🌊' },
  { id: 'neutral', emoji: '⚪' },
  { id: 'joyful', emoji: '☀️' },
  { id: 'tense', emoji: '⚡' },
  { id: 'sad', emoji: '🌧️' },
];

export default function SessionSummaryScreen({ navigation, route }) {
  const { type, mood, message, cycles, duration, completed } = route.params || {};
  const { currentMood } = useAppStore();
  
  const fadeValue = useSharedValue(0);
  const scaleValue = useSharedValue(0.8);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
    transform: [{ scale: scaleValue.value }],
  }));

  useEffect(() => {
    // Fade in animation
    fadeValue.value = withTiming(1, { duration: 800 });
    scaleValue.value = withTiming(1, { duration: 800 });

    // Auto-navigate back after 3 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    // Fade out and navigate
    fadeValue.value = withTiming(0, { duration: 400 });
    scaleValue.value = withTiming(0.8, { duration: 400 });
    
    setTimeout(() => {
      navigation.navigate('Home');
    }, 400);
  };

  const getSessionContent = () => {
    switch (type) {
      case 'breathing':
        return {
          emoji: '🍃',
          title: completed ? 'Well done' : 'Good pause',
          subtitle: completed 
            ? `${cycles} cycles completed` 
            : `${cycles} cycles, ${Math.round(duration / 1000)}s`,
          message: 'You did well. That\'s enough for now.',
        };
      
      case 'habit':
        return {
          emoji: '✨',
          title: 'Nice',
          subtitle: 'A gentle moment of care',
          message: message || 'You did well. That\'s enough for now.',
        };
      
      case 'journal':
        const moodData = MOODS.find(m => m.id === mood);
        return {
          emoji: moodData?.emoji || '💙',
          title: 'Checked in',
          subtitle: 'Awareness is the first step',
          message: 'You did well. That\'s enough for now.',
        };
      
      default:
        return {
          emoji: '💙',
          title: 'Well done',
          subtitle: 'A moment of mindfulness',
          message: 'You did well. That\'s enough for now.',
        };
    }
  };

  const content = getSessionContent();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {/* Main Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.sessionEmoji}>{content.emoji}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{content.title}</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>{content.subtitle}</Text>

          {/* Main Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{content.message}</Text>
          </View>

          {/* Gentle Close Suggestion */}
          <View style={styles.closeHint}>
            <Text style={styles.closeHintText}>
              Returning to calm in 3 seconds...
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.soft,
  },
  sessionEmoji: {
    fontSize: 48,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.mutedText,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: theme.spacing.xxl,
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.soft,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  closeHint: {
    position: 'absolute',
    bottom: theme.spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  closeHintText: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    opacity: 0.5,
    textAlign: 'center',
  },
});