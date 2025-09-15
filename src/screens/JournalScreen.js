import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedButton from '../components/AnimatedButton';
import { theme } from '../config/theme';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');

const MOODS = [
  { id: 'calm', label: 'Calm', color: theme.colors.calm, emoji: '🌊' },
  { id: 'neutral', label: 'Neutral', color: theme.colors.neutral, emoji: '⚪' },
  { id: 'joyful', label: 'Joyful', color: theme.colors.joyful, emoji: '☀️' },
  { id: 'tense', label: 'Tense', color: theme.colors.tense, emoji: '⚡' },
  { id: 'sad', label: 'Sad', color: theme.colors.sad, emoji: '🌧️' },
];

export default function JournalScreen({ navigation }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [showInput, setShowInput] = useState(false);
  
  const { addJournalEntry, journalEntries } = useAppStore();
  
  const backgroundProgress = useSharedValue(0);

  const backgroundStyle = useAnimatedStyle(() => {
    if (!selectedMood) {
      return {
        backgroundColor: theme.colors.bg1,
      };
    }

    const selectedMoodData = MOODS.find(m => m.id === selectedMood);
    const targetColor = selectedMoodData ? selectedMoodData.color : theme.colors.bg1;

    return {
      backgroundColor: interpolateColor(
        backgroundProgress.value,
        [0, 1],
        [theme.colors.bg1, targetColor]
      ),
    };
  });

  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId);
    setShowInput(true);
    
    // Animate background color
    backgroundProgress.value = withTiming(0.3, { duration: 900 });
  };

  const handleSave = async () => {
    if (!selectedMood) return;
    
    await addJournalEntry({
      mood: selectedMood,
      text: journalText.trim(),
    });
    
    // Navigate to session summary
    navigation.navigate('SessionSummary', {
      type: 'journal',
      mood: selectedMood,
      hasText: journalText.trim().length > 0,
    });
  };

  const getWeeklySummary = () => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentEntries = journalEntries.filter(
      entry => new Date(entry.date).getTime() > oneWeekAgo
    );
    
    if (recentEntries.length === 0) {
      return "Start your first entry above";
    }
    
    const moodCounts = recentEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});
    
    const dominantMood = Object.keys(moodCounts).reduce((a, b) =>
      moodCounts[a] > moodCounts[b] ? a : b
    );
    
    const moodLabel = MOODS.find(m => m.id === dominantMood)?.label || dominantMood;
    return `This week felt mostly ${moodLabel.toLowerCase()}`;
  };

  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
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
          
          <Text style={styles.headerTitle}>How are you?</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Mood Bubbles */}
          <View style={styles.moodsSection}>
            <Text style={styles.instructionText}>
              Choose what feels closest
            </Text>
            
            <View style={styles.moodBubbles}>
              {MOODS.map((mood) => (
                <MoodBubble
                  key={mood.id}
                  mood={mood}
                  isSelected={selectedMood === mood.id}
                  onPress={() => handleMoodSelect(mood.id)}
                />
              ))}
            </View>
          </View>

          {/* Selected Mood Display */}
          {selectedMood && (
            <View style={styles.selectedMoodSection}>
              <View style={styles.moodBlob}>
                <Text style={styles.moodBlobEmoji}>
                  {MOODS.find(m => m.id === selectedMood)?.emoji}
                </Text>
              </View>
            </View>
          )}

          {/* Text Input */}
          {showInput && (
            <View style={styles.inputSection}>
              <TextInput
                style={styles.textInput}
                placeholder="One word or one sentence — optional"
                placeholderTextColor={`${theme.colors.mutedText}80`}
                value={journalText}
                onChangeText={setJournalText}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />
              
              <AnimatedButton
                onPress={handleSave}
                style={styles.saveButton}
              >
                <Text style={styles.saveText}>Save</Text>
              </AnimatedButton>
            </View>
          )}

          {/* Weekly Summary */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>This week</Text>
            <WeeklyTimeline entries={journalEntries} />
            <Text style={styles.summaryText}>{getWeeklySummary()}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

function MoodBubble({ mood, isSelected, onPress }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedButton
      onPress={onPress}
      style={[styles.moodBubble, bubbleStyle]}
    >
      <LinearGradient
        colors={[mood.color, `${mood.color}80`]}
        style={[
          styles.moodBubbleGradient,
          isSelected && styles.moodBubbleSelected,
        ]}
      >
        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
        <Text style={styles.moodLabel}>{mood.label}</Text>
      </LinearGradient>
    </AnimatedButton>
  );
}

function WeeklyTimeline({ entries }) {
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
    const dayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === date.toDateString();
    });
    
    days.push({
      date,
      entries: dayEntries,
      mood: dayEntries.length > 0 ? dayEntries[dayEntries.length - 1].mood : null,
    });
  }

  return (
    <View style={styles.timeline}>
      {days.map((day, index) => {
        const moodData = day.mood ? MOODS.find(m => m.id === day.mood) : null;
        
        return (
          <View key={index} style={styles.timelineDay}>
            <View
              style={[
                styles.timelineBlob,
                {
                  backgroundColor: moodData ? moodData.color : theme.colors.neutral,
                  opacity: moodData ? 0.8 : 0.3,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  moodsSection: {
    marginBottom: theme.spacing.xxl,
  },
  instructionText: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  moodBubbles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  moodBubble: {
    marginBottom: theme.spacing.sm,
  },
  moodBubbleGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  moodBubbleSelected: {
    transform: [{ scale: 1.1 }],
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  moodLabel: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    fontWeight: '500',
  },
  selectedMoodSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  moodBlob: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  moodBlobEmoji: {
    fontSize: 48,
  },
  inputSection: {
    marginBottom: theme.spacing.xxl,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.typography.body,
    color: theme.colors.mutedText,
    minHeight: 100,
    marginBottom: theme.spacing.lg,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  saveText: {
    ...theme.typography.body,
    color: 'white',
    fontWeight: '600',
  },
  summarySection: {
    alignItems: 'center',
  },
  summaryTitle: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.lg,
    fontWeight: '500',
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  timelineDay: {
    alignItems: 'center',
  },
  timelineBlob: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  summaryText: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
});