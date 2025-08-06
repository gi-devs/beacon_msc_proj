import { Stack, useRouter } from 'expo-router';
import { MoodLogProvider } from '@/context/logCreatorContext';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollProvider, useScroll } from '@/context/scrollContext';
import UIButton from '@/components/ui/UIButton';

export default function MoodLoggingLayout() {
  return (
    <MoodLogProvider>
      <ScrollProvider>
        <MoodLoggingHeader />
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
    </Stack>
  );
}

function MoodLoggingHeader() {
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
    <View style={[styles.headerContainer, hasScrolled && styles.headerShadow]}>
      <View className="pt-safe flex-row px-4 py-4">
        <UIButton onPress={backAction} variant="ghost">
          Back
        </UIButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'white',
    zIndex: 10,
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
