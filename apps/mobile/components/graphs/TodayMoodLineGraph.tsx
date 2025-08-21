import { Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useEffect, useState } from 'react';
import { useMoodLogStore } from '@/store/useMoodLogStore';
import Colors from '@/constants/Colors';
import { useExploreMoodStore } from '@/store/useExploreMoodStore';

const TodayMoodLineChart = () => {
  const [chartWidth, setChartWidth] = useState(0);
  const { items: moodLogs } = useMoodLogStore();
  const { getDatasetToday, getLabelsToday, computeTodayLogs } =
    useExploreMoodStore();

  useEffect(() => {
    computeTodayLogs(moodLogs);
  }, [moodLogs]);

  return (
    <View
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setChartWidth(width);
      }}
    >
      <Text className="text-lg font-semibold mb-2">Mood Trends Today</Text>
      {chartWidth > 0 && (
        <LineChart
          data={{
            labels: getLabelsToday(),
            datasets: [{ data: getDatasetToday() }],
          }}
          width={chartWidth}
          height={220}
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: Colors.app.ripple[300],
            backgroundGradientFrom: Colors.app.ripple[400],
            backgroundGradientTo: Colors.app.ripple[100],
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
            labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
            style: { borderRadius: 8 },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: Colors.app.ripple[400],
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 5,
          }}
          segments={4}
          formatYLabel={(val) => `${Math.round(Number(val))}`}
        />
      )}
    </View>
  );
};

export default TodayMoodLineChart;
