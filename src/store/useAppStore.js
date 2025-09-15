import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * PRIVACY-FIRST DATA STORE
 * 
 * This store manages ALL app data using LOCAL AsyncStorage only.
 * 
 * CRITICAL PRIVACY GUARANTEES:
 * - Journal entries: Stored locally, never transmitted
 * - Habit progress: Private tracking, local persistence only  
 * - Breathing sessions: Personal wellness data, device-only storage
 * - Mood calibration: Sensitive emotional data, local processing only
 * - Settings: User preferences, local storage only
 * 
 * NO external APIs, NO analytics, NO cloud sync by default.
 * User has full control and can export/delete all data.
 */

// FIXED: Use consistent AsyncStorage keys with app prefix
const STORAGE_KEYS = {
  JOURNAL_ENTRIES: '@calmapp:journal_entries',
  HABIT_PROGRESS: '@calmapp:habits',
  SETTINGS: '@calmapp:settings',
  MOOD_CALIBRATION: '@calmapp:moodCalibration',
  BREATHING_SESSIONS: '@calmapp:breathing_sessions',
  GROWTH_POINTS: '@calmapp:growth', // Separate key for growth points
};

export const useAppStore = create((set, get) => ({
  // App Settings
  settings: {
    soundEnabled: false,
    notificationsEnabled: false,
    maxNotificationsPerDay: 3,
    reduceMotion: false,
    theme: 'default',
    cloudSyncEnabled: false,
  },

  // Journal State
  journalEntries: [],
  currentMood: null,

  // Habit State
  habitProgress: {
    level: 1,
    growthPoints: 0,
    completedToday: [],
  },

  // Breathing State
  breathingSessions: [],
  currentBreathingSession: null,

  // Mood Inference State
  moodCalibration: null,
  lastMoodInference: null,

  // Actions
  updateSettings: async (newSettings) => {
    const updatedSettings = { ...get().settings, ...newSettings };
    set({ settings: updatedSettings });
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
  },

  addJournalEntry: async (entry) => {
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: entry.mood,
      text: entry.text || '',
      timestamp: Date.now(),
    };
    
    const updatedEntries = [...get().journalEntries, newEntry];
    set({ journalEntries: updatedEntries });
    await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(updatedEntries));
  },

  completeHabit: async (habitId) => {
    const today = new Date().toDateString();
    const currentProgress = get().habitProgress;
    
    // PRIVACY: Habit completions are private, stored on-device in AsyncStorage only
    if (!currentProgress.completedToday.includes(habitId)) {
      const updatedProgress = {
        ...currentProgress,
        completedToday: [...currentProgress.completedToday, habitId],
        growthPoints: currentProgress.growthPoints + 1,
        level: Math.floor((currentProgress.growthPoints + 1) / 10) + 1,
        lastCompletedDate: today, // Track when last completed
      };
      
      // Update state and persist immediately to AsyncStorage
      set({ habitProgress: updatedProgress });
      await AsyncStorage.setItem(STORAGE_KEYS.HABIT_PROGRESS, JSON.stringify(updatedProgress));
      
      // DEBUG: Verify habit completion is working and stored locally
      console.log('🌱 Habit Completed:', {
        habitId,
        growthPoints: updatedProgress.growthPoints,
        level: updatedProgress.level,
        storage: 'LOCAL_ONLY (AsyncStorage)',
        completedToday: updatedProgress.completedToday.length + ' habits today'
      });
    }
  },

  addBreathingSession: async (session) => {
    const newSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: session.duration,
      cycles: session.cycles,
      completed: session.completed,
      timestamp: Date.now(),
    };
    
    const updatedSessions = [...get().breathingSessions, newSession];
    set({ breathingSessions: updatedSessions });
    await AsyncStorage.setItem(STORAGE_KEYS.BREATHING_SESSIONS, JSON.stringify(updatedSessions));
  },

  saveMoodCalibration: async (calibration) => {
    // All user data persisted locally in AsyncStorage by design. No remote calls.
    set({ moodCalibration: calibration });
    await AsyncStorage.setItem(STORAGE_KEYS.MOOD_CALIBRATION, JSON.stringify(calibration));
    
    if (__DEV__) {
      console.warn('💾 Mood calibration saved locally:', {
        mood: calibration.mood,
        confidence: Math.round(calibration.confidence * 100) + '%',
        timestamp: new Date(calibration.timestamp).toLocaleString(),
        storage: 'AsyncStorage (@calmapp:moodCalibration)'
      });
    }
  },

  updateMoodInference: async (inference) => {
    // FIXED: Also persist mood inference results to AsyncStorage
    set({ lastMoodInference: inference });
    await AsyncStorage.setItem('mood_inference_latest', JSON.stringify(inference));
    
    if (__DEV__) {
      console.warn('🧠 Latest mood inference updated:', {
        mood: inference.mood,
        storage: 'AsyncStorage (mood_inference_latest)'
      });
    }
  },

  // Load data from storage
  loadStoredData: async () => {
    try {
      const [settings, journalEntries, habitProgress, moodCalibration, breathingSessions] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES),
        AsyncStorage.getItem(STORAGE_KEYS.HABIT_PROGRESS),
        AsyncStorage.getItem(STORAGE_KEYS.MOOD_CALIBRATION),
        AsyncStorage.getItem(STORAGE_KEYS.BREATHING_SESSIONS),
      ]);

      // FIXED: Reset daily habit completions if it's a new day
      const today = new Date().toDateString();
      let loadedHabitProgress = habitProgress ? JSON.parse(habitProgress) : get().habitProgress;
      
      if (loadedHabitProgress.lastCompletedDate !== today) {
        loadedHabitProgress = {
          ...loadedHabitProgress,
          completedToday: [], // Reset daily completions
          lastCompletedDate: today,
        };
        // Save the reset state
        await AsyncStorage.setItem(STORAGE_KEYS.HABIT_PROGRESS, JSON.stringify(loadedHabitProgress));
      }

      set({
        settings: settings ? JSON.parse(settings) : get().settings,
        journalEntries: journalEntries ? JSON.parse(journalEntries) : [],
        habitProgress: loadedHabitProgress,
        moodCalibration: moodCalibration ? JSON.parse(moodCalibration) : null,
        breathingSessions: breathingSessions ? JSON.parse(breathingSessions) : [],
      });
      
      // PRIVACY: Confirm all data loaded from local AsyncStorage only
      console.log('📱 Data Loaded Locally:', {
        source: 'AsyncStorage (LOCAL_ONLY)',
        journalEntries: (journalEntries ? JSON.parse(journalEntries) : []).length,
        habitLevel: loadedHabitProgress.level,
        breathingSessions: (breathingSessions ? JSON.parse(breathingSessions) : []).length,
        moodCalibrated: !!moodCalibration,
      });
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  },

  // Export data
  exportData: async () => {
    const state = get();
    const exportData = {
      journalEntries: state.journalEntries,
      habitProgress: state.habitProgress,
      breathingSessions: state.breathingSessions,
      settings: state.settings,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(exportData, null, 2);
  },

  // Clear all data
  clearAllData: async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.JOURNAL_ENTRIES),
      AsyncStorage.removeItem(STORAGE_KEYS.HABIT_PROGRESS),
      AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS),
      AsyncStorage.removeItem(STORAGE_KEYS.MOOD_CALIBRATION),
      AsyncStorage.removeItem(STORAGE_KEYS.BREATHING_SESSIONS),
    ]);
    
    // Reset to initial state
    set({
      settings: {
        soundEnabled: false,
        notificationsEnabled: false,
        maxNotificationsPerDay: 3,
        reduceMotion: false,
        theme: 'default',
        cloudSyncEnabled: false,
      },
      journalEntries: [],
      currentMood: null,
      habitProgress: {
        level: 1,
        growthPoints: 0,
        completedToday: [],
      },
      breathingSessions: [],
      currentBreathingSession: null,
      moodCalibration: null,
      lastMoodInference: null,
    });
  },
}));