import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';
import { StatusBar } from 'react-native';
import { AuthProvider } from '@/context/authContext';
import ToastManager from 'toastify-react-native';
import { UIProvider } from '@/context/uiContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UIProvider>
          <StatusBar backgroundColor="transparent" translucent={true} />
          <ToastManager />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#fff' },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack>
        </UIProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
