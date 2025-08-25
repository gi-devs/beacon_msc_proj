import {
  Image,
  KeyboardAvoidingView,
  Platform,
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
import { useIsMounted } from '@/hooks/ui/useIsMounted';
import { useEffect } from 'react';
import { SignUpData, signUpSchema } from '@beacon/validation';
import { Toast } from 'toastify-react-native';
import { useAuthStore } from '@/store/useAuthStore';

const SignUp = () => {
  const isMounted = useIsMounted();
  const { register } = useAuthStore();
  const { control, handleSubmit } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
    },
  });

  useEffect(() => {
    isMounted.current = true;
  }, []);
  if (!isMounted.current) return null;

  const handleNextPress = async (data: SignUpData) => {
    console.log('Valid form data:', data);

    const { email, password, username } = data;

    try {
      const user = await register(email, password, username);
      if (user) {
        Toast.success(`Welcome, ${user.username}!`);
      }
    } catch (error) {
      console.log('Registration error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={40}
    >
      <ScrollView
        className="flex-col px-8 pb-20 bg-ripple-600 relative"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: '40%',
        }}
      >
        <Image
          source={require('@/assets/icons/BEACON_title.png')}
          className="w-2/3 self-start -left-5"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold leading-tight w-full text-white">
          Let's get you set up!
        </Text>
        <View className="w-full flex gap-4 mt-8">
          <FormTextInput
            name="email"
            control={control}
            placeholder="Email"
            placeholderTextColor="#ffff"
            className="text-white"
          />
          <FormTextInput
            name="username"
            control={control}
            placeholder="Username"
            placeholderTextColor="#ffff"
            info="Your username will be visible to others."
            className="text-white"
          />
          <FormSecureTextInput
            name="password"
            control={control}
            placeholder="Password"
            placeholderTextColor="#ffff"
            className="text-white"
          />
          <FormTextInput
            name="confirmPassword"
            control={control}
            placeholder="Confirm Password"
            placeholderTextColor="#ffff"
            secureTextEntry
            className="text-white"
          />
        </View>
        <View className="mt-8 w-full">
          <Text className="text-sm text-gray-400 mt-2 w-full text-center">
            We will never share your email with anyone.
          </Text>
          <Text className="text-sm text-gray-400 mt-2 w-full text-center leading-relaxed">
            By signing up, you agree to our{' '}
            <Text className="underline font-bold">Terms of Service</Text> and{' '}
            <Text className="underline font-bold">Privacy Policy</Text>.
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

export default SignUp;
