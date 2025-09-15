import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // Calm notifications are silent by default
    shouldSetBadge: false,  // No red badges for calm app
  }),
});

class NotificationManager {
  constructor() {
    this.isInitialized = false;
    this.notificationIdentifiers = [];
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('calm-reminders', {
          name: 'Calm Reminders',
          importance: Notifications.AndroidImportance.LOW, // Gentle, non-intrusive
          vibrationPattern: [0, 250, 250, 250], // Subtle vibration
          lightColor: '#6AA6A4',
          sound: false, // Silent notifications
        });
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn('Failed to initialize notifications:', error);
      return false;
    }
  }

  async scheduleGentleReminders(maxPerDay = 3) {
    try {
      await this.initialize();
      
      // Cancel existing notifications
      await this.cancelAllNotifications();

      if (maxPerDay === 0) return;

      const now = new Date();
      const reminders = [];

      // Morning reminder (9 AM)
      if (maxPerDay >= 1) {
        const morningTime = new Date();
        morningTime.setHours(9, 0, 0, 0);
        if (morningTime <= now) {
          morningTime.setDate(morningTime.getDate() + 1);
        }

        reminders.push({
          content: {
            title: 'Gentle Moment',
            body: 'Would you like a 2-minute breathing break?',
            sound: false,
          },
          trigger: {
            hour: 9,
            minute: 0,
            repeats: true,
          },
        });
      }

      // Midday reminder (2 PM)
      if (maxPerDay >= 2) {
        reminders.push({
          content: {
            title: 'Tiny Pause',
            body: 'Tiny pause? 1 minute of awareness.',
            sound: false,
          },
          trigger: {
            hour: 14,
            minute: 0,
            repeats: true,
          },
        });
      }

      // Evening reminder (8 PM)
      if (maxPerDay >= 3) {
        reminders.push({
          content: {
            title: 'Evening Check-in',
            body: 'One calm check-in before bed?',
            sound: false,
          },
          trigger: {
            hour: 20,
            minute: 0,
            repeats: true,
          },
        });
      }

      // Schedule all reminders
      const scheduledIds = await Promise.all(
        reminders.map(reminder => 
          Notifications.scheduleNotificationAsync(reminder)
        )
      );

      this.notificationIdentifiers = scheduledIds;
      console.log(`Scheduled ${scheduledIds.length} gentle reminders`);
    } catch (error) {
      console.warn('Failed to schedule notifications:', error);
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.notificationIdentifiers = [];
    } catch (error) {
      console.warn('Failed to cancel notifications:', error);
    }
  }

  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.warn('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  // Test notification (for development)
  async sendTestNotification() {
    try {
      await this.initialize();
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Calm App Test',
          body: 'This is a test notification',
          sound: false,
        },
        trigger: { seconds: 2 },
      });
    } catch (error) {
      console.warn('Failed to send test notification:', error);
    }
  }
}

export const notificationManager = new NotificationManager();