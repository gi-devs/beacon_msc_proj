import { Stack } from 'expo-router';

export default function MoodLoggingLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
