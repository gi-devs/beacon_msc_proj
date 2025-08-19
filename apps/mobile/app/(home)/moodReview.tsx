import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
  Button,
  Pressable,
  Vibration,
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MoodLogWithBeaconCheck } from '@beacon/types';
import UIButton from '@/components/ui/UIButton';

const MoodReview = () => {
  const {
    items: moodLogs,
    fetchMore,
    refresh,
    loading,
    hasMore,
  } = useMoodLogs();
  const [isMoodList, setIsMoodList] = useState(true);

  // Auto fetch first page
  useEffect(() => {
    refresh();
  }, []);

  return (
    <SafeWrapper className="flex-1">
      {isMoodList ? (
        <MoodList
          moodLogs={moodLogs}
          fetchMore={fetchMore}
          refresh={refresh}
          loading={loading}
          hasMore={hasMore}
        />
      ) : (
        <JournalList />
      )}
      {/*<Link href="/(mood-logging)/journal">*/}
      {/*  <Text style={{ color: 'blue' }}>Go to Journal Entry</Text>*/}
      {/*</Link>*/}
      <ListPicker isMoodList={isMoodList} setIsMoodList={setIsMoodList} />
    </SafeWrapper>
  );
};

const JournalList = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl">Journal Entries</Text>
      <Text className="text-gray-500 mt-4">
        This feature is coming soon! Stay tuned.
      </Text>
    </View>
  );
};

const MoodList = ({
  moodLogs,
  fetchMore,
  refresh,
  loading,
  hasMore,
}: {
  moodLogs: MoodLogWithBeaconCheck[];
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
  loading: boolean;
  hasMore: boolean;
}) => {
  return (
    <>
      <Text className="text-2xl my-8 mb-6">Mood Logs</Text>
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
