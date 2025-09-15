import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from '../components/AnimatedButton';
import { theme } from '../config/theme';
import { useAppStore } from '../store/useAppStore';

export default function SettingsScreen({ navigation }) {
  const { 
    settings, 
    updateSettings, 
    exportData, 
    clearAllData, 
    moodCalibration,
    lastMoodInference,
    habitProgress,
    breathingSessions,
    saveMoodCalibration 
  } = useAppStore();
  
  const [isExporting, setIsExporting] = useState(false);
  const [showDevInspector, setShowDevInspector] = useState(false);

  const handleNotificationToggle = (value) => {
    updateSettings({ notificationsEnabled: value });
  };

  const handleSoundToggle = (value) => {
    updateSettings({ soundEnabled: value });
  };

  const handleReduceMotionToggle = (value) => {
    updateSettings({ reduceMotion: value });
  };

  const handleCloudSyncToggle = (value) => {
    updateSettings({ cloudSyncEnabled: value });
    if (value) {
      Alert.alert(
        'Cloud Sync',
        'Cloud sync is not yet implemented. Your data remains local for now.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await exportData();
      
      await Share.share({
        message: data,
        title: 'Calm App Data Export',
      });
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your journal entries, habit progress, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Data Cleared', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleRecalibrateMood = () => {
    navigation.navigate('MoodCalibration');
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
          
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <SettingRow
              title="Enable notifications"
              subtitle="Gentle reminders, max 3 per day"
              value={settings.notificationsEnabled}
              onValueChange={handleNotificationToggle}
              type="switch"
            />
            
            <View style={styles.notificationExamples}>
              <Text style={styles.exampleTitle}>Example messages:</Text>
              <Text style={styles.exampleText}>
                • "Would you like a 2-minute breathing break?"
              </Text>
              <Text style={styles.exampleText}>
                • "Tiny pause? 1 minute of awareness."
              </Text>
              <Text style={styles.exampleText}>
                • "One calm check-in before bed?"
              </Text>
            </View>
          </View>

          {/* Audio Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audio</Text>
            
            <SettingRow
              title="Sound effects"
              subtitle="Gentle chimes and ambient sounds"
              value={settings.soundEnabled}
              onValueChange={handleSoundToggle}
              type="switch"
            />
          </View>

          {/* Accessibility Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accessibility</Text>
            
            <SettingRow
              title="Reduce motion"
              subtitle="Replace animations with simple fades"
              value={settings.reduceMotion}
              onValueChange={handleReduceMotionToggle}
              type="switch"
            />
          </View>

          {/* FIXED: Breathing History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Breathing History</Text>
            
            {breathingSessions && breathingSessions.length > 0 ? (
              <View style={styles.historyContainer}>
                {breathingSessions.slice(-5).reverse().map((session, index) => (
                  <View key={index} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyDate}>
                        {new Date(session.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </Text>
                      {session.completed && (
                        <Text style={styles.completedBadge}>✓</Text>
                      )}
                    </View>
                    <View style={styles.historyDetails}>
                      <Text style={styles.historycycles}>
                        {session.cycles} cycles
                      </Text>
                      <Text style={styles.historyDuration}>
                        {Math.round(session.duration / 1000 / 60)}m {Math.round((session.duration / 1000) % 60)}s
                      </Text>
                    </View>
                  </View>
                ))}
                {breathingSessions.length > 5 && (
                  <Text style={styles.historyMore}>
                    + {breathingSessions.length - 5} more sessions
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryText}>
                  🌊 No breathing sessions yet
                </Text>
                <Text style={styles.emptyHistorySubtext}>
                  Complete your first breathing exercise to see your history
                </Text>
              </View>
            )}
          </View>

          {/* Mood Inference Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mood Awareness</Text>
            
            <SettingRow
              title="Recalibrate touch inference"
              subtitle={moodCalibration ? "Personalize your touch patterns" : "Not yet calibrated"}
              onPress={handleRecalibrateMood}
              type="button"
              icon="refresh-outline"
            />
          </View>

          {/* Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Data</Text>
            
            <View style={styles.privacyNote}>
              <Text style={styles.privacyText}>
                All data stays on this device unless you enable cloud sync.
              </Text>
            </View>
            
            <SettingRow
              title="Cloud sync"
              subtitle="Backup data to secure cloud storage"
              value={settings.cloudSyncEnabled}
              onValueChange={handleCloudSyncToggle}
              type="switch"
            />
            
            <SettingRow
              title="Export data"
              subtitle="Save your data as JSON file"
              onPress={handleExportData}
              type="button"
              icon="download-outline"
              loading={isExporting}
            />
            
            <SettingRow
              title="Clear all data"
              subtitle="Permanently delete all stored information"
              onPress={handleClearData}
              type="button"
              icon="trash-outline"
              destructive
            />
          </View>

          {/* FIXED: Dev Data Inspector (dev only) */}
          {__DEV__ && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Development Tools</Text>
              
              <SettingRow
                title="Data Inspector"
                subtitle="View locally stored data (dev mode only)"
                value={showDevInspector}
                onValueChange={setShowDevInspector}
                type="switch"
              />
              
              {showDevInspector && (
                <View style={styles.devInspector}>
                  <Text style={styles.devInspectorTitle}>📊 Local Data Status</Text>
                  
                  {/* Mood Calibration Status */}
                  <View style={styles.devInspectorSection}>
                    <Text style={styles.devInspectorLabel}>🧠 Mood Calibration:</Text>
                    {moodCalibration ? (
                      <View>
                        <Text style={styles.devInspectorValue}>
                          Mood: {moodCalibration.mood} ({Math.round(moodCalibration.confidence * 100)}% confidence)
                        </Text>
                        <Text style={styles.devInspectorValue}>
                          Timestamp: {new Date(moodCalibration.timestamp).toLocaleString()}
                        </Text>
                        <Text style={styles.devInspectorValue}>
                          Vector: {JSON.stringify(moodCalibration.vector || moodCalibration.scores)}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.devInspectorValue}>Not calibrated</Text>
                    )}
                  </View>
                  
                  {/* Habit Progress Status */}
                  <View style={styles.devInspectorSection}>
                    <Text style={styles.devInspectorLabel}>🌱 Habit Progress:</Text>
                    <Text style={styles.devInspectorValue}>
                      Level: {habitProgress.level} | Growth Points: {habitProgress.growthPoints}
                    </Text>
                    <Text style={styles.devInspectorValue}>
                      Completed Today: {habitProgress.completedToday.length}
                    </Text>
                  </View>
                  
                  {/* Latest Mood Inference */}
                  <View style={styles.devInspectorSection}>
                    <Text style={styles.devInspectorLabel}>🎯 Latest Mood Inference:</Text>
                    {lastMoodInference ? (
                      <Text style={styles.devInspectorValue}>
                        {lastMoodInference.mood} ({Math.round(lastMoodInference.confidence * 100)}%)
                      </Text>
                    ) : (
                      <Text style={styles.devInspectorValue}>No recent inference</Text>
                    )}
                  </View>
                  
                  <Text style={styles.devInspectorFooter}>
                    ℹ️ All data stored in AsyncStorage locally
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.appInfo}>
              <Text style={styles.appInfoText}>
                Calm Awareness App v1.0.0
              </Text>
              <Text style={styles.appInfoText}>
                Built with intention for your well-being
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SettingRow({ 
  title, 
  subtitle, 
  value, 
  onValueChange, 
  onPress, 
  type, 
  icon, 
  destructive,
  loading 
}) {
  const handlePress = () => {
    if (type === 'switch') {
      onValueChange?.(!value);
    } else {
      onPress?.();
    }
  };

  return (
    <AnimatedButton
      onPress={handlePress}
      style={[styles.settingRow, destructive && styles.destructiveRow]}
      disabled={loading}
    >
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>
      
      <View style={styles.settingAction}>
        {type === 'switch' && (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#E5E5E5', true: theme.colors.accent }}
            thumbColor={value ? 'white' : '#f4f3f4'}
          />
        )}
        
        {type === 'button' && icon && (
          <Ionicons
            name={icon}
            size={20}
            color={destructive ? theme.colors.tense : theme.colors.mutedText}
          />
        )}
      </View>
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
    width: 56,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  destructiveRow: {
    backgroundColor: 'rgba(230, 178, 178, 0.2)',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    fontWeight: '500',
  },
  destructiveText: {
    color: theme.colors.tense,
  },
  settingSubtitle: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    opacity: 0.7,
    marginTop: theme.spacing.xs,
  },
  settingAction: {
    marginLeft: theme.spacing.md,
  },
  notificationExamples: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  exampleTitle: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  exampleText: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    opacity: 0.7,
    marginBottom: theme.spacing.xs,
  },
  privacyNote: {
    backgroundColor: 'rgba(167, 211, 230, 0.2)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  privacyText: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    fontWeight: '500',
    textAlign: 'center',
  },
  appInfo: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: theme.borderRadius.lg,
  },
  appInfoText: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  // FIXED: Dev inspector styles
  devInspector: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  devInspectorTitle: {
    ...theme.typography.body,
    color: theme.colors.mutedText,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  devInspectorSection: {
    marginBottom: theme.spacing.md,
  },
  devInspectorLabel: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  devInspectorValue: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    opacity: 0.8,
    fontFamily: 'monospace',
    marginBottom: theme.spacing.xs,
  },
  devInspectorFooter: {
    ...theme.typography.small,
    color: theme.colors.accent,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});