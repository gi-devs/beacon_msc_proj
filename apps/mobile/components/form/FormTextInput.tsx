import {
  TextInput,
  Text,
  View,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Controller, Control } from 'react-hook-form';
import clsx from 'clsx';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

type FormInputProps = {
  name: string;
  control: Control<any>;
  className?: string;
  info?: string;
} & Omit<TextInputProps, 'className'>;

export const FormTextInput = ({
  name,
  control,
  className,
  info,
  ...textInputProps
}: FormInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="w-full">
          <TextInput
            {...textInputProps}
            className={clsx(
              'border-b border-gray-300 rounded-lg p-4 text-white',
              className,
            )}
            onChangeText={onChange}
            value={value}
          />
          {info && (
            <Text className="text-gray-400 text-xs mt-2 ml-1">{info}</Text>
          )}
          {error && (
            <Text className="text-red-400 mt-4 pl-1">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
};

type FormSecureTextInputProps = {
  name: string;
  control: Control<any>;
  className?: string;
} & Omit<TextInputProps, 'secureTextEntry, className'>;

export const FormSecureTextInput = ({
  name,
  control,
  className,
  ...textInputProps
}: FormSecureTextInputProps) => {
  const [isHidden, setIsHidden] = useState(true);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="w-full relative">
          <TextInput
            {...textInputProps}
            secureTextEntry={isHidden}
            className={clsx(
              'border-b border-gray-300 rounded-lg p-4 text-white pr-12',
              className,
            )}
            onChangeText={onChange}
            value={value}
          />
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setIsHidden(!isHidden)}
          >
            {isHidden ? (
              <Ionicons name="eye" size={20} />
            ) : (
              <Ionicons name="eye-off" size={20} />
            )}
          </TouchableOpacity>
          {error && (
            <Text className="text-red-400 mt-4 pl-1">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
};
