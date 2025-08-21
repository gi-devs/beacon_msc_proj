import { create } from 'zustand';
import { MoodLogDTO, MoodLogsAverageByMonth } from '@beacon/types';
import { getMoodLogAverageByMonthsRequest } from '@/api/moodLoggerApi';
import { analyseMoodScales } from '@/utils/analyseMoodScore';
import { formateTo24HourTime } from '@/utils/dateFormatter';

interface ExploreMoodState {
  todayLogs: MoodLogDTO[];
  getDatasetToday: () => number[];
  getLabelsToday: () => string[];

  monthlyData: MoodLogsAverageByMonth[];
  isLoading: boolean;
  error: string | null;

  computeTodayLogs: (logs: MoodLogDTO[]) => void;
  fetchMonthlyAverages: (months: number) => Promise<void>;
}

export const useExploreMoodStore = create<ExploreMoodState>((set, get) => ({
  todayLogs: [],
  monthlyData: [],
  isLoading: false,
  error: null,

  getDatasetToday: () => {
    const logs = get().todayLogs;
    return logs.length > 0
      ? logs.map((log) => analyseMoodScales(log).score)
      : [0];
  },

  getLabelsToday: () => {
    const logs = get().todayLogs;
    return logs.length > 0
      ? logs.map((log) => formateTo24HourTime(log.createdAt))
      : ['No data yet'];
  },

  computeTodayLogs: (logs: MoodLogDTO[]) => {
    const today = new Date();
    const todayLogs = logs
      .filter((log) => {
        const logDate = new Date(log.createdAt);
        return (
          logDate.getDate() === today.getDate() &&
          logDate.getMonth() === today.getMonth() &&
          logDate.getFullYear() === today.getFullYear()
        );
      })
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .slice(-6);

    set({ todayLogs });
  },

  fetchMonthlyAverages: async (months: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getMoodLogAverageByMonthsRequest(months);
      const now = new Date();

      const sixMonth: MoodLogsAverageByMonth[] = Array.from({
        length: months,
      }).map((_, i) => {
        const d = new Date(
          now.getFullYear(),
          now.getMonth() - (months - 1 - i),
          1,
        );
        const month = d.toLocaleString('default', { month: 'short' });
        const found = data.find((log) => log.month === month);

        return {
          month,
          averageScore: found?.averageScore ?? 0,
          totalLogs: found?.totalLogs ?? 0,
        };
      });

      set({ monthlyData: sixMonth, isLoading: false });
    } catch (err) {
      console.error('Error fetching monthly averages:', err);
      set({
        monthlyData: [],
        isLoading: false,
        error: 'Failed to fetch monthly averages',
      });
    }
  },
}));
