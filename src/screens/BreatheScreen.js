/**
 * BREATHING SCREEN - PRIVACY-FIRST MINDFUL BREATHING
 * 
 * Implements precise breathing cycles with haptic feedback and animations.
 * Session data (duration, cycles) stored locally in AsyncStorage only.
 * NO external services, analytics, or data transmission.
 * Uses theme.breathingConfig for customizable timing.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import AnimatedButton from '../components/AnimatedButton';
import { theme, breathingConfig } from '../config/theme';
import { useAppStore } from '../store/useAppStore';

const { width, height } = Dimensions.get('window');

const BREATHING_PHASES = {
  INHALE: 'inhale',
  HOLD: 'hold',
  EXHALE: 'exhale',
  PAUSE: 'pause',
};

export default function BreatheScreen({ navigation }) {
  const [currentPhase, setCurrentPhase] = useState(BREATHING_PHASES.PAUSE);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showStop, setShowStop] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const { addBreathingSession, settings } = useAppStore();
  
  // FIXED: Breathing animation shared values with proper initialization
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);
  
  // Animation refs for cleanup
  const animationRefs = React.useRef([]);

  // Animated styles for breathing circle
  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Start breathing session
  const startBreathing = async () => {
    setIsRunning(true);
    setSessionStartTime(Date.now());
    setCurrentCycle(0);
    runBreathingCycle();
  };

  // FIXED: Stop breathing session with proper cleanup
  const stopBreathing = async () => {
    if (__DEV__) console.warn('🛑 Stopping breathing session');
    
    setIsRunning(false);
    setShowStop(false);
    setCurrentPhase(BREATHING_PHASES.PAUSE);
    
    // FIXED: Cancel any running animations to prevent memory leaks
    cancelAnimation(scale);
    cancelAnimation(opacity);
    
    // FIXED: Immediately reset to resting state
    scale.value = withTiming(1, { 
      duration: 500,
      easing: Easing.inOut(Easing.ease)
    });
    opacity.value = withTiming(0.8, { duration: 500 });
    
    // All user data persisted locally in AsyncStorage by design. No remote calls.
    if (sessionStartTime) {
      const sessionDuration = Date.now() - sessionStartTime;
      await addBreathingSession({
        duration: sessionDuration,
        cycles: currentCycle,
        completed: currentCycle >= breathingConfig.cycles,
      });
      
      if (__DEV__) {
        console.warn('💾 Breathing session saved locally:', {
          duration: sessionDuration + 'ms',
          cycles: currentCycle,
          storage: 'AsyncStorage'
        });
      }
      
      // Navigate to session summary
      navigation.navigate('SessionSummary', {
        type: 'breathing',
        cycles: currentCycle,
        duration: sessionDuration,
      });
    }
  };

  // FIXED: Complete breathing session with proper cleanup
  const completeBreathing = async () => {
    if (__DEV__) console.warn('🎉 Completing breathing session');
    
    setIsRunning(false);
    setShowStop(false);
    
    // FIXED: Ensure clean animation state on completion
    cancelAnimation(scale);
    cancelAnimation(opacity);
    
    // FIXED: Reset to resting state at session end
    scale.value = withTiming(1.0, { 
      duration: 1000,
      easing: Easing.inOut(Easing.ease)
    });
    opacity.value = withTiming(0.8, { duration: 1000 });
    
    // FIXED: Proper haptic feedback for completion
    try {
      if (settings.soundEnabled && Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      if (__DEV__) console.warn('Completion haptic failed:', error);
    }
    
    // All user data persisted locally in AsyncStorage by design. No remote calls.
    const sessionDuration = Date.now() - sessionStartTime;
    await addBreathingSession({
      duration: sessionDuration,
      cycles: breathingConfig.cycles,
      completed: true,
    });
    
    if (__DEV__) {
      console.warn('✅ Breathing session completed and saved locally:', {
        duration: sessionDuration + 'ms',
        cycles: breathingConfig.cycles,
        storage: 'AsyncStorage'
      });
    }
    
    // Navigate to session summary
    navigation.navigate('SessionSummary', {
      type: 'breathing',
      cycles: breathingConfig.cycles,
      duration: sessionDuration,
      completed: true,
    });
  };

  // FIXED: Helper function for haptic feedback with settings check
  const triggerInhaleHaptic = async () => {
    if (settings.hapticsEnabled !== false) { // Default to enabled
      try {
        if (Platform.OS !== 'web') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } catch (error) {
        if (__DEV__) console.warn('Haptic feedback failed:', error);
      }
    }
  };

  const triggerExhaleHaptic = async () => {
    if (settings.hapticsEnabled !== false) { // Default to enabled
      try {
        if (Platform.OS !== 'web') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } catch (error) {
        if (__DEV__) console.warn('Haptic feedback failed:', error);
      }
    }
  };

  // FIXED: Complete breathing cycle implementation using withSequence
  const runBreathingCycle = () => {
    if (currentCycle >= breathingConfig.cycles) {
      runOnJS(completeBreathing)();
      return;
    }

    // Show stop button after first cycle starts
    if (currentCycle === 0) {
      setTimeout(() => {
        runOnJS(setShowStop)(true);
      }, 1000); // Show after 1 second instead of full inhale duration
    }

    // FIXED: Debug logging in dev mode
    if (__DEV__) {
      console.warn(`🌊 Starting Breathing Cycle ${currentCycle + 1}/${breathingConfig.cycles}`, {
        inhale: breathingConfig.inhale + 'ms',
        hold: breathingConfig.hold + 'ms',
        exhale: breathingConfig.exhale + 'ms',
        reduceMotion: settings.reduceMotion
      });
    }

    // Handle reduce motion setting - replace scale with opacity pulse
    if (settings.reduceMotion) {
      runReducedMotionCycle();
      return;
    }

    // FIXED: Use withSequence for proper phase timing with explicit scale values
    scale.value = withSequence(
      // Phase 1: INHALE - scale from 1 -> 1.18 with cubic ease
      withTiming(1.18, {
        duration: breathingConfig.inhale,
        easing: Easing.inOut(Easing.cubic)
      }, (finished) => {
        if (finished) {
          runOnJS(setCurrentPhase)(BREATHING_PHASES.INHALE);
          runOnJS(triggerInhaleHaptic)();
          if (__DEV__) console.warn('🫁 Inhale phase complete');
        }
      }),
      
      // Phase 2: HOLD - maintain 1.18 for hold duration
      withDelay(breathingConfig.hold, withTiming(1.18, { duration: 0 }, (finished) => {
        if (finished) {
          runOnJS(setCurrentPhase)(BREATHING_PHASES.HOLD);
          if (__DEV__) console.warn('⏸️ Hold phase complete');
        }
      })),
      
      // Phase 3: EXHALE - scale from 1.18 -> 0.92 with quad ease out
      withTiming(0.92, {
        duration: breathingConfig.exhale,
        easing: Easing.out(Easing.quad)
      }, (finished) => {
        if (finished) {
          runOnJS(setCurrentPhase)(BREATHING_PHASES.EXHALE);
          runOnJS(triggerExhaleHaptic)();
          if (__DEV__) console.warn('🫁 Exhale phase complete');
        }
      }),
      
      // Phase 4: RETURN TO REST - scale back to 1.0
      withTiming(1.0, {
        duration: 800,
        easing: Easing.inOut(Easing.ease)
      }, (finished) => {
        if (finished && isRunning) {
          runOnJS(setCurrentPhase)(BREATHING_PHASES.PAUSE);
          runOnJS(setCurrentCycle)(currentCycle + 1);
          
          // Brief pause before next cycle
          setTimeout(() => {
            if (isRunning) {
              runOnJS(runBreathingCycle)();
            }
          }, 800);
          
          if (__DEV__) console.warn('✅ Cycle complete, returning to rest');
        }
      })
    );
  };

  // FIXED: Reduced motion alternative - opacity pulse with timer
  const runReducedMotionCycle = () => {
    // Simple opacity pulse instead of scaling
    opacity.value = withSequence(
      withTiming(1.0, { duration: breathingConfig.inhale }),
      withDelay(breathingConfig.hold, withTiming(1.0, { duration: 0 })),
      withTiming(0.6, { duration: breathingConfig.exhale }),
      withTiming(0.8, { duration: 800 }, (finished) => {
        if (finished && isRunning) {
          runOnJS(setCurrentCycle)(currentCycle + 1);
          setTimeout(() => {
            if (isRunning) {
              runOnJS(runBreathingCycle)();
            }
          }, 800);
        }
      })
    );
  };

  // Phase instruction text
  const getPhaseText = () => {
    switch (currentPhase) {
      case BREATHING_PHASES.INHALE:
        return 'Breathe in';
      case BREATHING_PHASES.HOLD:
        return 'Hold';
      case BREATHING_PHASES.EXHALE:
        return 'Breathe out';
      default:
        return 'Tap to begin';
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <AnimatedButton
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.mutedText}
            />
          </AnimatedButton>
          
          {showStop && (
            <AnimatedButton
              onPress={stopBreathing}
              style={styles.stopButton}
            >
              <Text style={styles.stopText}>Stop</Text>
            </AnimatedButton>
          )}
        </View>

        {/* Breathing Animation */}
        <View style={styles.breathingContainer}>
          <Animated.View style={[styles.breathingCircle, breathingStyle]}>
            <View style={styles.innerCircle} />
          </Animated.View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <Text style={styles.phaseText}>{getPhaseText()}</Text>
          
          {!isRunning && (
            <AnimatedButton
              onPress={startBreathing}
              style={styles.startButton}
            >
              <Text style={styles.startText}>Begin</Text>
            </AnimatedButton>
          )}
          
          {isRunning && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Cycle {currentCycle + 1} of {breathingConfig.cycles}
              </Text>
            </View>
          )}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stopButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.borderRadius.lg,
  },
  stopText: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    fontWeight: '500',
  },
  breathingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  innerCircle: {
    width: '60%',
    height: '60%',
    borderRadius: width * 0.21,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  instructionContainer: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xxl * 2,
  },
  phaseText: {
    ...theme.typography.h2,
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  startButton: {
    paddingHorizontal: theme.spacing.xl * 2,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.accent2,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.soft,
  },
  startText: {
    ...theme.typography.body,
    color: 'white',
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    opacity: 0.7,
  },
});