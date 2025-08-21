import { createPaginatedStore } from '@/store/createPaginatedStore';
import { JournalEntryDTO } from '@beacon/types';
import {
  getJournalEntriesRequest,
  getJournalEntryDetailRequest,
} from '@/api/moodLoggerApi';

export type JournalEntryDTOExtended = JournalEntryDTO & {
  moodLogId?: number;
};

export const useJournalEntryStore =
  createPaginatedStore<JournalEntryDTOExtended>(
    getJournalEntriesRequest,
    getJournalEntryDetailRequest,
    10,
  );
