import { createJournalEntry } from '@/models/model.journalEntry';
import {
  CreateJournalEntryData,
  createJournalEntrySchema,
} from '@beacon/validation';
import { CustomError } from '@/utils/custom-error';
import { z } from 'zod';

async function create(
  data: CreateJournalEntryData,
  userId: string,
): Promise<JournalEntryDTO> {
  let parsedData;

  try {
    parsedData = createJournalEntrySchema.parse(data);
  } catch (e) {
    if (e instanceof z.ZodError) {
      const customIssue = e.issues.find((i) => i.code === 'custom');
      const issueToShow = customIssue ?? e.issues[0];

      let message = issueToShow.message;

      // Customise invalid_type messages
      if (issueToShow.code === 'invalid_type' && issueToShow.path.length > 0) {
        const fieldName = String(issueToShow.path.at(-1)); // last element in path
        message = `${fieldName} must be a ${issueToShow.expected}`;
      }

      throw new CustomError(message, 400);
    }
    throw e;
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
