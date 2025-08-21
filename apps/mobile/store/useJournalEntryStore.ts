import { createPaginatedStore } from '@/store/createPaginatedStore';
import { JournalEntryDTO } from '@beacon/types';
import {
  getJournalEntriesRequest,
  getJournalEntryDetailRequest,
} from '@/api/moodLoggerApi';

export const useJournalEntryStore = createPaginatedStore<JournalEntryDTO>(
  getJournalEntriesRequest,
  getJournalEntryDetailRequest,
  10,
);
