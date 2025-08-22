import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
  Pressable,
  Vibration,
  Animated as RNAnimated,
} from 'react-native';
import { useEffect, useState } from 'react';
import { SafeWrapper } from '@/components/utils/SafeWrapper';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import UIButton from '@/components/ui/UIButton';
import { usePressScaleAnimation } from '@/hooks/ui/usePressScaleAnimation';
import { useRouter } from 'expo-router';
import JournalEntryDisplayCard from '@/components/JournalEntryDisplayCard';
import MoodLogDisplayCard from '@/components/MoodLogDisplayCard';
import { useMoodLogStore } from '@/store/useMoodLogStore';
import { useJournalEntryStore } from '@/store/useJournalEntryStore';
import HeaderWithRouteUI from '@/components/ui/HeaderWithRouteUI';
import { AppStyles } from '@/constants/AppStyles';

const MoodReview = () => {
  const [isMoodList, setIsMoodList] = useState(true);

  return (
    <SafeWrapper className="flex-1">
      <HeaderWithRouteUI header="Mood Review" />
      {isMoodList ? <MoodList /> : <JournalList />}
      <ListPicker isMoodList={isMoodList} setIsMoodList={setIsMoodList} />
    </SafeWrapper>
  );
};

const JournalList = () => {
  const {
    items: journalEntries,
    fetchMore: fetchMore,
    refresh,
    loading,
    hasMore,
  } = useJournalEntryStore();
  const { animatedStyle, handleVibration, handlePressOut, handlePressIn } =
    usePressScaleAnimation();
  const router = useRouter();
  return (
    <>
      {journalEntries.length > 0 ? (
        <FlatList
          data={journalEntries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <JournalEntryDisplayCard journalEntry={item} />
          )}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
          ListHeaderComponent={
            <View className="flex-row justify-between  items-center my-8 mb-6">
              <Text className="text-2xl">Journal Entries</Text>
              <RNAnimated.View
                className="p-2 rounded-full shadow-md"
                style={[
                  animatedStyle,
                  {
                    backgroundColor: Colors.app.ripple['400'],
                  },
                ]}
              >
                <Pressable
                  onTouchStart={handlePressIn}
                  onTouchEnd={handlePressOut}
                  onPress={() => {
                    handleVibration();
                    router.push('/(mood-logging)/journal');
                  }}
                >
                  <Feather name="plus" size={24} color="white" />
                </Pressable>
              </RNAnimated.View>
            </View>
          }
          ListFooterComponent={
            <View className="mb-20">
              {loading && (
                <ActivityIndicator className="my-4" size="small" color="#000" />
              )}
              {!loading && hasMore && (
                <UIButton
                  variant="ghost"
                  size="sm"
                  onPress={fetchMore}
                  buttonClassName="mt-2"
                  textClassName="text-gray-600"
                >
                  Load More
                </UIButton>
              )}
            </View>
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No journals yet!</Text>
        </View>
      )}
    </>
  );
};

const MoodList = () => {
  const {
    items: moodLogs,
    fetchMore: fetchMore,
    refresh,
    loading,
    hasMore,
  } = useMoodLogStore();
  return (
    <>
      {moodLogs.length > 0 ? (
        <FlatList
          data={moodLogs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            return <MoodLogDisplayCard moodLogEntry={item} />;
          }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
          ListHeaderComponent={
            <Text className="text-2xl my-8 mb-6">Mood Logs</Text>
          }
          ListFooterComponent={
            <View className="mb-20">
              {loading && (
                <ActivityIndicator className="my-4" size="small" color="#000" />
              )}
              {!loading && hasMore && (
                <UIButton
                  variant="ghost"
                  size="sm"
                  onPress={fetchMore}
                  buttonClassName="mt-2"
                  textClassName="text-gray-600"
                >
                  Load More
                </UIButton>
              )}
            </View>
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No mood logs yet!</Text>
        </View>
      )}
    </>
  );
};

const ListPicker = ({
  isMoodList,
  setIsMoodList,
}: {
  isMoodList: boolean;
  setIsMoodList: (value: boolean) => void;
}) => {
  const translateX = useSharedValue(isMoodList ? 0 : 1);

  // Animate on prop change
  useEffect(() => {
    translateX.value = withTiming(isMoodList ? 0 : 1, { duration: 250 });
  }, [isMoodList]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value * 150, // adjust width
      },
    ],
  }));

  return (
    <View
      style={[
        AppStyles.navShadow,
        {
          borderColor: 'white',
          borderWidth: 4,
        },
      ]}
      className="mt-4 w-[300px] rounded-full bg-white flex-row absolute mb-4 bottom-0 self-center"
    >
      {/* Animated background pill */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            height: '100%',
            width: '50%',
            backgroundColor: Colors.app.secondary,
            borderRadius: 9999,
          },
          pillStyle,
        ]}
      />

      {/* Mood button */}
      <Pressable
        className="flex-1 items-center justify-center py-3"
        onPress={() => {
          Vibration.vibrate(10);
          setIsMoodList(true);
        }}
      >
        <Text
          style={{
            color: !isMoodList ? 'black' : 'white',
            fontWeight: 600,
            textAlign: 'center',
            width: '100%',
          }}
        >
          Mood
        </Text>
      </Pressable>

      {/* Journal button */}
      <Pressable
        className="flex-1 items-center justify-center py-3"
        onPress={() => {
          Vibration.vibrate(10);
          setIsMoodList(false);
        }}
      >
        <Text
          style={{
            color: isMoodList ? 'black' : 'white',
            fontWeight: 600,
            textAlign: 'center',
            width: '100%',
          }}
        >
          Journal
        </Text>
      </Pressable>
    </View>
  );
};

export default MoodReview;
