import { Platform, View } from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { buildHref } = useLinkBuilder();
  const router = useRouter();

  const middleIndex = Math.floor(state.routes.length / 2);

  return (
    <View className="flex-row items-center justify-around bg-white absolute left-0 bottom-0 right-0 rounded-t-3xl h-[100px]">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const icon = options.tabBarIcon?.({
          color: isFocused ? Colors.app.ripple['100'] : Colors.light.text,
          size: 24,
          focused: isFocused,
        });

        const tab = (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            className="flex-1 items-center justify-center"
            android_ripple={{ color: 'transparent' }}
          >
            {icon}
          </PlatformPressable>
        );

        if (index === middleIndex) {
          return [
            <View
              key="middle-button"
              className="flex-1 items-center justify-center"
            >
              <PlatformPressable
                className="bg-ripple-400 w-16 h-16 rounded-full items-center justify-center shadow-lg"
                android_ripple={{ color: 'transparent' }}
                onPress={() => router.push('/(mood-logging)')}
              >
                <Ionicons name="add" size={28} color="white" />
              </PlatformPressable>
            </View>,
            tab,
          ];
        }

        return tab;
      })}
    </View>
  );
}
