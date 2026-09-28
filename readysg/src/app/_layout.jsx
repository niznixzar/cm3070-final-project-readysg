import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from 'react-native-paper';
import { isFirebaseConfigured } from '../lib/firebase';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ProgressProvider } from '../context/ProgressContext';
import { AlertsProvider } from '../context/AlertsContext';
import { ThemeProvider, useThemeSettings } from '../context/ThemeContext';
import NotificationBanner from '../components/NotificationBanner';
import SetupNeeded from '../components/SetupNeeded';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { initialising } = useAuth();
  const { scheme } = useThemeSettings();
  const { colors } = useTheme();

  useEffect(() => {
    if (!initialising) SplashScreen.hideAsync().catch(() => {});
  }, [initialising]);

  if (initialising) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
        {/* Full screen, and can't be swiped away. */}
        <Stack.Screen name="alert/[id]" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
      </Stack>
      <NotificationBanner />
    </>
  );
}

export default function RootLayout() {
  if (!isFirebaseConfigured) {
    SplashScreen.hideAsync().catch(() => {});
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <SetupNeeded />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ProgressProvider>
            <AlertsProvider>
              <RootStack />
            </AlertsProvider>
          </ProgressProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
