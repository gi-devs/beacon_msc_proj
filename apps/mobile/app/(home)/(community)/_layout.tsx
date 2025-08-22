import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { useCommunitiesStore } from '@/store/useCommunitiesStore';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

const CommunityLayout = () => {
  return <CommunityNavigator />;
};

const CommunityNavigator = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer drawerContent={() => <CustomDrawerContent />}>
        <Drawer.Screen
          name="index"
          options={{
            title: 'Community',
            headerShown: true,
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: '#f8f8f8' },
            headerTintColor: '#333',
            drawerType: 'back',
          }}
        />
        <Drawer.Screen
          name="rooms/[id]"
          options={{
            headerShown: true,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

function CustomDrawerContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { items, refresh } = useCommunitiesStore();

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <View className="pt-safe px-4">
      <Text className="text-lg font-bold text-gray-800 mb-4">
        My Communities
      </Text>

      {items.map((c) => {
        const href = `/rooms/${c.id}`;
        const isActive = pathname.startsWith(href);

        return (
          <Pressable
            key={c.id}
            onPress={() => router.push(`/(home)/(community)/rooms/${c.id}`)} // navigation
            className={`mb-3 rounded-xl px-4 py-3 shadow-sm ${
              isActive ? 'bg-blue-500' : 'bg-red-500'
            }`}
          >
            <Text
              className={`text-base font-medium ${
                isActive ? 'text-white' : 'text-gray-900'
              }`}
            >
              {c.roomName}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default CommunityLayout;
