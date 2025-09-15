import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../config/theme';

// Placeholder Lottie component
// In production, this would use actual Lottie files
export default function LottieView({ 
  source, 
  style, 
  autoPlay = true, 
  loop = true,
  progress,
  ...props 
}) {
  const getPlaceholderContent = () => {
    if (typeof source === 'string') {
      switch (source) {
        case 'breathing-circle':
          return '🌊';
        case 'plant-growth':
          return '🌱';
        case 'watercolor-blob':
          return '💧';
        case 'leaf-unfurl':
          return '🍃';
        case 'wave-animation':
          return '〰️';
        default:
          return '✨';
      }
    }
    return '💙';
  };

  return (
    <View style={[styles.container, style]} {...props}>
      <Text style={styles.placeholder}>
        {getPlaceholderContent()}
      </Text>
      <Text style={styles.label}>
        Lottie: {typeof source === 'string' ? source : 'custom'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  placeholder: {
    fontSize: 40,
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.small,
    color: theme.colors.mutedText,
    opacity: 0.6,
    textAlign: 'center',
  },
});