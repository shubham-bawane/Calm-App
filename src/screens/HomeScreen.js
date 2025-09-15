import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedGradient from '../components/AnimatedGradient';
import { theme } from '../config/theme';
import { useAppStore } from '../store/useAppStore';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { loadStoredData } = useAppStore();

  React.useEffect(() => {
    loadStoredData();
  }, []);

  const handleBreathePress = () => {
    navigation.navigate('Breathe');
  };

  const handleHabitPress = () => {
    navigation.navigate('Habit');
  };

  const handleJournalPress = () => {
    navigation.navigate('Journal');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <AnimatedGradient
      colors={[theme.colors.bg1, theme.colors.bg2]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Settings Icon */}
        <View style={styles.header}>
          <AnimatedButton
            onPress={handleSettingsPress}
            style={styles.settingsButton}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={theme.colors.mutedText}
            />
          </AnimatedButton>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Welcome Text */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Take a moment</Text>
            <Text style={styles.welcomeSubtext}>
              Everything you need is already here
            </Text>
          </View>

          {/* Main CTA Button */}
          <View style={styles.ctaSection}>
            <AnimatedButton
              onPress={handleBreathePress}
              style={styles.ctaButton}
              pulseAnimation={true}
            >
              <Text style={styles.ctaText}>Breathe</Text>
            </AnimatedButton>
          </View>

          {/* Secondary Buttons */}
          <View style={styles.secondarySection}>
            <AnimatedButton
              onPress={handleHabitPress}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>Habit</Text>
            </AnimatedButton>

            <AnimatedButton
              onPress={handleJournalPress}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>Journal</Text>
            </AnimatedButton>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </SafeAreaView>
    </AnimatedGradient>
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
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  settingsButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  welcomeSection: {
    marginBottom: theme.spacing.xxl * 2,
    alignItems: 'center',
  },
  welcomeText: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    color: theme.colors.mutedText,
  },
  welcomeSubtext: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.mutedText,
    opacity: 0.7,
  },
  ctaSection: {
    marginBottom: theme.spacing.xxl,
  },
  ctaButton: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  ctaText: {
    ...theme.typography.h1,
    color: 'white',
    fontWeight: '600',
  },
  secondarySection: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  secondaryButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.soft,
  },
  secondaryText: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});