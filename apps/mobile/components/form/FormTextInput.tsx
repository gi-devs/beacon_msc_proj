import {
  TextInput,
  Text,
  View,
  TextInputProps,
  TouchableOpacity,
  StyleProp,
  TextStyle,
} from 'react-native';
import { Controller, Control } from 'react-hook-form';
import clsx from 'clsx';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const textFieldVariants = {
  variants: {
    base: 'border-b border-gray-300 rounded-lg p-4',
    textarea: 'border border-gray-300 rounded-md p-4 mt-4',
  },
};

type Variant = keyof typeof textFieldVariants.variants;

type FormInputProps = {
  name: string;
  control: Control<any>;
  className?: string;
  info?: string;
  label?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  variant?: Variant;
} & Omit<TextInputProps, 'className'>;

export const FormTextInput = ({
  name,
  control,
  className,
  info,
  label,
  wrapperClassName,
  labelClassName,
  variant = 'base',
  ...textInputProps
}: FormInputProps) => {
  const isTextArea = variant === 'textarea';
  const baseStyle = {
    minHeight: isTextArea ? 350 : undefined,
    textAlignVertical: isTextArea ? 'top' : undefined,
  };

  return (
    <View className={wrapperClassName}>
      {label && (
        <Text className={clsx('text-gray-700 text-sm', labelClassName)}>
          {label}
        </Text>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View className="w-full">
            <TextInput
              {...textInputProps}
              className={clsx(
                textFieldVariants.variants[variant],
                'text-base',
                className,
              )}
              onChangeText={onChange}
              value={value}
              multiline={isTextArea}
              numberOfLines={isTextArea ? 5 : undefined}
              style={[baseStyle, textInputProps.style] as StyleProp<TextStyle>}
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
    </View>
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
              'border-b border-gray-300 rounded-lg p-4  pr-12',
              'text-base',
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
