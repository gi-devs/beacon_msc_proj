import {
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MoodLogForm from '@/components/form/Forms/MoodLogForm';
import { useScroll } from '@/context/scrollContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import JournalEntryForm from '@/components/form/Forms/JournalEntryForm';

const Journal = () => {
  const { setHasScrolled } = useScroll();
  const router = useRouter();
  const { mode } = useLocalSearchParams();

  const label = mode === 'daily-log' ? 'Next' : 'Save';

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    setHasScrolled(y > 0);
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
          <JournalEntryForm
            shouldPost={!mode}
            callback={() => {
              console.log('Journal entry submitted');
              router.push('/(home)');
            }}
            saveLabel={label}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Journal;
