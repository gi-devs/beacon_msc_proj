import { Text, View } from 'react-native';
import { formateTo24HourTime, getFullDateString } from '@/utils/dateFormatter';

const DateTimeDisplay = ({ date }: { date: Date }) => {
  return (
    <View className="flex-row justify-between w-full">
      <Text className="text-2xl font-semibold mb-4 mt-4">
        {getFullDateString(date)}
      </Text>
      <Text className="text-lg font-semibold mb-4 mt-4">
        {formateTo24HourTime(date)}{' '}
      </Text>
    </View>
  );
};

export default DateTimeDisplay;
