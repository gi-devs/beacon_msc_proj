import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import OnboardingScreen from '@/components/utils/OnboardingScreen';
import { useEffect, useState } from 'react';
import { getSecureItem, saveSecureItem } from '@/lib/secureStore';

export default function HomeTabsLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkFirstTime = async () => {
      const onboarded = await getSecureItem('onboarding-complete');
      setShowOnboarding(!onboarded); // show onboarding if not complete
      setIsLoading(false);
    };

    checkFirstTime();
  }, []);

  if (isLoading) return null; // or splash screen

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onFinish={async () => {
          await saveSecureItem('onboarding-complete', 'true');
          setShowOnboarding(false);
        }}
      />
    );
  }

  return <HomeNavigator />;
}

function HomeNavigator() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
