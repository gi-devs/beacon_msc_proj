import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormSecureTextInput,
  FormTextInput,
} from '@/components/form/FormTextInput';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { Toast } from 'toastify-react-native';
import { LogInData, logInSchema } from '@beacon/validation';

const LogIn = () => {
  const isMounted = useIsMounted();
  const { login } = useAuth();
  const { control, handleSubmit } = useForm<LogInData>({
    resolver: zodResolver(logInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    isMounted.current = true;
  }, []);
  if (!isMounted.current) return null;

  const handleNextPress = async (data: LogInData) => {
    const { email, password } = data;

    try {
      const user = await login(email, password);
      if (user) {
        Toast.success('Logged in successfully!');
      }
    } catch (error) {
      console.log('Registration error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior="height"
      keyboardVerticalOffset={20}
    >
      <ScrollView
        className="flex-col h-full pt-[40%] px-8 pb-20 bg-ripple-600 relative"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <Image
          source={require('@/assets/icons/BEACON_title.png')}
          className="w-2/3 self-start -left-5"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold leading-tight w-full text-white">
          Welcome back!
        </Text>
        <View className="w-full flex gap-4 mt-8">
          <FormTextInput
            name="email"
            control={control}
            placeholder="Email"
            placeholderTextColor="#ffff"
          />
          <FormSecureTextInput
            name="password"
            control={control}
            placeholder="Password"
            placeholderTextColor="#ffff"
          />
        </View>
        <View className="mt-8 w-full">
          <Text className="text-sm text-gray-400 mt-2 w-full text-center">
            We will never share your email with anyone.
          </Text>
          <Text className="text-sm text-gray-400 mt-2 w-full text-center leading-relaxed">
            By signing in, you agree to our{' '}
            <Text className="underline font-bold">Terms of Service</Text> and{' '}
            <Text className="underline font-bold">Privacy Policy</Text>
          </Text>
        </View>
        <TouchableOpacity
          className="ml-auto mb-safe py-3 px-6 bg-ripple-500 min-w-48 rounded-full mt-20"
          onPress={handleSubmit(handleNextPress)}
        >
          <Text className="text-white text-center font-bold">Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LogIn;
