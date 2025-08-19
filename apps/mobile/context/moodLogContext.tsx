import { MoodLogWithBeaconCheck } from '@beacon/types';
import { createPaginatedContext } from '@/context/createPaginatedContext';
import { getMoodLogsRequest } from '@/api/moodLoggerApi';

export const { Provider: MoodLogProvider, usePaginated: useMoodLogs } =
  createPaginatedContext<MoodLogWithBeaconCheck>(getMoodLogsRequest, 10);
