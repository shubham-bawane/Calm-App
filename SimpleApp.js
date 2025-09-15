import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Simple version of the Calm Awareness App for mobile testing
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedMood, setSelectedMood] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [isBreathing, setIsBreathing] = useState(false);
  
  const breathScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Breathing animation
  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  // CTA pulse animation
  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1600 }),
        withTiming(1, { duration: 1600 })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const startBreathing = async () => {
    setIsBreathing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Inhale (4 seconds)
    breathScale.value = withTiming(1.18, { duration: 4000 });
    
    setTimeout(async () => {
      // Hold (1 second)
      setTimeout(async () => {
        // Exhale (6 seconds)
        breathScale.value = withTiming(0.92, { duration: 6000 });
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        setTimeout(() => {
          setIsBreathing(false);
          breathScale.value = withTiming(1, { duration: 1000 });
          Alert.alert('Well done', 'You did well. That\'s enough for now.');
        }, 6000);
      }, 1000);
    }, 4000);
  };

  const selectMood = async (mood) => {
    setSelectedMood(mood);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const saveMood = () => {
    Alert.alert('Saved', 'Your mood has been recorded locally.');
    setSelectedMood(null);
    setJournalText('');
    setCurrentScreen('home');
  };

  if (currentScreen === 'breathe') {
    return (
      <LinearGradient colors={['#F5F7F8', '#EAF4F4']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Text>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.breathingContainer}>
            <Animated.View style={[styles.breathingCircle, breathingStyle]}>
              <View style={styles.innerCircle} />
            </Animated.View>
          </View>
          
          <View style={styles.instructionContainer}>
            <Text style={styles.phaseText}>
              {isBreathing ? 'Follow the circle...' : 'Tap to begin breathing'}
            </Text>
            
            {!isBreathing && (
              <TouchableOpacity style={styles.startButton} onPress={startBreathing}>
                <Text style={styles.startText}>Begin</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (currentScreen === 'journal') {
    const moods = [
      { id: 'calm', label: 'Calm', color: '#A7D3E6', emoji: '🌊' },
      { id: 'joyful', label: 'Joyful', color: '#F2E8B8', emoji: '☀️' },
      { id: 'tense', label: 'Tense', color: '#E6B2B2', emoji: '⚡' },
      { id: 'neutral', label: 'Neutral', color: '#CFCFD3', emoji: '⚪' },
      { id: 'sad', label: 'Sad', color: '#C7A1A1', emoji: '🌧️' },
    ];

    return (
      <LinearGradient 
        colors={selectedMood ? [moods.find(m => m.id === selectedMood)?.color || '#F5F7F8', '#F5F7F8'] : ['#F5F7F8', '#EAF4F4']} 
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Text>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>How are you feeling?</Text>
          
          <View style={styles.moodBubbles}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodBubble,
                  { backgroundColor: mood.color },
                  selectedMood === mood.id && styles.selectedMood
                ]}
                onPress={() => selectMood(mood.id)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedMood && (
            <View style={styles.inputSection}>
              <TextInput
                style={styles.textInput}
                placeholder="One word or sentence — optional"
                value={journalText}
                onChangeText={setJournalText}
                multiline
              />
              <TouchableOpacity style={styles.saveButton} onPress={saveMood}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Home Screen
  return (
    <LinearGradient colors={['#F5F7F8', '#EAF4F4']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Take a moment</Text>
            <Text style={styles.welcomeSubtext}>
              Everything you need is already here
            </Text>
          </View>

          <Animated.View style={[styles.ctaSection, pulseStyle]}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => setCurrentScreen('breathe')}
            >
              <Text style={styles.ctaText}>Breathe</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.secondarySection}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => Alert.alert('Habit', 'Take two deep breaths right now.')}
            >
              <Text style={styles.secondaryText}>Habit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setCurrentScreen('journal')}
            >
              <Text style={styles.secondaryText}>Journal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  backButton: {
    margin: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  welcomeSection: {
    marginBottom: 80,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#4A5555',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4A5555',
    opacity: 0.7,
  },
  ctaSection: {
    marginBottom: 48,
  },
  ctaButton: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#6AA6A4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontSize: 28,
    color: 'white',
    fontWeight: '600',
  },
  secondarySection: {
    flexDirection: 'row',
    gap: 24,
  },
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryText: {
    fontSize: 16,
    color: '#4A5555',
    fontWeight: '500',
  },
  // Breathing styles
  breathingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#6AA6A4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  innerCircle: {
    width: '60%',
    height: '60%',
    borderRadius: width * 0.21,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  instructionContainer: {
    alignItems: 'center',
    paddingBottom: 96,
  },
  phaseText: {
    fontSize: 20,
    color: '#4A5555',
    marginBottom: 24,
    textAlign: 'center',
  },
  startButton: {
    paddingHorizontal: 64,
    paddingVertical: 24,
    backgroundColor: '#A8C3B0',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  startText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  // Journal styles
  headerTitle: {
    fontSize: 20,
    color: '#4A5555',
    textAlign: 'center',
    margin: 20,
  },
  moodBubbles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  moodBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedMood: {
    transform: [{ scale: 1.1 }],
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 14,
    color: '#4A5555',
    fontWeight: '500',
  },
  inputSection: {
    width: '100%',
    paddingHorizontal: 20,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 24,
    fontSize: 16,
    color: '#4A5555',
    minHeight: 100,
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#6AA6A4',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  saveText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});