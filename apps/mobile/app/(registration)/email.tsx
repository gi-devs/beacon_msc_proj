import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';

const Email = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleNextPress = () => {
    console.log('Email:', email);
  };

  return (
    <View className="flex flex-col items-center h-full pt-[50%] px-8 pb-20 bg-primary ">
      <Image
        source={require('@/assets/icons/BEACON_title.png')}
        className="w-2/3 mr-auto"
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold leading-tight w-full text-white">
        What's your email?
      </Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#ffffff"
        className="border-b border-gray-300 rounded-lg p-4 mt-4 w-full text-white"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity
        className="mt-auto ml-auto mb-safe py-3 px-6 rounded-md bg-secondary"
        onPress={handleNextPress}
      >
        <Text className="text-white text-center font-bold">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Email;
