import { MoodLogWithBeaconCheck } from '@beacon/types';
import { createPaginatedContext } from '@/context/createPaginatedContext';
import {
  getMoodLogDetailRequest,
  getMoodLogsRequest,
} from '@/api/moodLoggerApi';

export type MoodLogWithBeaconCheckExtended = MoodLogWithBeaconCheck & {
  journalEntryId?: number | null;
};

export const { Provider: MoodLogProvider, usePaginated: useMoodLogs } =
  createPaginatedContext<MoodLogWithBeaconCheckExtended>(
    getMoodLogsRequest,
    getMoodLogDetailRequest,
    10,
  );
