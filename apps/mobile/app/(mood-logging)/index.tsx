import { View, Text, TextInput, ScrollView } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import MoodFace from '@/components/MoodFace';

export default function MoodLoggingIndex() {
  const [stress, setStress] = useState(50);
  const [anxiety, setAnxiety] = useState(50);
  const [sadness, setSadness] = useState(50);

  const [total, setTotal] = useState((sadness + anxiety + stress) / 3);

  useEffect(() => {
    setTotal((sadness + anxiety + stress) / 3);
  }, [sadness, anxiety, stress]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View className="bg-white p-6 rounded-3xl w-full max-w-md">
          <Text className="text-center text-lg font-medium mb-4">
            {format(new Date(), 'EEEE do MMMM')}
          </Text>

          <View className="items-center mb-6">
            <MoodFace mood={total} size={70} />
          </View>

          {/* Stress Slider */}
          <Text className="text-base font-medium mb-1">
            How stressed do you feel?
          </Text>
          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-500">Not at all</Text>
            <Text className="text-xs text-gray-500">Very</Text>
          </View>
          <Slider
            value={stress}
            onValueChange={setStress}
            minimumValue={1}
            maximumValue={100}
            step={1}
            thumbTintColor="#C8A69B"
            minimumTrackTintColor="#C8A69B"
            maximumTrackTintColor="#e5e5e5"
          />
          <TextInput
            placeholder="Few words to describe why?"
            className="bg-gray-100 rounded-md p-2 my-2 text-sm"
          />

          {/* Anxiety Slider */}
          <Text className="text-base font-medium mb-1 mt-4">
            How anxious do you feel?
          </Text>
          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-500">Not at all</Text>
            <Text className="text-xs text-gray-500">Very</Text>
          </View>
          <Slider
            value={anxiety}
            onValueChange={setAnxiety}
            minimumValue={1}
            maximumValue={100}
            step={1}
            thumbTintColor="#C8A69B"
            minimumTrackTintColor="#C8A69B"
            maximumTrackTintColor="#e5e5e5"
          />
          <TextInput
            placeholder="Few words to describe why?"
            className="bg-gray-100 rounded-md p-2 my-2 text-sm"
          />

          {/* Sadness Slider */}
          <Text className="text-base font-medium mb-1 mt-4">
            Are you feeling sad today
          </Text>
          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-500">Not at all</Text>
            <Text className="text-xs text-gray-500">Very</Text>
          </View>
          <Slider
            value={sadness}
            onValueChange={setSadness}
            minimumValue={1}
            maximumValue={100}
            step={1}
            thumbTintColor="#C8A69B"
            minimumTrackTintColor="#C8A69B"
            maximumTrackTintColor="#e5e5e5"
          />
          <TextInput
            placeholder="Few words to describe why?"
            className="bg-gray-100 rounded-md p-2 my-2 text-sm"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
