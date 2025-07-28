import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';
import { StatusBar } from 'react-native';
import { AuthProvider, useAuth } from '@/context/authContext';
import ToastManager from 'toastify-react-native';
import { UIProvider } from '@/context/uiContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UIProvider>
          <StatusBar backgroundColor="transparent" translucent={true} />
          <ToastManager />
          <RootNavigator />
        </UIProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
