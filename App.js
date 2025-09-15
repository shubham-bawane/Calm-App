import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import BreatheScreen from './src/screens/BreatheScreen';
import HabitScreen from './src/screens/HabitScreen';
import JournalScreen from './src/screens/JournalScreen';
import SessionSummaryScreen from './src/screens/SessionSummaryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MoodCalibrationScreen from './src/screens/MoodCalibrationScreen';

// Theme and Config
import { theme } from './src/config/theme';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor={theme.colors.bg1} />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: ({ current, next, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                  opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              };
            },
            transitionSpec: {
              open: {
                animation: 'timing',
                config: {
                  duration: 400,
                },
              },
              close: {
                animation: 'timing',
                config: {
                  duration: 400,
                },
              },
            },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Breathe" component={BreatheScreen} />
          <Stack.Screen name="Habit" component={HabitScreen} />
          <Stack.Screen name="Journal" component={JournalScreen} />
          <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="MoodCalibration" component={MoodCalibrationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}