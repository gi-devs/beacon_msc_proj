import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

const MoodReview = () => {
  return (
    <SafeAreaView>
      <Text>
        Mood Logging is currently under construction. Please check back later!
      </Text>
      <Link href="/(mood-logging)/journal">
        <Text style={{ color: 'blue' }}>Go to Journal Entry</Text>
      </Link>
    </SafeAreaView>
  );
};

export default MoodReview;
