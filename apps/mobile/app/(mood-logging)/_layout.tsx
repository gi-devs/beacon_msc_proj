import { Stack, useRouter, useSegments } from 'expo-router';
import { MoodLogProvider } from '@/context/logCreatorContext';
import { StyleSheet, View } from 'react-native';
import { ScrollProvider, useScroll } from '@/context/scrollContext';
import UIButton from '@/components/ui/UIButton';

export default function MoodLoggingLayout() {
  const segments = useSegments();
  const currentRoute = segments.at(-1);

  return (
    <MoodLogProvider>
      <ScrollProvider>
        <MoodLoggingHeader headerTransparent={currentRoute === 'broadcast'} />
        <MoodLoggingNavigator />
      </ScrollProvider>
    </MoodLogProvider>
  );
}

function MoodLoggingNavigator() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="journal" />
      <Stack.Screen
        name="broadcast"
        options={{
          animation: 'fade',
        }}
      />
    </Stack>
  );
}

function MoodLoggingHeader({
  headerTransparent = false,
}: {
  headerTransparent?: boolean;
}) {
  const { hasScrolled } = useScroll();
  const router = useRouter();

  const backAction = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(home)');
    }
  };

  return (
    <View
      style={[
        headerTransparent ? styles.headerTransparent : styles.headerContainer,
        !headerTransparent && hasScrolled && styles.headerShadow,
      ]}
    >
      <View className="pt-safe flex-row px-4 py-4">
        <UIButton
          onPress={backAction}
          variant="ghost"
          textClassName={headerTransparent ? 'text-white' : 'text-gray-800'}
        >
          Back
        </UIButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 10,
    backgroundColor: 'white',
  },
  headerTransparent: {
    zIndex: 10,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerShadow: {
    shadowColor: '#a8a8a8',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 12, // Android shadow
  },
});
