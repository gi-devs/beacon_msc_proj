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
import { useMoodLogs } from '@/context/moodLogContext';
import { useEffect, useState } from 'react';
import {
  formateTo24HourTime,
  formatShortDate,
  getDayOfWeek,
} from '@/utils/dateFormatter';
import { SafeWrapper } from '@/components/utils/SafeWrapper';
import { analyseMoodScales } from '@/utils/analyseMoodScore';
import { getMoodColor } from '@/utils/computeColour';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MoodLogWithBeaconCheck } from '@beacon/types';
import UIButton from '@/components/ui/UIButton';
import { useJournalEntries } from '@/context/journalEntryContext';
import { truncateText } from '@/utils/truncatedText';
import { usePressScaleAnimation } from '@/hooks/usePressScaleAnimation';
import { useRouter } from 'expo-router';
import { AppStyles } from '@/constants/AppStyles';

const MoodReview = () => {
  const [isMoodList, setIsMoodList] = useState(true);

  return (
    <SafeWrapper className="flex-1">
      {isMoodList ? <MoodList /> : <JournalList />}
      {/*<Link href="/(mood-logging)/journal">*/}
      {/*  <Text style={{ color: 'blue' }}>Go to Journal Entry</Text>*/}
      {/*</Link>*/}
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
  } = useJournalEntries();
  const { animatedStyle, handleVibration, handlePressOut, handlePressIn } =
    usePressScaleAnimation();
  const router = useRouter();
  return (
    <>
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
      {journalEntries.length > 0 ? (
        <FlatList
          data={journalEntries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="p-4 mb-4 border-gray-200 bg-white">
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row">
                  <Text className="text-gray-600">
                    {getDayOfWeek(item.createdAt)} -{' '}
                  </Text>
                  <Text className="text-gray-600">
                    {formatShortDate(item.createdAt, true)}
                  </Text>
                </View>
                <Text className="text-gray-600">
                  {formateTo24HourTime(item.createdAt)}
                </Text>
              </View>
              <View className="flex-col gap-1">
                <Text className="text-xl font-semibold">{item.title}</Text>
                <Text className="leading-normal font-light">
                  {truncateText(item.content, 120)}
                </Text>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
          ListFooterComponent={
            <>
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
            </>
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
  } = useMoodLogs();
  return (
    <>
      <Text className="text-2xl my-8 mb-6">Mood Logs</Text>
      {moodLogs.length > 0 ? (
        <FlatList
          data={moodLogs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const { score } = analyseMoodScales(item);
            return (
              <View className="p-4 mb-2 border-gray-200 relative bg-white">
                <View
                  style={{
                    backgroundColor: getMoodColor(score),
                  }}
                  className="w-1 absolute left-0 top-2 bottom-2"
                />
                <View className="flex-row justify-between items-center">
                  <View className="flex-col gap-2 items-start">
                    <Text className="text-gray-600">
                      {getDayOfWeek(item.createdAt)}{' '}
                    </Text>
                    <Text className="text-gray-600">
                      {formatShortDate(item.createdAt)}
                    </Text>
                  </View>
                  <View className="flex-col gap-2 items-end">
                    <Text className="font-semibold">
                      {formateTo24HourTime(item.createdAt)}
                    </Text>
                    <View className="flex-row gap-1">
                      {item.beaconBroadcasted && (
                        <MaterialCommunityIcons
                          name="broadcast"
                          size={20}
                          color={Colors.app.ripple['100']}
                        />
                      )}
                      {item.isDailyCheckIn && (
                        <MaterialCommunityIcons
                          name="calendar-today"
                          size={20}
                          color="black"
                        />
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
          ListFooterComponent={
            <>
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
            </>
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
    <View className="mt-4 w-[300px] mx-auto rounded-full bg-white flex-row relative overflow-hidden border-4 border-white">
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
