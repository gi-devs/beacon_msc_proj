import { SplashScreen, Stack } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import '../global.css';
import { StatusBar } from 'react-native';
import { AuthProvider, useAuth } from '@/context/authContext';
import ToastManager from 'toastify-react-native';
import { UIProvider } from '@/context/uiContext';
import { NotificationProvider } from '@/context/notificationContext';
import { useEffect } from 'react';
import { LocationProvider } from '@/context/locationContext';
import { MoodLogProvider } from '@/context/moodLogContext';
import { JournalEntryProvider } from '@/context/journalEntryContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <LocationProvider>
            <MoodLogProvider>
              <JournalEntryProvider>
                <UIProvider>
                  <StatusBar backgroundColor="transparent" translucent={true} />
                  <ToastManager />
                  <RootNavigator />
                </UIProvider>
              </JournalEntryProvider>
            </MoodLogProvider>
          </LocationProvider>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      SplashScreen.hide();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
        animation: 'fade',
      }}
    >
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen name="(mood-logging)" options={{ headerShown: false }} />
        <Stack.Screen name="(beacon)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
