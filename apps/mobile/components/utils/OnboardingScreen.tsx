// app/(auth)/Onboarding.tsx or screens/Onboarding.tsx

import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestNotificationPermissions } from '@/lib/notification';
import UIButton from '@/components/ui/UIButton';
import { saveSecureItem } from '@/lib/secureStore';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Welcome to Beacon',
    description:
      'We’re here to help you learn about yourself and encourage you daily.',
  },
  {
    key: '2',
    title: 'Stay Connected',
    description:
      'Beacon is better with notifications on! \n Get chatting anonymous with like-minded people nearby.',
  },
  { key: '3', title: 'Get Started', description: 'Let’s begin your journey.' },
];

export default function OnboardingScreen({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const complete = async () => {
    await requestNotificationPermissions();
    await saveSecureItem('onboarding-complete', 'true');
    onFinish(); // to show main app
  };

  const goNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await complete();
    }
  };

  const renderItem = ({ item }: any) => (
    <View
      style={{
        width,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Text className="text-center text-4xl font-bold">{item.title}</Text>
      <Text className="text-center mt-4 font-light leading-normal">
        {item.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1">
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.key}
      />

      {/* Pagination Dots */}
      <View className="flex-row justify-center mb-5">
        {slides.map((_, i) => (
          <View
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: currentIndex === i ? '#555' : '#ccc',
              margin: 5,
            }}
          />
        ))}
      </View>
      <View className="px-6">
        <UIButton onPress={goNext} variant="primary">
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </UIButton>
      </View>
    </SafeAreaView>
  );
}
