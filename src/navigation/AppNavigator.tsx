import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { TopScreen } from '../screens/TopScreen';
import { PracticeScreen } from '../screens/PracticeScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { InfoScreen } from '../screens/InfoScreen';
import { ExerciseScreen } from '../screens/ExerciseScreen';
import { ResultSummaryScreen } from '../screens/ResultSummaryScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { QuizSetupScreen } from '../screens/QuizSetupScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { COLORS } from '../lib/theme';
import type { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    TOP: '🏠',
    Practice: '📝',
    Quiz: '🎯',
    Info: 'ℹ️',
  };
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] || '•'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
      })}
    >
      <Tab.Screen name="TOP" component={TopScreen} options={{ tabBarLabel: 'TOP' }} />
      <Tab.Screen name="Practice" component={PracticeScreen} options={{ tabBarLabel: '問題演習' }} />
      <Tab.Screen name="Quiz" component={QuizScreen} options={{ tabBarLabel: '小テスト' }} />
      <Tab.Screen name="Info" component={InfoScreen} options={{ tabBarLabel: '関連情報' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="Exercise"
        component={ExerciseScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ResultSummary"
        component={ResultSummaryScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="QuizSetup"
        component={QuizSetupScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
