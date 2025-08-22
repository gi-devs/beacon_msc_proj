import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Device from 'expo-device';

const HeaderWithRouteUI = ({ header }: { header: string }) => {
  const router = useRouter();
  return (
    <View
      className="flex-row justify-between items-center border-b pb-4 border-gray-300"
      style={{ marginTop: Device.osName === 'ios' ? 8 : 24 }}
    >
      <Text className="text-xl">{header}</Text>
      <Pressable
        onPress={() => {
          router.push('/(home)/(community)');
        }}
      >
        <MaterialIcons name="people-alt" size={24} color="black" />
      </Pressable>
    </View>
  );
};

export default HeaderWithRouteUI;
