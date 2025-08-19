import { ScrollView, View, ViewProps } from 'react-native';
import clsx from 'clsx';

type SafeWrapperProps = {
  children: React.ReactNode;
  className?: string;
  viewProps?: ViewProps;
};

export const SafeWrapper = ({
  children,
  className,
  viewProps,
}: SafeWrapperProps) => {
  const composedClass = clsx('mt-safe px-6 pb-4 mb-[100px]', className);

  return (
    <View className={composedClass} {...viewProps}>
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
