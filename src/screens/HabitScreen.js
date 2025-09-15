/**
 * HABIT TRACKER - PRIVACY-FIRST GENTLE HABITS
 * 
 * This screen implements a gentle habit tracking system with plant growth metaphor.
 * ALL habit completion data is stored locally using AsyncStorage.
 * NO external tracking, analytics, or social features.
 * User maintains complete privacy and control over their wellness data.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import AnimatedButton from '../components/AnimatedButton';
import { theme } from '../config/theme';
import { useAppStore } from '../store/useAppStore';
import { hapticsManager } from '../utils/hapticsManager';

const HABITS = [
  {
    id: 'breathe',
    icon: 'leaf-outline',
    title: 'Two deep breaths',
    description: 'Inhale slowly, exhale completely',
  },
  {
    id: 'window',
    icon: 'eye-outline',
    title: 'Look out window 30s',
    description: 'Notice what\'s beyond the glass',
  },
  {
    id: 'word',
    icon: 'create-outline',
    title: 'Write one word',
    description: 'Just one word that comes to mind',
  },
];

export default function HabitScreen({ navigation }) {
  const { habitProgress, completeHabit } = useAppStore();
  const [completingHabit, setCompletingHabit] = useState(null);
  
  const plantScale = useSharedValue(1);
  const plantOpacity = useSharedValue(1);

  const plantStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plantScale.value }],
    opacity: plantOpacity.value,
  }));

  const handleHabitComplete = async (habitId) => {
    if (habitProgress.completedToday.includes(habitId)) return;
    
    setCompletingHabit(habitId);
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Plant growth animation
    plantScale.value = withSequence(
      withSpring(1.2, {
        stiffness: theme.animations.plantGrowth.spring.stiffness,
        damping: theme.animations.plantGrowth.spring.damping,
      }),
      withSpring(1, {
        stiffness: theme.animations.plantGrowth.spring.stiffness,
        damping: theme.animations.plantGrowth.spring.damping,
      })
    );
    
    // Complete habit in store
    await completeHabit(habitId);
    
    // Show completion message
    setTimeout(() => {
      runOnJS(showCompletionMessage)();
    }, 1000);
  };

  const showCompletionMessage = () => {
    navigation.navigate('SessionSummary', {
      type: 'habit',
      message: 'Nice. That was enough.',
    });
  };

  const getPlantLevel = () => {
    const level = habitProgress.level;
    if (level <= 3) return '🌱'; // Seedling
    if (level <= 6) return '🌿'; // Small plant
    if (level <= 10) return '🍃'; // Medium plant
    return '🌳'; // Tree
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
          
          <Text style={styles.headerTitle}>Gentle Habits</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Plant Section */}
          <View style={styles.plantSection}>
            <Animated.View style={[styles.plantContainer, plantStyle]}>
              <Text style={styles.plantEmoji}>{getPlantLevel()}</Text>
            </Animated.View>
            <Text style={styles.plantText}>
              Your calm companion grows slowly
            </Text>
            <Text style={styles.levelText}>
              Level {habitProgress.level}
            </Text>
          </View>

          {/* Habits List */}
          <View style={styles.habitsSection}>
            <Text style={styles.sectionTitle}>Today's gentle practices</Text>
            
            {HABITS.map((habit) => {
              const isCompleted = habitProgress.completedToday.includes(habit.id);
              const isCompleting = completingHabit === habit.id;
              
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={isCompleted}
                  isCompleting={isCompleting}
                  onComplete={() => handleHabitComplete(habit.id)}
                />
              );
            })}
          </View>

          {/* Growth Progress */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Growth Points</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(habitProgress.growthPoints % 10) * 10}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {habitProgress.growthPoints % 10} / 10 to next level
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function HabitCard({ habit, isCompleted, isCompleting, onComplete }) {
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const handlePress = () => {
    if (isCompleted) return;
    
    // Card animation
    cardScale.value = withSequence(
      withTiming(1.05, { duration: 200 }),
      withSpring(1, { stiffness: 100, damping: 10 })
    );
    
    onComplete();
  };

  return (
    <AnimatedButton
      onPress={handlePress}
      style={[
        styles.habitCard,
        cardStyle,
        isCompleted && styles.habitCardCompleted,
      ]}
      disabled={isCompleted}
    >
      <View style={styles.habitIcon}>
        <Ionicons
          name={habit.icon}
          size={32}
          color={isCompleted ? theme.colors.accent : theme.colors.mutedText}
        />
      </View>
      
      <View style={styles.habitContent}>
        <Text style={[
          styles.habitTitle,
          isCompleted && styles.habitTitleCompleted,
        ]}>
          {habit.title}
        </Text>
        <Text style={[
          styles.habitDescription,
          isCompleted && styles.habitDescriptionCompleted,
        ]}>
          {habit.description}
        </Text>
      </View>
      
      {isCompleted && (
        <View style={styles.completedIcon}>
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={theme.colors.accent}
          />
        </View>
      )}
      
      {isCompleting && (
        <View style={styles.completingIndicator}>
          <Text style={styles.completingText}>✨</Text>
        </View>
      )}
    </AnimatedButton>
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
    width: 56, // Same as back button width
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  plantSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    paddingVertical: theme.spacing.xl,
  },
  plantContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  plantEmoji: {
    fontSize: 64,
  },
  plantText: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  levelText: {
    ...theme.typography.small,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  habitsSection: {
    marginBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  habitCardCompleted: {
    backgroundColor: 'rgba(160, 213, 176, 0.3)',
  },
  habitIcon: {
    marginRight: theme.spacing.lg,
  },
  habitContent: {
    flex: 1,
  },
  habitTitle: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  habitTitleCompleted: {
    color: theme.colors.accent,
  },
  habitDescription: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    opacity: 0.7,
  },
  habitDescriptionCompleted: {
    opacity: 0.8,
  },
  completedIcon: {
    marginLeft: theme.spacing.md,
  },
  completingIndicator: {
    marginLeft: theme.spacing.md,
  },
  completingText: {
    fontSize: 20,
  },
  progressSection: {
    alignItems: 'center',
  },
  progressTitle: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 4,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 4,
  },
  progressText: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    opacity: 0.7,
  },
});