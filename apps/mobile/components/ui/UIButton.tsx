import { ReactNode } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Link, LinkProps, RelativePathString } from 'expo-router';
import clsx from 'clsx';

const buttonVariants = {
  base: 'flex justify-center items-center rounded-full',
  variants: {
    primary: 'bg-ripple-100',
    secondary: 'bg-secondaryLight',
    outline: 'bg-transparent border border-black',
    ghost: 'bg-transparent p-0',
    destructive: 'bg-red-500',
  },
  sizes: {
    sm: 'py-3 px-3',
    md: 'py-4 px-4',
    lg: 'py-5 px-6',
  },
};

const TextVariants = {
  base: 'text-center font-bold',
  variants: {
    primary: 'text-black',
    secondary: 'text-black',
    outline: 'text-black',
    ghost: 'text-black',
    destructive: 'text-white',
  },
  sizes: {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  },
};

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

type UIButtonProps = {
  children: ReactNode;
  href?: LinkProps['href'];
  variant?: Variant;
  size?: Size;
  buttonClassName?: string;
  textClassName?: string;
} & Omit<TouchableOpacityProps, 'className'>;

const UIButton = ({
  children,
  href,
  variant = 'secondary',
  size = 'md',
  buttonClassName,
  textClassName,
  ...rest
}: UIButtonProps) => {
  const composedButtonClass = clsx(
    buttonVariants.base,
    variant !== 'ghost' && buttonVariants.sizes[size],
    buttonVariants.variants[variant],
    buttonClassName,
  );

  const composedTextClass = clsx(
    TextVariants.base,
    TextVariants.sizes[size],
    TextVariants.variants[variant],
    textClassName,
  );

  const button = (
    <TouchableOpacity className={composedButtonClass} {...rest}>
      <Text className={composedTextClass}>{children}</Text>
    </TouchableOpacity>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        {button}
      </Link>
    );
  }

  return button;
};

export default UIButton;
