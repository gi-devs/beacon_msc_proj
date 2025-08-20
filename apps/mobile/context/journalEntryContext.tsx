import { JournalEntryDTO } from '@beacon/types';
import { createPaginatedContext } from '@/context/createPaginatedContext';
import { getJournalEntriesRequest } from '@/api/moodLoggerApi';

export const {
  Provider: JournalEntryProvider,
  usePaginated: useJournalEntries,
} = createPaginatedContext<JournalEntryDTO>(getJournalEntriesRequest, 10);
