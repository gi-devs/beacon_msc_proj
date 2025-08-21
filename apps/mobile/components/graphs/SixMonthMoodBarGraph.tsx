import { Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { BarChart } from 'react-native-chart-kit';
import { useExploreMoodStore } from '@/store/useExploreMoodStore';
import { useMoodLogStore } from '@/store/useMoodLogStore';

const SixMonthMoodBarGraph = () => {
  const [chartWidth, setChartWidth] = useState(0);
  const { items: moodLogs } = useMoodLogStore();
  const { monthlyData, fetchMonthlyAverages } = useExploreMoodStore();

  useEffect(() => {
    void fetchMonthlyAverages(6);
  }, [fetchMonthlyAverages, moodLogs]);

  const labels = monthlyData.map((m) => m.month);
  const dataset = monthlyData.map((m) => m.averageScore);

  return (
    <View
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setChartWidth(width);
      }}
      className="my-4"
    >
      <Text className="text-lg font-semibold mb-2">
        Average Negative Moods (Last 6 Months)
      </Text>

      <BarChart
        data={{
          labels,
          datasets: [{ data: dataset }],
        }}
        width={chartWidth}
        height={250}
        fromZero
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: '#1e293b',
          backgroundGradientFrom: '#1e293b',
          backgroundGradientTo: '#334155',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          barPercentage: 0.6,
        }}
        style={{
          borderRadius: 5,
          marginVertical: 8,
        }}
      />
    </View>
  );
};

export default SixMonthMoodBarGraph;
