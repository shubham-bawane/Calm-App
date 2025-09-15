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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
  runOnJS,
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
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

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

  // Stop breathing session
  const stopBreathing = async () => {
    setIsRunning(false);
    setShowStop(false);
    setCurrentPhase(BREATHING_PHASES.PAUSE);
    scale.value = withTiming(1, { duration: 500 });
    
    // Save session data
    if (sessionStartTime) {
      const sessionDuration = Date.now() - sessionStartTime;
      await addBreathingSession({
        duration: sessionDuration,
        cycles: currentCycle,
        completed: currentCycle >= breathingConfig.cycles,
      });
      
      // Navigate to session summary
      navigation.navigate('SessionSummary', {
        type: 'breathing',
        cycles: currentCycle,
        duration: sessionDuration,
      });
    }
  };

  // Complete breathing session
  const completeBreathing = async () => {
    setIsRunning(false);
    setShowStop(false);
    
    // FIXED: Reset circle to resting state at session end
    scale.value = withTiming(1.0, { duration: 1000 });
    
    // Play completion chime if sound enabled
    if (settings.soundEnabled) {
      // Placeholder for chime sound
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // PRIVACY NOTE: Save completed session locally to AsyncStorage only
    const sessionDuration = Date.now() - sessionStartTime;
    await addBreathingSession({
      duration: sessionDuration,
      cycles: breathingConfig.cycles,
      completed: true,
    });
    
    // Navigate to session summary
    navigation.navigate('SessionSummary', {
      type: 'breathing',
      cycles: breathingConfig.cycles,
      duration: sessionDuration,
      completed: true,
    });
  };

  // Run single breathing cycle
  const runBreathingCycle = () => {
    if (currentCycle >= breathingConfig.cycles) {
      runOnJS(completeBreathing)();
      return;
    }

    // Show stop button after first cycle starts
    if (currentCycle === 0) {
      setTimeout(() => {
        runOnJS(setShowStop)(true);
      }, breathingConfig.inhale);
    }

    // FIXED: Reset to baseline before starting each cycle
    scale.value = withTiming(1.0, { duration: 500 }, () => {
      // Inhale phase - expand circle
      runOnJS(setCurrentPhase)(BREATHING_PHASES.INHALE);
      scale.value = withTiming(1.18, {
        duration: breathingConfig.inhale,
      });
      
      // Haptic feedback for inhale
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setTimeout(() => {
        if (!isRunning) return;
        
        // Hold phase - maintain size
        runOnJS(setCurrentPhase)(BREATHING_PHASES.HOLD);
        
        setTimeout(() => {
          if (!isRunning) return;
          
          // Exhale phase - contract circle
          runOnJS(setCurrentPhase)(BREATHING_PHASES.EXHALE);
          scale.value = withTiming(0.92, {
            duration: breathingConfig.exhale,
          });
          
          // Haptic feedback for exhale
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          
          setTimeout(() => {
            if (!isRunning) return;
            
            // Return to resting state before next cycle
            scale.value = withTiming(1.0, { duration: 1000 }, () => {
              runOnJS(setCurrentPhase)(BREATHING_PHASES.PAUSE);
              runOnJS(setCurrentCycle)(currentCycle + 1);
              
              // Brief pause before next cycle
              setTimeout(() => {
                if (isRunning) {
                  runOnJS(runBreathingCycle)();
                }
              }, 500);
            });
          }, breathingConfig.exhale);
        }, breathingConfig.hold);
      }, breathingConfig.inhale);
    });
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