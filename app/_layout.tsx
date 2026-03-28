import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/providers/auth-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ contentStyle: { backgroundColor: '#F4F8F6' } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="signin" options={{ title: 'Sign In' }} />
          <Stack.Screen name="signup" options={{ title: 'Create Account' }} />
          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
          <Stack.Screen name="cart" options={{ title: 'Cart' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}
