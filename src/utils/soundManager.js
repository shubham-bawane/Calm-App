import { Audio } from 'expo-av';
import { hapticsManager } from './hapticsManager';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });

      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  async loadSound(key, source) {
    try {
      if (this.sounds[key]) {
        await this.sounds[key].unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(source);
      this.sounds[key] = sound;
      return sound;
    } catch (error) {
      console.warn(`Failed to load sound ${key}:`, error);
      return null;
    }
  }

  async playSound(key, options = {}) {
    try {
      await this.initialize();
      
      if (!this.sounds[key]) {
        console.warn(`Sound ${key} not loaded`);
        return;
      }

      const { isLooping = false, volume = 1.0 } = options;
      
      await this.sounds[key].setVolumeAsync(volume);
      await this.sounds[key].setIsLoopingAsync(isLooping);
      await this.sounds[key].playAsync();
    } catch (error) {
      console.warn(`Failed to play sound ${key}:`, error);
    }
  }

  async stopSound(key) {
    try {
      if (this.sounds[key]) {
        await this.sounds[key].stopAsync();
      }
    } catch (error) {
      console.warn(`Failed to stop sound ${key}:`, error);
    }
  }

  async pauseSound(key) {
    try {
      if (this.sounds[key]) {
        await this.sounds[key].pauseAsync();
      }
    } catch (error) {
      console.warn(`Failed to pause sound ${key}:`, error);
    }
  }

  async stopAllSounds() {
    try {
      await Promise.all(
        Object.keys(this.sounds).map(key => this.stopSound(key))
      );
    } catch (error) {
      console.warn('Failed to stop all sounds:', error);
    }
  }

  async unloadAllSounds() {
    try {
      await Promise.all(
        Object.values(this.sounds).map(sound => sound.unloadAsync())
      );
      this.sounds = {};
    } catch (error) {
      console.warn('Failed to unload sounds:', error);
    }
  }

  // FIXED: Placeholder sounds using centralized haptics manager
  async playChime() {
    await hapticsManager.triggerSuccess();
  }

  async playBreathInhale() {
    await hapticsManager.triggerInhaleHaptic();
  }

  async playBreathExhale() {
    await hapticsManager.triggerExhaleHaptic();
  }

  async playAmbientOcean() {
    // Placeholder - would play ocean sounds
    console.log('Playing ambient ocean sounds...');
  }

  async playAmbientWind() {
    // Placeholder - would play wind sounds
    console.log('Playing ambient wind sounds...');
  }
}

export const soundManager = new SoundManager();