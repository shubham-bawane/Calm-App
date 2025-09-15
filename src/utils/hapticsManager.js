/**
 * HAPTICS MANAGER - LOCAL HAPTIC FEEDBACK SYSTEM
 * 
 * Provides consistent haptic feedback across the app with proper error handling.
 * All user data persisted locally in AsyncStorage by design. No remote calls.
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

class HapticsManager {
  constructor() {
    this.isSupported = Platform.OS !== 'web';
  }

  async triggerLight(enabledSetting = true) {
    if (!this.isSupported || !enabledSetting) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      if (__DEV__) console.warn('Light haptic failed:', error);
    }
  }

  async triggerMedium(enabledSetting = true) {
    if (!this.isSupported || !enabledSetting) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      if (__DEV__) console.warn('Medium haptic failed:', error);
    }
  }

  async triggerHeavy(enabledSetting = true) {
    if (!this.isSupported || !enabledSetting) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      if (__DEV__) console.warn('Heavy haptic failed:', error);
    }
  }

  async triggerSelection(enabledSetting = true) {
    if (!this.isSupported || !enabledSetting) return;
    
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      if (__DEV__) console.warn('Selection haptic failed:', error);
    }
  }

  async triggerSuccess(enabledSetting = true) {
    if (!this.isSupported || !enabledSetting) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      if (__DEV__) console.warn('Success haptic failed:', error);
    }
  }

  async triggerWarning(enabledSetting = true) {
    if (!this.isSupported || !enabledSetting) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      if (__DEV__) console.warn('Warning haptic failed:', error);
    }
  }

  async triggerError(enabledSetting = true) {
    if (!this.isSupported || !enabledSetting) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      if (__DEV__) console.warn('Error haptic failed:', error);
    }
  }

  // Breathing-specific haptics
  async triggerInhaleHaptic(enabledSetting = true) {
    await this.triggerLight(enabledSetting);
  }

  async triggerExhaleHaptic(enabledSetting = true) {
    await this.triggerLight(enabledSetting);
  }
}

export const hapticsManager = new HapticsManager();