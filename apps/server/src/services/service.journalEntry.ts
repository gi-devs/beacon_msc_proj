import { createJournalEntry } from '@/models/model.journalEntry';
import {
  CreateJournalEntryData,
  createJournalEntrySchema,
} from '@beacon/validation';
import { handleZodError } from '@/utils/handle-zod-error';
import { JournalEntryDTO, JournalEntryTags } from '@beacon/types';

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

export const journalEntryService = {
  create,
};
