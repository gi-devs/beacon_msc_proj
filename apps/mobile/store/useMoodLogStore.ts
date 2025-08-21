import { createPaginatedStore } from './createPaginatedStore';
import {
  getMoodLogsRequest,
  getMoodLogDetailRequest,
} from '@/api/moodLoggerApi';
import { MoodLogWithBeaconCheck } from '@beacon/types';

export type MoodLogWithBeaconCheckExtended = MoodLogWithBeaconCheck & {
  journalEntryId?: number | null;
};

export const useMoodLogStore =
  createPaginatedStore<MoodLogWithBeaconCheckExtended>(
    getMoodLogsRequest,
    getMoodLogDetailRequest,
    10,
  );
