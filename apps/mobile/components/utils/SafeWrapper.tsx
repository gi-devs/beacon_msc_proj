import {
  ScrollView,
  StyleProp,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import clsx from 'clsx';

type SafeWrapperProps = {
  children: React.ReactNode;
  className?: string;
  viewProps?: ViewProps;
  style?: StyleProp<ViewStyle>;
};

export const SafeWrapper = ({
  children,
  className,
  style,
  viewProps,
}: SafeWrapperProps) => {
  const composedClass = clsx('mt-safe px-6 mb-[100px]', className);

  return (
    <View className={composedClass} {...viewProps} style={style}>
      {children}
    </View>
  );
};

export const SafeScrollWrapper = ({
  children,
  className,
  viewProps,
}: SafeWrapperProps) => {
  const composedClass = clsx('mt-safe px-6 pb-safe mb-[100px]', className);

  return (
    <ScrollView className={composedClass} {...viewProps}>
      {children}
    </ScrollView>
  );
};
