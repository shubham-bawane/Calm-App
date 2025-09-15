# 🌸 Calm Awareness App

A **cross-platform mobile app** (iOS + Android) built with **React Native + Expo** designed to improve mental awareness and well-being through gentle, non-addictive practices.

## ✨ Key Features

### 🏠 **Home Screen**
- Calm entry point with animated gradient background
- Large pulsing "Breathe" CTA button (pulses every 3.2 seconds)
- Secondary "Habit" and "Journal" buttons
- Anti-addiction design: no feeds, no streaks, no red badges

### 🌊 **Breathe Screen** 
- Full-screen breathing animation with precise timing
- Default cycle: Inhale 4s → Hold 1s → Exhale 6s (3 cycles)
- Haptic feedback for inhale/exhale phases
- Optional ambient soundscapes
- Accessibility: reduced motion support

### 🌱 **Habit Screen**
- 3 gentle habit cards: "Two deep breaths", "Look out window 30s", "Write one word"
- Plant growth metaphor that grows slowly over weeks
- Completion animations with haptic feedback
- No streaks or pressure - growth never resets

### 💙 **Journal Screen**
- 5 watercolor mood bubbles (Calm, Neutral, Joyful, Tense, Sad)
- Background morphs to mood color with smooth transitions
- Optional text input: "One word or one sentence — optional"
- Weekly watercolor timeline view
- Auto-generated gentle summaries

### ✨ **Session Summary**
- Calm completion screen after each activity
- Gentle message: "You did well. That's enough for now."
- Auto-return to home with soft fade transition

### ⚙️ **Settings**
- Privacy-first: "All data stays on this device"
- Gentle notification controls (max 3/day, silent by default)
- Sound toggle, reduce motion accessibility
- Data export and clear options

### 🧠 **Touchscreen Mood Inference**
- Advanced touch pattern analysis for mood detection
- Calibration flow: tap test, hold test, swipe test, free doodle
- Heuristic analysis of touch speed, pressure, rhythm, complexity
- Confidence scoring with gentle suggestions
- 100% local processing, no data collection

## 🎨 Design Principles

### **Anti-Addiction by Design**
- ❌ No infinite feeds or endless scrolling
- ❌ No random rewards or variable reinforcement
- ❌ No streaks, leaderboards, or social features
- ❌ No red badges or urgent notifications
- ❌ No analytics or user tracking
- ✅ Predictable comfort and gentle closure
- ✅ Every flow ends with "That's enough"

### **Calm-First UI**
- Slow animated gradients (`#F5F7F8 → #EAF4F4`)
- Watercolor mood colors with soft transitions
- Large whitespace, rounded corners, soft shadows
- Gentle micro-interactions with spring animations
- Motion respects accessibility preferences

## 🛠️ Tech Stack

- **Framework**: React Native + Expo managed workflow
- **Navigation**: @react-navigation/native with custom transitions
- **Animations**: react-native-reanimated v3 + gesture-handler
- **State**: Zustand with AsyncStorage persistence
- **Audio**: expo-av with optional ambient sounds
- **Haptics**: expo-haptics for gentle feedback
- **Storage**: Local-first with @react-native-async-storage
- **Assets**: Lottie animations for breathing, plant growth, watercolor effects

## 📱 Installation & Setup

```bash
# Clone the repository
git clone [your-repo-url]
cd calm-awareness-app

# Install dependencies
npm install

# Start development server
npm run android  # Android
npm run ios      # iOS (macOS required)
npm run web      # Web preview
```

### **Prerequisites**
- Node.js 18+
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## 🚀 Running the App

### **Development**
```bash
# Start Expo development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

### **Testing on Device**
1. Install Expo Go app on your phone
2. Scan the QR code from the development server
3. App will load directly on your device

### **Production Build**
```bash
# Build for Android
expo build:android

# Build for iOS  
expo build:ios
```

## 📂 Project Structure

```
calm-awareness-app/
├── App.js                     # Main app entry point
├── src/
│   ├── screens/              # All screen components
│   │   ├── HomeScreen.js
│   │   ├── BreatheScreen.js
│   │   ├── HabitScreen.js
│   │   ├── JournalScreen.js
│   │   ├── SessionSummaryScreen.js
│   │   ├── SettingsScreen.js
│   │   └── MoodCalibrationScreen.js
│   ├── components/           # Reusable components
│   │   ├── AnimatedButton.js
│   │   ├── AnimatedGradient.js
│   │   └── LottieView.js
│   ├── config/
│   │   └── theme.js          # Design tokens, colors, animations
│   ├── store/
│   │   └── useAppStore.js    # Zustand state management
│   ├── services/
│   │   └── moodInference.js  # Mood detection system
│   ├── utils/
│   │   ├── soundManager.js   # Audio management
│   │   └── notifications.js  # Gentle notifications
│   └── assets/               # Lottie files, sounds, images
├── app.json                  # Expo configuration
└── CONFIG.md                 # Customization guide
```

## 🎛️ Customization

The app is highly configurable. See [CONFIG.md](CONFIG.md) for detailed customization options:

- **Breathing patterns**: Change timing, cycles, animations
- **Color themes**: Ocean, forest, or custom palettes  
- **Habit definitions**: Add custom gentle practices
- **Mood inference**: Adjust sensitivity and weights
- **Notifications**: Modify timing and frequency

## 🔒 Privacy & Data

### **Local-First Approach**
- All data stored locally using AsyncStorage
- No network requests or data collection
- No analytics, tracking, or telemetry
- Optional cloud sync (disabled by default)

### **Data Types Stored**
- Journal entries (mood + optional text)
- Habit completion progress
- Breathing session history
- Mood calibration data
- User preferences

### **Data Export**
Users can export all their data as JSON:
```javascript
// Available in Settings
const exportedData = {
  journalEntries: [...],
  habitProgress: {...},
  breathingSessions: [...],
  settings: {...},
  exportDate: "2025-01-XX"
}
```

## 🌟 Core Philosophy

**"Make the user feel calmer after using it than before."**

This app is designed as the **opposite of Instagram** - instead of endless engagement, it provides:
- Gentle completion and natural stopping points
- Predictable, comforting interactions
- Local data ownership and privacy
- No social comparison or external validation
- Focus on internal awareness and well-being

## 🧪 Testing & Validation

Run the validation script to check all components:

```bash
node test_app.js
```

This validates:
- ✅ All 16+ source files present
- ✅ All dependencies installed
- ✅ Theme and config structure
- ✅ Screen implementations
- ✅ Mood inference system
- ✅ Audio and haptic support

## 🤝 Contributing

This is a personal wellness app designed for individual use. If you'd like to contribute:

1. Maintain the anti-addiction design principles
2. Prioritize user privacy and local data storage
3. Keep interactions gentle and non-urgent
4. Test thoroughly on both iOS and Android
5. Ensure accessibility compliance

## 📄 License

This project is designed for personal use and well-being. Please respect the calm, non-commercial nature of the app.

---

*Built with intention for mental well-being and digital mindfulness.*