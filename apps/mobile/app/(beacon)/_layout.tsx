import { Stack } from 'expo-router';

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
      <Stack.Screen name="reply" />
    </Stack>
  );
}
