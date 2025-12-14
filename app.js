// State Management
const state = {
    currentScreen: 'home',
    habits: [
        { id: 1, title: '5-Minute Walk', description: 'Take a short walk outside', icon: '🚶', completed: false, points: 10 },
        { id: 2, title: 'Drink Water', description: 'Hydrate with a glass of water', icon: '💧', completed: false, points: 5 },
        { id: 3, title: 'Deep Breathing', description: 'Practice mindful breathing', icon: '🌬️', completed: false, points: 15 }
    ],
    growthPoints: 0,
    journalEntries: [],
    breathingSessions: [],
    settings: {
        soundEnabled: true,
        notificationsEnabled: true
    },
    breathing: {
        isActive: false,
        currentCycle: 0,
        totalCycles: 3,
        phase: 'ready',
        timer: null
    }
};

// LocalStorage Management
const STORAGE_KEYS = {
    HABITS: 'calmapp_habits',
    GROWTH: 'calmapp_growth',
    JOURNAL: 'calmapp_journal',
    SESSIONS: 'calmapp_sessions',
    SETTINGS: 'calmapp_settings'
};

function loadData() {
    const savedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (savedHabits) {
        state.habits = JSON.parse(savedHabits);
    }
    
    const savedGrowth = localStorage.getItem(STORAGE_KEYS.GROWTH);
    if (savedGrowth) {
        state.growthPoints = parseInt(savedGrowth);
    }
    
    const savedJournal = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    if (savedJournal) {
        state.journalEntries = JSON.parse(savedJournal);
    }
    
    const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (savedSessions) {
        state.breathingSessions = JSON.parse(savedSessions);
    }
    
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
        state.settings = JSON.parse(savedSettings);
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Navigation
function navigateTo(screenId) {
    const currentScreen = document.querySelector('.screen.active');
    const newScreen = document.getElementById(`${screenId}-screen`);
    
    if (currentScreen) {
        currentScreen.classList.remove('active');
    }
    
    if (newScreen) {
        newScreen.classList.add('active');
        state.currentScreen = screenId;
        
        // Update screen content when navigating
        if (screenId === 'habit') {
            renderHabits();
        } else if (screenId === 'journal') {
            renderJournalEntries();
        } else if (screenId === 'settings') {
            renderSettings();
        }
    }
}

// Breathing Logic
let breathingInterval;
let countdownInterval;

function startBreathing() {
    state.breathing.isActive = true;
    state.breathing.currentCycle = 0;
    state.breathing.phase = 'ready';
    
    const circle = document.getElementById('breathe-circle');
    const instruction = document.getElementById('breathe-instruction');
    const countdown = document.getElementById('countdown-timer');
    
    // Get ready phase
    instruction.textContent = 'Get Ready';
    countdown.textContent = '3';
    
    let readyCount = 3;
    const readyInterval = setInterval(() => {
        readyCount--;
        countdown.textContent = readyCount;
        if (readyCount === 0) {
            clearInterval(readyInterval);
            runBreathingCycle();
        }
    }, 1000);
}

function runBreathingCycle() {
    if (state.breathing.currentCycle >= state.breathing.totalCycles) {
        completeBreathing();
        return;
    }
    
    state.breathing.currentCycle++;
    const circle = document.getElementById('breathe-circle');
    const instruction = document.getElementById('breathe-instruction');
    const countdown = document.getElementById('countdown-timer');
    
    // Inhale phase (4s)
    state.breathing.phase = 'inhale';
    instruction.textContent = 'Breathe In';
    circle.className = 'breathe-circle inhale';
    startCountdown(4, countdown);
    
    setTimeout(() => {
        // Hold phase (1s)
        state.breathing.phase = 'hold';
        instruction.textContent = 'Hold';
        circle.className = 'breathe-circle hold';
        startCountdown(1, countdown);
        
        setTimeout(() => {
            // Exhale phase (6s)
            state.breathing.phase = 'exhale';
            instruction.textContent = 'Breathe Out';
            circle.className = 'breathe-circle exhale';
            startCountdown(6, countdown);
            
            setTimeout(() => {
                // Next cycle or complete
                runBreathingCycle();
            }, 6000);
        }, 1000);
    }, 4000);
}

function startCountdown(seconds, element) {
    let count = seconds;
    element.textContent = count;
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            element.textContent = count;
        } else {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

function stopBreathing() {
    state.breathing.isActive = false;
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    const circle = document.getElementById('breathe-circle');
    circle.className = 'breathe-circle';
    
    navigateTo('home');
}

function completeBreathing() {
    state.breathing.isActive = false;
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Save session
    const session = {
        date: new Date().toISOString(),
        cycles: state.breathing.totalCycles,
        duration: (4 + 1 + 6) * state.breathing.totalCycles
    };
    state.breathingSessions.push(session);
    saveData(STORAGE_KEYS.SESSIONS, state.breathingSessions);
    
    // Show summary
    const summaryMessage = document.getElementById('summary-message');
    const summaryStats = document.getElementById('summary-stats');
    summaryMessage.textContent = 'Well done! You completed your breathing session.';
    summaryStats.textContent = `${state.breathing.totalCycles} cycles completed • ${session.duration} seconds`;
    
    navigateTo('summary');
}

// Habit Functions
function renderHabits() {
    const container = document.getElementById('habits-container');
    const growthDisplay = document.getElementById('growth-points');
    
    growthDisplay.textContent = state.growthPoints;
    
    container.innerHTML = '';
    state.habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = `habit-card ${habit.completed ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="habit-icon">${habit.icon}</div>
            <div class="habit-content">
                <div class="habit-title">${habit.title}</div>
                <div class="habit-description">${habit.description}</div>
            </div>
        `;
        
        card.addEventListener('click', () => completeHabit(habit.id));
        container.appendChild(card);
    });
}

function completeHabit(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (habit && !habit.completed) {
        habit.completed = true;
        state.growthPoints += habit.points;
        
        saveData(STORAGE_KEYS.HABITS, state.habits);
        saveData(STORAGE_KEYS.GROWTH, state.growthPoints);
        
        renderHabits();
    }
}

// Journal Functions
let selectedMood = null;

function setupJournalMoodBubbles() {
    const bubbles = document.querySelectorAll('.mood-bubble');
    const inputContainer = document.getElementById('journal-input-container');
    
    bubbles.forEach(bubble => {
        bubble.addEventListener('click', () => {
            bubbles.forEach(b => b.classList.remove('selected'));
            bubble.classList.add('selected');
            selectedMood = bubble.dataset.mood;
            inputContainer.classList.remove('hidden');
        });
    });
}

function saveJournalEntry() {
    if (!selectedMood) return;
    
    const text = document.getElementById('journal-text').value;
    const entry = {
        date: new Date().toISOString(),
        mood: selectedMood,
        text: text
    };
    
    state.journalEntries.unshift(entry);
    saveData(STORAGE_KEYS.JOURNAL, state.journalEntries);
    
    // Reset
    document.getElementById('journal-text').value = '';
    document.querySelectorAll('.mood-bubble').forEach(b => b.classList.remove('selected'));
    document.getElementById('journal-input-container').classList.add('hidden');
    selectedMood = null;
    
    renderJournalEntries();
}

function renderJournalEntries() {
    const container = document.getElementById('journal-entries');
    container.innerHTML = '';
    
    const recentEntries = state.journalEntries.slice(0, 10);
    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'journal-entry';
        
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        entryDiv.innerHTML = `
            <div class="entry-date">${dateStr}</div>
            <div class="entry-mood">Mood: ${entry.mood}</div>
            ${entry.text ? `<div class="entry-text">${entry.text}</div>` : ''}
        `;
        container.appendChild(entryDiv);
    });
}

// Settings Functions
function renderSettings() {
    document.getElementById('sound-toggle').checked = state.settings.soundEnabled;
    document.getElementById('notification-toggle').checked = state.settings.notificationsEnabled;
    
    renderBreathingSessions();
}

function renderBreathingSessions() {
    const container = document.getElementById('breathing-sessions');
    container.innerHTML = '';
    
    if (state.breathingSessions.length === 0) {
        container.innerHTML = '<p style="color: #666; font-size: 14px;">No breathing sessions yet</p>';
        return;
    }
    
    const recentSessions = state.breathingSessions.slice(-10).reverse();
    recentSessions.forEach(session => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-item';
        
        const date = new Date(session.date);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        sessionDiv.innerHTML = `
            <div>${dateStr}</div>
            <div style="color: #666;">${session.cycles} cycles • ${session.duration}s</div>
        `;
        container.appendChild(sessionDiv);
    });
}

function showDataInspector() {
    const display = document.getElementById('data-display');
    display.classList.toggle('hidden');
    
    if (!display.classList.contains('hidden')) {
        const data = {
            habitProgress: state.habits.map(h => ({ title: h.title, completed: h.completed })),
            growthPoints: state.growthPoints,
            journalEntries: state.journalEntries.length,
            breathingSessions: state.breathingSessions.length,
            totalBreathingTime: state.breathingSessions.reduce((sum, s) => sum + s.duration, 0)
        };
        
        display.textContent = JSON.stringify(data, null, 2);
    }
}

function exportData() {
    const data = {
        habits: state.habits,
        growthPoints: state.growthPoints,
        journalEntries: state.journalEntries,
        breathingSessions: state.breathingSessions,
        settings: state.settings,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `calm-awareness-data-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// Event Listeners Setup
function setupEventListeners() {
    // Home screen
    document.getElementById('breathe-btn').addEventListener('click', () => {
        navigateTo('breathe');
        setTimeout(startBreathing, 500);
    });
    document.getElementById('habit-btn').addEventListener('click', () => navigateTo('habit'));
    document.getElementById('journal-btn').addEventListener('click', () => navigateTo('journal'));
    document.getElementById('settings-btn').addEventListener('click', () => navigateTo('settings'));
    
    // Breathe screen
    document.getElementById('stop-breathe-btn').addEventListener('click', stopBreathing);
    document.getElementById('back-from-breathe').addEventListener('click', stopBreathing);
    
    // Habit screen
    document.getElementById('back-from-habit').addEventListener('click', () => navigateTo('home'));
    
    // Journal screen
    setupJournalMoodBubbles();
    document.getElementById('save-journal-btn').addEventListener('click', saveJournalEntry);
    document.getElementById('back-from-journal').addEventListener('click', () => navigateTo('home'));
    
    // Settings screen
    document.getElementById('sound-toggle').addEventListener('change', (e) => {
        state.settings.soundEnabled = e.target.checked;
        saveData(STORAGE_KEYS.SETTINGS, state.settings);
    });
    document.getElementById('notification-toggle').addEventListener('change', (e) => {
        state.settings.notificationsEnabled = e.target.checked;
        saveData(STORAGE_KEYS.SETTINGS, state.settings);
    });
    document.getElementById('show-data-btn').addEventListener('click', showDataInspector);
    document.getElementById('export-data-btn').addEventListener('click', exportData);
    document.getElementById('back-from-settings').addEventListener('click', () => navigateTo('home'));
    
    // Summary screen
    document.getElementById('continue-btn').addEventListener('click', () => navigateTo('home'));
}

// Initialize App
function init() {
    loadData();
    setupEventListeners();
    navigateTo('home');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}