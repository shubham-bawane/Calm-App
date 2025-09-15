export const theme = {
  colors: {
    bg1: '#F5F7F8',
    bg2: '#EAF4F4',
    accent: '#6AA6A4',
    accent2: '#A8C3B0',
    mutedText: '#4A5555',
    softSand: '#F0EDE8',
    // Mood colors
    calm: '#A7D3E6',
    neutral: '#CFCFD3',
    joyful: '#F2E8B8',
    tense: '#E6B2B2',
    sad: '#C7A1A1',
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '600',
      color: '#4A5555',
    },
    h2: {
      fontSize: 20,
      fontWeight: '500',
      color: '#4A5555',
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      color: '#4A5555',
    },
    small: {
      fontSize: 14,
      fontWeight: '400',
      color: '#4A5555',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 1000,
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  animations: {
    // Motion tokens
    defaultTransition: {
      duration: 400,
      easing: [0.22, 0.9, 0.33, 1], // cubic-bezier
    },
    buttonPress: {
      scale: 0.96,
      spring: {
        stiffness: 120,
        damping: 14,
      },
    },
    ctaPulse: {
      duration: 3200,
      scale: {
        from: 1,
        to: 1.02,
      },
    },
    breathingInhale: {
      duration: 4000,
      scale: {
        from: 1,
        to: 1.18,
      },
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
    breathingHold: {
      duration: 1000,
    },
    breathingExhale: {
      duration: 6000,
      scale: {
        from: 1.18,
        to: 0.92,
      },
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
    plantGrowth: {
      duration: 700,
      spring: {
        stiffness: 70,
        damping: 12,
      },
    },
    moodMorph: {
      duration: 900,
    },
  },
};

export const breathingConfig = {
  inhale: 4000, // 4 seconds
  hold: 1000,   // 1 second
  exhale: 6000, // 6 seconds
  cycles: 3,    // 3 complete cycles
};

export const moodInferenceConfig = {
  weights: {
    tap_speed: { tense: 0.6, calm: -0.3 },
    hold_duration: { calm: 0.5, flat: 0.2 },
    swipe_jerk: { tense: 0.7 },
    stroke_complexity: { joyful: 0.5, flat: -0.2 },
    touch_area: { calm: 0.3, joyful: 0.4 },
  },
  confidence_threshold: 0.55,
};