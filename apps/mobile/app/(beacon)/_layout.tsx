import { Stack, useRouter, useSegments } from 'expo-router';
import { MoodLogProvider } from '@/context/logCreatorContext';
import { StyleSheet, View } from 'react-native';
import { ScrollProvider, useScroll } from '@/context/scrollContext';
import UIButton from '@/components/ui/UIButton';

export default function BeaconLayout() {
  return <BeaconNavigator />;
}

function BeaconNavigator() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="reply" />
    </Stack>
  );
}
