import {
  createJournalEntry,
  getJournalEntriesByUserId,
  getJournalEntriesByUserIdCount,
} from '@/models/model.journalEntry';
import {
  CreateJournalEntryData,
  createJournalEntrySchema,
} from '@beacon/validation';
import { handleZodError } from '@/utils/handle-zod-error';
import {
  JournalEntryDTO,
  JournalEntryTags,
  PaginatedResponse,
} from '@beacon/types';

async function create(
  data: CreateJournalEntryData,
  userId: string,
): Promise<JournalEntryDTO> {
  let parsedData;

  try {
    parsedData = createJournalEntrySchema.parse(data);
  } catch (e) {
    handleZodError(e);
  }

  const { title, content, moodFace, tags } = parsedData;

  let mappedTags: JournalEntryTags[] = [];

  if (tags.length > 0) {
    mappedTags = tags.filter((tag): tag is JournalEntryTags => {
      return tag.category.trim().length > 0 && tag.keywords.length > 0;
    });
  }

  const entry = await createJournalEntry({
    title,
    content,
    moodFace,
    tags: mappedTags,
    user: {
      connect: { id: userId },
    },
  });

  return {
    id: entry.id,
    title: entry.title,
    content: entry.content,
    moodFace: entry.moodFace,
    tags: entry.tags as JournalEntryTags[] | undefined,
    createdAt: entry.createdAt,
  };
}

export async function fetchJournalEntriesByUserId(
  userId: string,
  take: number,
  skip: number,
): Promise<PaginatedResponse<JournalEntryDTO>> {
  const entries = await getJournalEntriesByUserId(userId, undefined, {
    skip,
    take,
    order: { createdAt: 'desc' },
  });
  const entriesCount = await getJournalEntriesByUserIdCount(userId);

  const sanitisedEntries = entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    content: entry.content,
    moodFace: entry.moodFace,
    tags: entry.tags as JournalEntryTags[] | undefined,
    createdAt: entry.createdAt,
  }));

  return {
    items: sanitisedEntries,
    totalCount: entriesCount,
    page: Math.floor(skip / take) + 1,
    totalPages: Math.ceil(entriesCount / take),
    hasMore: entriesCount > skip + take,
  };
}

export const journalEntryService = {
  create,
  fetchJournalEntriesByUserId,
};
