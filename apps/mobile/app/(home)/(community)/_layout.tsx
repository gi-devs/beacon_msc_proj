import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { useCommunitiesStore } from '@/store/useCommunitiesStore';
import { useEffect } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { AppStyles } from '@/constants/AppStyles';

const CommunityLayout = () => {
  return <CommunityNavigator />;
};

const CommunityNavigator = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={() => <CustomDrawerContent />}
        screenOptions={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="menu" size={28} color="black" />
            </TouchableOpacity>
          ),
          drawerStyle: { width: 300 },
        })}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Communities',
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

  const isIndexActive = pathname === '/';

  return (
    <View className="pt-safe px-4">
      <Pressable onPress={() => router.push('/(home)/(community)')}>
        <View className="flex-row gap-4">
          <MaterialIcons name="people-alt" size={24} color="black" />
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Communities
          </Text>
        </View>
      </Pressable>

      {/* --- Dynamic Rooms --- */}
      {items.map((c) => {
        const href = `/rooms/${c.id}`;
        const isActive = pathname.startsWith(href);

        return (
          <Pressable
            key={c.id}
            onPress={() => router.push(`/(home)/(community)/rooms/${c.id}`)}
            className="mb-3 rounded-xl px-4 py-3 shadow-sm"
            style={{
              backgroundColor: isActive ? Colors.app.ripple['300'] : '#FFFFFF',
              borderWidth: 1,
              borderColor: Colors.app.ripple['300'],
            }}
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
