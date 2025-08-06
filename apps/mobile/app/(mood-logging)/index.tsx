import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import MoodLogForm from '@/components/form/Forms/MoodLogForm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useScroll } from '@/context/scrollContext';

export default function MoodLoggingIndex() {
  const { setHasScrolled } = useScroll();
  const router = useRouter();
  const { mode } = useLocalSearchParams();

  const label = mode === 'daily-log' ? 'Next' : 'Save';

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    setHasScrolled(y > 0);
  };

  const handleSubmit = () => {
    if (mode === 'daily-log') {
      return router.push('/(mood-logging)/journal');
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(home)');
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={40}
        className="h-full"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <MoodLogForm
            shouldPost={!mode}
            callback={handleSubmit}
            saveLabel={label}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
