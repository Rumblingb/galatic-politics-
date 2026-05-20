import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { LoginGate } from '@/components/login-gate';
import { AuthProvider } from '@/providers/auth-provider';
import { GameProvider } from '@/providers/game-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f3ead7',
    card: '#fff7e6',
    primary: '#ef233c',
    text: '#111111',
    border: '#111111',
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <GameProvider>
        <ThemeProvider value={AppTheme}>
          <LoginGate>
            <Stack screenOptions={{ contentStyle: { backgroundColor: '#f3ead7' } }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </LoginGate>
          <StatusBar style="dark" />
        </ThemeProvider>
      </GameProvider>
    </AuthProvider>
  );
}
