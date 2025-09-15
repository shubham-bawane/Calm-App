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
import { hapticsManager } from '../utils/hapticsManager';

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
  // FIXED: Add live countdown timer state
  const [countdown, setCountdown] = useState(0);

  const { addBreathingSession, settings } = useAppStore();
  
  // FIXED: Breathing animation shared values with proper initialization
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);
  
  // FIXED: Timer refs for proper cleanup
  const timerRefs = React.useRef([]);
  const countdownInterval = React.useRef(null);

  // FIXED: Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (__DEV__) console.warn('🧹 Cleaning up breathing screen');
      clearAllTimers();
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  // FIXED: Animated styles for breathing circle with reduce motion support
  const breathingStyle = useAnimatedStyle(() => {
    if (settings.reduceMotion) {
      return {
        transform: [{ scale: 1 }], // No scaling in reduce motion mode
        opacity: opacity.value,
      };
    }
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Start breathing session
  const startBreathing = async () => {
    setIsRunning(true);
    setSessionStartTime(Date.now());
    setCurrentCycle(0);
    runBreathingCycle();
  };

  // FIXED: Stop breathing session with complete cleanup
  const stopBreathing = async () => {
    if (__DEV__) console.warn('🛑 Stopping breathing session');
    
    setIsRunning(false);
    setShowStop(false);
    setCurrentPhase(BREATHING_PHASES.PAUSE);
    setCountdown(0);
    
    // FIXED: Clear all timers and animations to prevent memory leaks
    clearAllTimers();
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
        date: new Date().toISOString(),
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
    if (__DEV__) console.warn('🎉 Completing breathing session - all cycles done');
    
    setIsRunning(false);
    setShowStop(false);
    setCurrentPhase(BREATHING_PHASES.PAUSE);
    setCountdown(0);
    
    // FIXED: Clear all timers and animations
    clearAllTimers();
    cancelAnimation(scale);
    cancelAnimation(opacity);
    
    // FIXED: Reset to resting state at session end
    scale.value = withTiming(1.0, { 
      duration: 1000,
      easing: Easing.inOut(Easing.ease)
    });
    opacity.value = withTiming(0.8, { duration: 1000 });
    
    // FIXED: Proper haptic feedback for completion
    if (settings.soundEnabled) {
      await hapticsManager.triggerSuccess(settings.hapticsEnabled !== false);
    }
    
    // All user data persisted locally in AsyncStorage by design. No remote calls.
    const sessionDuration = Date.now() - sessionStartTime;
    await addBreathingSession({
      date: new Date().toISOString(),
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

  // FIXED: Helper functions using centralized haptics manager
  const triggerInhaleHaptic = async () => {
    await hapticsManager.triggerInhaleHaptic(settings.hapticsEnabled !== false);
  };

  const triggerExhaleHaptic = async () => {
    await hapticsManager.triggerExhaleHaptic(settings.hapticsEnabled !== false);
  };

  // FIXED: Clear all timers helper
  const clearAllTimers = () => {
    timerRefs.current.forEach(timer => clearTimeout(timer));
    timerRefs.current = [];
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
  };

  // FIXED: Live countdown timer for each phase
  const startCountdown = (phase, duration) => {
    let timeLeft = Math.ceil(duration / 1000);
    setCountdown(timeLeft);
    
    countdownInterval.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
    }, 1000);
  };

  // FIXED: Complete breathing cycle implementation with proper multi-cycle loop
  const runBreathingCycle = () => {
    if (currentCycle >= breathingConfig.cycles) {
      completeBreathing();
      return;
    }

    // Show stop button after first cycle starts
    if (currentCycle === 0) {
      const timer = setTimeout(() => {
        setShowStop(true);
      }, 1000);
      timerRefs.current.push(timer);
    }

    // FIXED: Debug logging with proper cycle numbers
    if (__DEV__) {
      console.warn(`🌊 Starting Breathing Cycle ${currentCycle + 1}/${breathingConfig.cycles}`, {
        inhale: breathingConfig.inhale + 'ms',
        hold: breathingConfig.hold + 'ms',
        exhale: breathingConfig.exhale + 'ms',
        reduceMotion: settings.reduceMotion
      });
    }

    // Handle reduce motion setting
    if (settings.reduceMotion) {
      runReducedMotionCycle();
      return;
    }

    // PHASE 1: INHALE
    setCurrentPhase(BREATHING_PHASES.INHALE);
    startCountdown(BREATHING_PHASES.INHALE, breathingConfig.inhale);
    triggerInhaleHaptic();
    
    scale.value = withTiming(1.18, {
      duration: breathingConfig.inhale,
      easing: Easing.inOut(Easing.cubic)
    });

    const inhaleTimer = setTimeout(() => {
      if (!isRunning) return;
      
      // PHASE 2: HOLD
      setCurrentPhase(BREATHING_PHASES.HOLD);
      startCountdown(BREATHING_PHASES.HOLD, breathingConfig.hold);
      
      if (__DEV__) console.warn('⏸️ Hold phase started');
      
      const holdTimer = setTimeout(() => {
        if (!isRunning) return;
        
        // PHASE 3: EXHALE
        setCurrentPhase(BREATHING_PHASES.EXHALE);
        startCountdown(BREATHING_PHASES.EXHALE, breathingConfig.exhale);
        triggerExhaleHaptic();
        
        scale.value = withTiming(0.92, {
          duration: breathingConfig.exhale,
          easing: Easing.out(Easing.quad)
        });
        
        if (__DEV__) console.warn('🫁 Exhale phase started');
        
        const exhaleTimer = setTimeout(() => {
          if (!isRunning) return;
          
          // PHASE 4: RETURN TO REST & NEXT CYCLE
          setCurrentPhase(BREATHING_PHASES.PAUSE);
          setCountdown(0);
          
          scale.value = withTiming(1.0, {
            duration: 800,
            easing: Easing.inOut(Easing.ease)
          });
          
          // Increment cycle counter
          setCurrentCycle(prev => prev + 1);
          
          if (__DEV__) console.warn(`✅ Cycle ${currentCycle + 1} complete`);
          
          // Brief pause before next cycle
          const pauseTimer = setTimeout(() => {
            if (isRunning) {
              runBreathingCycle();
            }
          }, 800);
          timerRefs.current.push(pauseTimer);
        }, breathingConfig.exhale);
        timerRefs.current.push(exhaleTimer);
      }, breathingConfig.hold);
      timerRefs.current.push(holdTimer);
    }, breathingConfig.inhale);
    timerRefs.current.push(inhaleTimer);
  };

  // FIXED: Reduced motion alternative with countdown
  const runReducedMotionCycle = () => {
    // PHASE 1: INHALE
    setCurrentPhase(BREATHING_PHASES.INHALE);
    startCountdown(BREATHING_PHASES.INHALE, breathingConfig.inhale);
    opacity.value = withTiming(1.0, { duration: breathingConfig.inhale });
    
    const inhaleTimer = setTimeout(() => {
      if (!isRunning) return;
      
      // PHASE 2: HOLD
      setCurrentPhase(BREATHING_PHASES.HOLD);
      startCountdown(BREATHING_PHASES.HOLD, breathingConfig.hold);
      
      const holdTimer = setTimeout(() => {
        if (!isRunning) return;
        
        // PHASE 3: EXHALE
        setCurrentPhase(BREATHING_PHASES.EXHALE);
        startCountdown(BREATHING_PHASES.EXHALE, breathingConfig.exhale);
        opacity.value = withTiming(0.6, { duration: breathingConfig.exhale });
        
        const exhaleTimer = setTimeout(() => {
          if (!isRunning) return;
          
          // RETURN TO REST & NEXT CYCLE
          setCurrentPhase(BREATHING_PHASES.PAUSE);
          setCountdown(0);
          opacity.value = withTiming(0.8, { duration: 800 });
          setCurrentCycle(prev => prev + 1);
          
          const pauseTimer = setTimeout(() => {
            if (isRunning) {
              runBreathingCycle();
            }
          }, 800);
          timerRefs.current.push(pauseTimer);
        }, breathingConfig.exhale);
        timerRefs.current.push(exhaleTimer);
      }, breathingConfig.hold);
      timerRefs.current.push(holdTimer);
    }, breathingConfig.inhale);
    timerRefs.current.push(inhaleTimer);
  };

  // FIXED: Phase instruction text with live countdown timer
  const getPhaseText = () => {
    if (!isRunning) {
      return 'Tap to begin';
    }
    
    // Show cycle progress
    const cycleProgress = `Cycle ${currentCycle + 1} of ${breathingConfig.cycles}`;
    
    switch (currentPhase) {
      case BREATHING_PHASES.INHALE:
        return 'Breathe in';
      case BREATHING_PHASES.HOLD:
        return 'Hold';
      case BREATHING_PHASES.EXHALE:
        return 'Breathe out';
      case BREATHING_PHASES.PAUSE:
        return cycleProgress;
      default:
        return cycleProgress;
    }
  };

  // FIXED: Live countdown display
  const getCountdownText = () => {
    if (!isRunning || countdown <= 0) return '';
    
    const phaseLabels = {
      [BREATHING_PHASES.INHALE]: 'Inhale',
      [BREATHING_PHASES.HOLD]: 'Hold',
      [BREATHING_PHASES.EXHALE]: 'Exhale',
    };
    
    const label = phaseLabels[currentPhase] || '';
    return `${label}: ${countdown}s`;
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
          
          {/* FIXED: Live countdown timer display */}
          {isRunning && countdown > 0 && (
            <Text style={styles.countdownText}>{getCountdownText()}</Text>
          )}
          
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
  // FIXED: Live countdown timer styling - large, calm, prominent
  countdownText: {
    fontSize: 32,
    fontWeight: '300',
    color: theme.colors.accent,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    letterSpacing: 1,
  },
});