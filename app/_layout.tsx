import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { LoginGate } from '@/components/login-gate-clean';
import { GameProvider } from '@/providers/game-provider';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const navigationTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#f3ead7',
      card: '#fff7e6',
      primary: '#ef233c',
      text: '#111111',
      border: '#111111',
    },
  };

  return (
    <GameProvider>
      <ThemeProvider value={navigationTheme}>
        <LoginGate>
          <Stack screenOptions={{ contentStyle: { backgroundColor: '#f3ead7' } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </LoginGate>
        <StatusBar style="light" />
      </ThemeProvider>
    </GameProvider>
  );
}
