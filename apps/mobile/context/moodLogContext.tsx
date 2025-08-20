import { MoodLogWithBeaconCheck } from '@beacon/types';
import { createPaginatedContext } from '@/context/createPaginatedContext';
import {
  getMoodLogDetailRequest,
  getMoodLogsRequest,
} from '@/api/moodLoggerApi';

export const { Provider: MoodLogProvider, usePaginated: useMoodLogs } =
  createPaginatedContext<MoodLogWithBeaconCheck>(
    getMoodLogsRequest,
    getMoodLogDetailRequest,
    10,
  );
