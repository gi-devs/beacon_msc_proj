import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RegistrationLayout = () => {
  const router = useRouter();

  const handleBackPress = () => {
    router.push('/');
  };

  return (
    <>
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 100, // adjust for safe area
          left: 25,
          width: 40,
          aspectRatio: 1,
          // backgroundColor: colors.app.secondary, // tailwind orange-500
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
        }}
        onPress={handleBackPress}
      >
        <Ionicons name="arrow-back" size={32} color="white" />
      </TouchableOpacity>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="sign-up" options={{ title: 'SignUp' }} />
      </Stack>
    </>
  );
};

export default RegistrationLayout;
