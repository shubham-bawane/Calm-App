# 🌸 Calm Awareness Web App

A private-first, mindful web application built with pure HTML, CSS, and JavaScript to improve mental well-being without addictive mechanics.

![Calm Awareness](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Privacy](https://img.shields.io/badge/privacy-100%25%20local-brightgreen.svg)

---

## ✨ Features

### 🏠 Home Screen
- Beautiful animated gradient background
- Pulsing "Breathe" button for easy access
- Quick navigation to Habit Tracker and Journal
- Settings icon for customization

### 🌬️ Breathe Screen
- **Guided Breathing Ritual**: 3 cycles of structured breathing
  - **Inhale**: 4 seconds (circle expands)
  - **Hold**: 1 second (circle holds)
  - **Exhale**: 6 seconds (circle contracts)
- Live countdown timer showing seconds remaining
- Visual circle animations synchronized with breath phases
- Stop button for graceful exit
- Session completion summary

### ✅ Habit Tracker
Three daily habits with gamification:
- **🚶 5-Minute Walk** (10 growth points)
- **💧 Drink Water** (5 growth points)
- **🌬️ Deep Breathing** (15 growth points)

Features:
- Tap to complete habits
- Cumulative growth points system
- Visual feedback with green highlight
- Persistent progress via localStorage

### 📝 Journal
Five mood bubbles with beautiful gradients:
- **😊 Joyful** (yellow-orange gradient)
- **😌 Calm** (blue gradient)
- **😰 Anxious** (purple gradient)
- **😢 Sad** (grey-blue gradient)
- **🔥 Energetic** (red-orange gradient)

Features:
- Tap mood to select
- Optional text input for thoughts
- Recent entries timeline (last 10 entries)
- All data stored locally

### ⚙️ Settings
- **Sound Toggle**: Enable/disable sound effects
- **Daily Reminders**: Configure notifications (max 3/day)
- **Privacy Statement**: Clear commitment to local-only data
- **Breathing History**: View past breathing sessions with timestamps
- **Data Inspector**: Developer mode to view all stored data
- **Export Data**: Download all app data as JSON

### 📊 Session Summary
- Displays after completing breathing ritual
- Shows completion stats (cycles, duration)
- Animated sparkle emoji
- Smooth transition back to home

---

## 🔒 Privacy First

**100% Local. Zero Tracking. Complete Privacy.**

- ✅ All data stored in browser localStorage
- ✅ No external API calls
- ✅ No analytics or tracking
- ✅ No cookies
- ✅ No server communication
- ✅ Works completely offline

Your data never leaves your device. Ever.

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- localStorage support

### Installation

**Option 1: Direct Open**
1. Download all three files:
   - `index.html`
   - `styles.css`
   - `app.js`
2. Place them in the same folder
3. Double-click `index.html` to open in browser

**Option 2: Local Server (Recommended)**
```bash
# Navigate to your project folder
cd /path/to/calm-awareness

# Start a simple HTTP server
python3 -m http.server 8080

# Or using Node.js
npx serve -s . -l 8080
Then open: http://localhost:8080/index.html

📖 How to Use
Getting Started
Home Screen: Your calm entry point with gradient animation
Click "Breathe" to start a breathing session
Click "Habit Tracker" to manage daily habits
Click "Journal" to log your mood
Click ⚙️ (Settings) to customize
Breathing Ritual
Click "Breathe" on home screen
Get ready countdown: 3... 2... 1...
Follow the circle animation:
Circle expands → Breathe In (4s)
Circle holds → Hold (1s)
Circle contracts → Breathe Out (6s)
Complete 3 cycles automatically
View session summary
Click "Continue" to return home
Habit Tracking
Navigate to "Habit Tracker"
Tap any habit card to mark complete
Card turns green + growth points increase
Progress saves automatically
Reset daily for consistent practice
Journaling
Navigate to "Journal"
Tap a mood bubble (Joyful, Calm, Anxious, Sad, Energetic)
Optionally add text thoughts
Click "Save Entry"
View recent entries below
All entries saved locally with timestamps
Settings & Data
Navigate to Settings
Toggle sounds and notifications
View breathing history (last 10 sessions)
Click "Show Local Data" to inspect stored data
Click "Export All Data" to download JSON backup
🛠️ Technical Details
Technology Stack
HTML5: Semantic structure
CSS3: Animations, gradients, responsive design
Vanilla JavaScript: ES6+ features, no frameworks
localStorage: Client-side persistence
File Structure
calm-awareness/
├── index.html       # Main HTML structure
├── styles.css       # All styling and animations
├── app.js           # Application logic and state management
└── README.md        # This file
Browser Compatibility
Browser	Version	Support
Chrome	90+	✅ Full
Firefox	88+	✅ Full
Safari	14+	✅ Full
Edge	90+	✅ Full
Key Features
Single Page Application (SPA): Smooth transitions without page reloads
CSS Animations: Hardware-accelerated for smooth performance
LocalStorage API: Persistent data storage
Responsive Design: Works on desktop and mobile browsers
No Dependencies: Zero external libraries or frameworks
💾 Data Storage
All data is stored in browser localStorage under these keys:

Key	Description	Data Type
calmapp_habits	Habit completion status	Array of Objects
calmapp_growth	Total growth points	Integer
calmapp_journal	Journal entries	Array of Objects
calmapp_sessions	Breathing session history	Array of Objects
calmapp_settings	User preferences	Object
Data Structure Examples
Habit Data:

[
  {
    "id": 1,
    "title": "5-Minute Walk",
    "description": "Take a short walk outside",
    "icon": "🚶",
    "completed": true,
    "points": 10
  }
]
Journal Entry:

{
  "date": "2025-10-25T04:30:00.000Z",
  "mood": "joyful",
  "text": "Feeling great today!"
}
Breathing Session:

{
  "date": "2025-10-25T04:30:00.000Z",
  "cycles": 3,
  "duration": 33
}
🎨 Design Philosophy
Principles
Calm & Gentle: Soft gradients, smooth animations, ample whitespace
Non-Addictive: No streaks, no gamification pressure, no notifications spam
Privacy-First: Zero tracking, zero analytics, zero external requests
Accessible: Simple interface, clear navigation, semantic HTML
Minimal: No clutter, essential features only
Color Palette
Primary Gradient: Purple to Pink (#667eea → #764ba2 → #f093fb)
Text: White with opacity variations
Buttons: Semi-transparent white with blur
Accents: Soft gradients for mood bubbles
Animation Timing
Inhale: 4 seconds (ease-in-out)
Hold: 1 second (ease-in-out)
Exhale: 6 seconds (ease-in-out)
Gradient: 15 seconds loop
Transitions: 0.3-0.5 seconds
📱 Mobile Support
The app is fully responsive and works on mobile browsers:

Touch-friendly button sizes
Responsive layout adjustments
Mobile-optimized font sizes
Gesture support for navigation
Best viewed on:

Desktop: 1920x1080+
Tablet: 768x1024+
Mobile: 375x667+
🔧 Customization
Change Breathing Pattern
Edit in app.js:

// Inhale phase
setTimeout(() => {
    // Change 4000 to desired milliseconds
}, 4000);

// Hold phase
setTimeout(() => {
    // Change 1000 to desired milliseconds
}, 1000);

// Exhale phase
setTimeout(() => {
    // Change 6000 to desired milliseconds
}, 6000);
Add More Habits
Edit state.habits array in app.js:

habits: [
    { 
        id: 4, 
        title: 'Meditation', 
        description: '10 minutes of mindfulness', 
        icon: '🧘', 
        completed: false, 
        points: 20 
    }
]
Change Color Scheme
Edit gradient in styles.css:

.animated-gradient {
    background: linear-gradient(135deg, #your-colors-here);
}
🐛 Troubleshooting
App not loading?
Check if JavaScript is enabled
Ensure all three files are in the same directory
Clear browser cache and reload
Data not persisting?
Check if localStorage is enabled
Browser private/incognito mode may block localStorage
Check browser storage quota
Animations not smooth?
Update to latest browser version
Disable browser extensions that might interfere
Check hardware acceleration is enabled
Export not working?
Allow downloads in browser settings
Check pop-up blocker settings
Ensure sufficient disk space
🚀 Future Enhancements
Potential features for future versions:

 Additional breathing patterns (Box breathing, 4-7-8, etc.)
 Customizable habit list
 Weekly/monthly mood analytics
 Dark mode theme toggle
 Soundscapes during breathing (nature sounds, ambient)
 Import data from JSON backup
 Haptic feedback for mobile devices
 Progressive Web App (PWA) support
 Offline mode indicator
🤝 Contributing
This is a personal wellness tool. Feel free to:

Fork and customize for your needs
Report bugs or suggest features
Share with friends who might benefit
📜 License
MIT License

Copyright (c) 2025 Calm Awareness

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

📞 Support
For questions or issues:

Check the troubleshooting section above
Review browser console for error messages
Ensure all files are properly saved and in same directory
🙏 Acknowledgments
Built with mindfulness and care for mental well-being.

Remember: Take time to breathe. Be kind to yourself. Progress over perfection.

📊 Version History
v1.0.0 (2025-10-25)
Initial release
Home screen with animated gradient
Breathing ritual (3 cycles)
Habit tracker with 3 habits
Journal with 5 mood options
Settings with history and export
100% localStorage persistence
Full privacy implementation
Made with 💜 for calm and awareness
