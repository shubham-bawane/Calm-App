# Calm Awareness App - Configuration Guide

## 🎛️ Customizable Configuration

The app is built with configurable parameters that can be easily adjusted without code changes.

### Theme Configuration (`src/config/theme.js`)

#### Colors
```javascript
colors: {
  bg1: '#F5F7F8',        // Primary background
  bg2: '#EAF4F4',        // Secondary background
  accent: '#6AA6A4',     // Primary accent color
  accent2: '#A8C3B0',    // Secondary accent
  mutedText: '#4A5555',  // Text color
  softSand: '#F0EDE8',   // Soft background variant
  
  // Mood colors for journal
  calm: '#A7D3E6',
  neutral: '#CFCFD3',
  joyful: '#F2E8B8',
  tense: '#E6B2B2',
  sad: '#C7A1A1',
}
```

#### Breathing Cycle Configuration
```javascript
breathingConfig: {
  inhale: 4000,   // Inhale duration (ms)
  hold: 1000,     // Hold duration (ms)
  exhale: 6000,   // Exhale duration (ms)
  cycles: 3,      // Number of complete cycles
}
```

#### Animation Timings
```javascript
animations: {
  defaultTransition: { duration: 400 },
  ctaPulse: { duration: 3200 },
  plantGrowth: { duration: 700 },
  moodMorph: { duration: 900 },
}
```

### Mood Inference Configuration
```javascript
moodInferenceConfig: {
  weights: {
    tap_speed: { tense: 0.6, calm: -0.3 },
    hold_duration: { calm: 0.5, flat: 0.2 },
    swipe_jerk: { tense: 0.7 },
    stroke_complexity: { joyful: 0.5, flat: -0.2 },
    touch_area: { calm: 0.3, joyful: 0.4 },
  },
  confidence_threshold: 0.55,
}
```

## 🔧 Customization Options

### 1. Breathing Patterns
To change breathing patterns, modify `breathingConfig` in `src/config/theme.js`:

**4-7-8 Breathing:**
```javascript
breathingConfig: {
  inhale: 4000,
  hold: 7000,
  exhale: 8000,
  cycles: 4,
}
```

**Box Breathing:**
```javascript
breathingConfig: {
  inhale: 4000,
  hold: 4000,
  exhale: 4000,
  cycles: 4,
}
```

### 2. Color Themes
Create new color themes by modifying the `colors` object:

**Ocean Theme:**
```javascript
colors: {
  bg1: '#E8F4F8',
  bg2: '#D1E7DD',
  accent: '#4A90A4',
  // ... other colors
}
```

**Forest Theme:**
```javascript
colors: {
  bg1: '#F0F4E8',
  bg2: '#E8F0E8',
  accent: '#5C8A3A',
  // ... other colors
}
```

### 3. Notification Settings
Default notification times can be changed in `src/utils/notifications.js`:

```javascript
// Current times: 9 AM, 2 PM, 8 PM
// To change to 8 AM, 1 PM, 7 PM:
const reminderTimes = [
  { hour: 8, minute: 0 },   // Morning
  { hour: 13, minute: 0 },  // Afternoon  
  { hour: 19, minute: 0 },  // Evening
];
```

### 4. Habit Customization
Modify habits in `src/screens/HabitScreen.js`:

```javascript
const HABITS = [
  {
    id: 'custom1',
    icon: 'heart-outline',
    title: 'Three grateful thoughts',
    description: 'Think of three things you appreciate',
  },
  // Add more habits...
];
```

### 5. Mood Inference Tuning
Adjust mood inference sensitivity by modifying weights in the config:

```javascript
// More sensitive to tense patterns
weights: {
  tap_speed: { tense: 0.8, calm: -0.4 },
  // ... other weights
}

// Higher confidence threshold for more accurate results
confidence_threshold: 0.65,
```

## 📱 Platform-Specific Configurations

### Android (`app.json`)
```json
{
  "android": {
    "permissions": [
      "android.permission.VIBRATE",
      "android.permission.RECORD_AUDIO"
    ],
    "adaptiveIcon": {
      "backgroundColor": "#F5F7F8"
    }
  }
}
```

### iOS (`app.json`)
```json
{
  "ios": {
    "infoPlist": {
      "UIBackgroundModes": ["audio"]
    }
  }
}
```

## 🎨 Assets Customization

### Lottie Animations
Replace placeholder Lottie components in `src/components/LottieView.js` with actual Lottie files:

1. Add `.json` Lottie files to `src/assets/lottie/`
2. Import and use them:

```javascript
import LottieView from 'lottie-react-native';

<LottieView
  source={require('../assets/lottie/breathing-circle.json')}
  autoPlay
  loop
  style={{ width: 200, height: 200 }}
/>
```

### Sound Files
Add sound files to `src/assets/sounds/` and update `src/utils/soundManager.js`:

```javascript
// Load custom sounds
await soundManager.loadSound('chime', require('../assets/sounds/chime.mp3'));
await soundManager.loadSound('ocean', require('../assets/sounds/ocean.mp3'));
```

## 🔒 Privacy Configuration

### Local Storage Only (Default)
Data is stored locally using AsyncStorage. No network requests are made.

### Optional Cloud Sync
To enable cloud sync, integrate with your preferred backend:

1. Update `useAppStore.js` to include sync methods
2. Modify settings to enable/disable sync
3. Ensure user consent before syncing

## 🧪 Testing Configuration

### Development Mode
Set debug flags in the theme config:

```javascript
debug: {
  showAnimationBounds: false,
  logTouchEvents: false,
  skipCalibration: false,
}
```

### Production Mode
Ensure all debug flags are disabled and analytics are configured according to privacy requirements.