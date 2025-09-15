import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import AnimatedButton from '../components/AnimatedButton';
import { theme } from '../config/theme';
import { useAppStore } from '../store/useAppStore';
import { moodInference } from '../services/moodInference';

const { width, height } = Dimensions.get('window');

const CALIBRATION_STEPS = [
  {
    id: 'tap',
    title: 'Tap Test',
    instruction: 'Tap the circle 6 times at your natural pace',
    target: 6,
    type: 'tap',
  },
  {
    id: 'hold',
    title: 'Hold Test',
    instruction: 'Press and hold the circle 3 times',
    target: 3,
    type: 'hold',
  },
  {
    id: 'swipe',
    title: 'Swipe Test',
    instruction: 'Swipe across the screen 4 times in any direction',
    target: 4,
    type: 'swipe',
  },
  {
    id: 'doodle',
    title: 'Free Doodle',
    instruction: 'Draw or doodle freely for 5 seconds',
    target: 5000, // 5 seconds in milliseconds
    type: 'doodle',
  },
];

export default function MoodCalibrationScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [moodResult, setMoodResult] = useState(null);
  const [drawingPath, setDrawingPath] = useState('');
  const [doodleStartTime, setDoodleStartTime] = useState(null);
  
  const { saveMoodCalibration, updateMoodInference } = useAppStore();
  
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  
  const currentStepData = CALIBRATION_STEPS[currentStep];
  const isLastStep = currentStep === CALIBRATION_STEPS.length - 1;

  // Initialize mood inference
  React.useEffect(() => {
    moodInference.startCalibration();
  }, []);

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const createWatercolorRipple = () => {
    rippleScale.value = 0;
    rippleOpacity.value = 0.6;
    
    rippleScale.value = withSpring(2, { stiffness: 50, damping: 15 });
    rippleOpacity.value = withTiming(0, { duration: 1500 });
  };

  // Handle tap interactions
  const handleTap = (event) => {
    if (currentStepData.type !== 'tap') return;
    
    createWatercolorRipple();
    
    const { locationX, locationY } = event.nativeEvent;
    moodInference.recordTap({
      timestamp: Date.now(),
      locationX,
      locationY,
      force: 0.5, // Placeholder for force touch
    });
    
    const newProgress = progress + 1;
    setProgress(newProgress);
    
    if (newProgress >= currentStepData.target) {
      setTimeout(() => nextStep(), 1000);
    }
  };

  // Handle hold interactions
  const holdStartTime = useRef(null);
  const holdLocation = useRef(null);

  const handlePressIn = (event) => {
    if (currentStepData.type !== 'hold') return;
    
    holdStartTime.current = Date.now();
    holdLocation.current = {
      x: event.nativeEvent.locationX,
      y: event.nativeEvent.locationY,
    };
    
    createWatercolorRipple();
  };

  const handlePressOut = () => {
    if (currentStepData.type !== 'hold' || !holdStartTime.current) return;
    
    const endTime = Date.now();
    moodInference.recordHold({
      startTime: holdStartTime.current,
      endTime,
      locationX: holdLocation.current.x,
      locationY: holdLocation.current.y,
      force: 0.5,
    });
    
    const newProgress = progress + 1;
    setProgress(newProgress);
    
    if (newProgress >= currentStepData.target) {
      setTimeout(() => nextStep(), 1000);
    }
    
    holdStartTime.current = null;
    holdLocation.current = null;
  };

  // Handle swipe and doodle interactions
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => 
      currentStepData.type === 'swipe' || currentStepData.type === 'doodle',
    onMoveShouldSetPanResponder: () => 
      currentStepData.type === 'swipe' || currentStepData.type === 'doodle',
    
    onPanResponderGrant: (event) => {
      if (currentStepData.type === 'doodle') {
        setDoodleStartTime(Date.now());
        const { locationX, locationY } = event.nativeEvent;
        setDrawingPath(`M${locationX},${locationY}`);
      }
      createWatercolorRipple();
    },
    
    onPanResponderMove: (event, gestureState) => {
      if (currentStepData.type === 'doodle') {
        const { locationX, locationY } = event.nativeEvent;
        setDrawingPath(prev => `${prev} L${locationX},${locationY}`);
      }
    },
    
    onPanResponderRelease: (event, gestureState) => {
      if (currentStepData.type === 'swipe') {
        const { dx, dy } = gestureState;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 50) { // Minimum swipe distance
          moodInference.recordSwipe({
            startTime: Date.now() - (gestureState.dt || 100),
            endTime: Date.now(),
            startLocation: { x: gestureState.x0, y: gestureState.y0 },
            endLocation: { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY },
            velocityX: gestureState.vx,
            velocityY: gestureState.vy,
          });
          
          const newProgress = progress + 1;
          setProgress(newProgress);
          
          if (newProgress >= currentStepData.target) {
            setTimeout(() => nextStep(), 1000);
          }
        }
      } else if (currentStepData.type === 'doodle' && doodleStartTime) {
        const endTime = Date.now();
        const duration = endTime - doodleStartTime;
        
        // Convert path string to points array
        const pathPoints = drawingPath
          .split(/[ML]/)
          .slice(1)
          .map(point => {
            const [x, y] = point.split(',').map(Number);
            return { x, y };
          });
        
        moodInference.recordStroke({
          path: pathPoints,
          startTime: doodleStartTime,
          endTime,
          pressure: pathPoints.map(() => 0.5), // Placeholder pressure data
        });
        
        // Check if 5 seconds have passed
        if (duration >= currentStepData.target) {
          setTimeout(() => nextStep(), 1000);
        } else {
          setProgress((duration / currentStepData.target) * 100);
        }
      }
    },
  });

  const nextStep = () => {
    if (isLastStep) {
      completeCalibration();
    } else {
      setCurrentStep(currentStep + 1);
      setProgress(0);
      setDrawingPath('');
      setDoodleStartTime(null);
    }
  };

  const completeCalibration = async () => {
    // PRIVACY: Process mood inference entirely on-device
    const result = moodInference.completeCalibration();
    setMoodResult(result);
    setIsComplete(true);
    
    // PRIVACY: Save calibration results to local AsyncStorage only
    await saveMoodCalibration(result);
    updateMoodInference(result);
    
    // DEBUG: Confirm mood calibration is working and stored locally
    console.log('🧠 Mood Calibration Saved:', {
      mood: result.mood,
      confidence: Math.round(result.confidence * 100) + '%',
      isConfident: result.isConfident,
      storage: 'LOCAL_ONLY (AsyncStorage)',
      touchDataPoints: Object.keys(result.features).length
    });
  };

  const handleFinish = () => {
    navigation.goBack();
  };

  const getMoodMessage = () => {
    if (!moodResult) return '';
    
    const { mood, confidence, isConfident } = moodResult;
    
    if (!isConfident) {
      return "Not sure — want to try a check-in?";
    }
    
    const moodMessages = {
      calm: "You might be feeling calm — want a gentle moment?",
      tense: "You might be feeling a bit tense — want a 2-minute breath?",
      joyful: "You seem joyful — care to celebrate this moment?",
      flat: "Feeling neutral? That's perfectly okay too.",
    };
    
    return moodMessages[mood] || "How are you feeling right now?";
  };

  if (isComplete && moodResult) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.completionContent}>
            <View style={styles.completionIcon}>
              <Text style={styles.completionEmoji}>✨</Text>
            </View>
            
            <Text style={styles.completionTitle}>Calibration Complete</Text>
            
            <View style={styles.moodResultContainer}>
              <Text style={styles.moodMessage}>{getMoodMessage()}</Text>
              <Text style={styles.confidenceText}>
                Confidence: {Math.round(moodResult.confidence * 100)}%
              </Text>
            </View>
            
            <AnimatedButton
              onPress={handleFinish}
              style={styles.finishButton}
            >
              <Text style={styles.finishButtonText}>Continue</Text>
            </AnimatedButton>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
          
          <Text style={styles.headerTitle}>Touch Calibration</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.stepText}>
            Step {currentStep + 1} of {CALIBRATION_STEPS.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentStep / CALIBRATION_STEPS.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Current Step */}
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepInstruction}>{currentStepData.instruction}</Text>
          
          {/* Progress for current step */}
          <Text style={styles.stepProgress}>
            {currentStepData.type === 'doodle' 
              ? `${Math.round((progress / currentStepData.target) * 100)}%`
              : `${progress} / ${currentStepData.target}`
            }
          </Text>
        </View>

        {/* Interaction Area */}
        <View 
          style={styles.interactionArea}
          {...panResponder.panHandlers}
        >
          {/* Doodle Canvas */}
          {currentStepData.type === 'doodle' && (
            <Svg style={styles.doodleCanvas} width={width} height={200}>
              <Path
                d={drawingPath}
                stroke={theme.colors.accent}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
          
          {/* Touch Target */}
          {(currentStepData.type === 'tap' || currentStepData.type === 'hold') && (
            <AnimatedButton
              onPress={handleTap}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.touchTarget}
            >
              <Text style={styles.touchTargetText}>
                {currentStepData.type === 'tap' ? 'Tap' : 'Hold'}
              </Text>
            </AnimatedButton>
          )}
          
          {/* Swipe Area */}
          {currentStepData.type === 'swipe' && (
            <View style={styles.swipeArea}>
              <Text style={styles.swipeText}>Swipe anywhere here</Text>
              <Ionicons 
                name="swap-horizontal-outline" 
                size={48} 
                color={theme.colors.mutedText} 
              />
            </View>
          )}
          
          {/* Watercolor Ripple Effect */}
          <Animated.View style={[styles.ripple, rippleStyle]} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.mutedText,
  },
  headerSpacer: {
    width: 56,
  },
  progressSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  stepText: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
  },
  stepContent: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  stepTitle: {
    ...theme.typography.h2,
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.sm,
  },
  stepInstruction: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: theme.spacing.lg,
  },
  stepProgress: {
    ...theme.typography.small,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  interactionArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    position: 'relative',
  },
  touchTarget: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  touchTargetText: {
    ...theme.typography.body,
    color: 'white',
    fontWeight: '600',
  },
  swipeArea: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderStyle: 'dashed',
  },
  swipeText: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.md,
  },
  doodleCanvas: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: theme.borderRadius.lg,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.accent,
    opacity: 0.3,
  },
  completionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  completionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.soft,
  },
  completionEmoji: {
    fontSize: 40,
  },
  completionTitle: {
    ...theme.typography.h1,
    color: theme.colors.mutedText,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  moodResultContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  moodMessage: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontWeight: '500',
  },
  confidenceText: {
    ...theme.typography.small,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.xl * 2,
    paddingVertical: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  finishButtonText: {
    ...theme.typography.body,
    color: 'white',
    fontWeight: '600',
  },
});