import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/authContext';

const HomeIndex = () => {
  const { logout } = useAuth();
  return (
    <View className="mt-safe">
      <Text>AUTHED IN</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeIndex;
