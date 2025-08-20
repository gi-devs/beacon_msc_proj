import { JournalEntryDTO } from '@beacon/types';
import { createPaginatedContext } from '@/context/createPaginatedContext';
import {
  getJournalEntriesRequest,
  getJournalEntryDetailRequest,
} from '@/api/moodLoggerApi';

export const {
  Provider: JournalEntryProvider,
  usePaginated: useJournalEntries,
} = createPaginatedContext<JournalEntryDTO>(
  getJournalEntriesRequest,
  getJournalEntryDetailRequest,
  10,
);
