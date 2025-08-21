import { Tabs } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import OnboardingScreen from '@/components/utils/OnboardingScreen';
import { useEffect, useState } from 'react';
import CustomTabBar from '@/components/ui/CustomTabBar';
import { AsyncItemKey, getAsyncItem, saveAsyncItem } from '@/lib/aysncStorage';
import { useMoodLogStore } from '@/store/useMoodLogStore';
import { useJournalEntryStore } from '@/store/useJournalEntryStore';

export default function HomeTabsLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const turnOffOnboarding = async () => {
    setShowOnboarding(false);
    await saveAsyncItem(AsyncItemKey.OnboardingComplete, 'true');
  };

  useEffect(() => {
    const checkFirstTime = async () => {
      const onboarded = await getAsyncItem(AsyncItemKey.OnboardingComplete);
      setShowOnboarding(!onboarded); // show onboarding if not complete
      setIsLoading(false);
    };

    checkFirstTime();
  }, []);

  if (isLoading) return null; // or splash screen

  return showOnboarding ? (
    <OnboardingScreen onFinish={turnOffOnboarding} />
  ) : (
    <HomeNavigator />
  );
}

function HomeNavigator() {
  // init data
  const { refresh: refreshJournalEntries } = useJournalEntryStore();
  const { refresh: refreshMoodLogs } = useMoodLogStore();

  useEffect(() => {
    refreshMoodLogs();
    refreshJournalEntries();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
          sceneStyle: {
            backgroundColor: '#F2F2F2',
          },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'explore',
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass" size={28} color={color} />
          ),
          sceneStyle: {
            backgroundColor: '#F2F2F2',
          },
        }}
      />
      <Tabs.Screen
        name="moodReview"
        options={{
          title: 'Mood',
          tabBarIcon: ({ color }) => (
            <Ionicons name="journal" size={28} color={color} />
          ),
          sceneStyle: {
            backgroundColor: '#F2F2F2',
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
          sceneStyle: {
            backgroundColor: '#F2F2F2',
          },
        }}
      />
    </Tabs>
  );
}
