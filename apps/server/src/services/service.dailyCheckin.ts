import { createMoodLog, updateMoodLog } from '@/models/model.moodLog';
import { createJournalEntry } from '@/models/model.journalEntry';
import {
  createDailyCheckIn,
  getDailyCheckInByUserIdAndDate,
} from '@/models/model.dailyCheckIn';
import prisma from '@/lib/prisma';
import { CreateDailyLogData, createDailyLogSchema } from '@beacon/validation';
import { normaliseDate } from '@/utils/dates';
import { CustomError } from '@/utils/custom-error';
import { handleZodError } from '@/utils/handle-zod-error';
import { createBeacon } from '@/models/model.beacon';
import { JournalEntryTags } from '@beacon/types';

async function create(data: CreateDailyLogData, userId: string) {
  let parsedData;

  // if data.journalEntry is {} then remove from data

  if (data.journalEntry) {
    const isEmptyJournalEntry = Object.keys(data.journalEntry).length === 0;
    const noDataInJournalEntry =
      data.journalEntry?.title === '' || data.journalEntry?.content === '';

    if (isEmptyJournalEntry || noDataInJournalEntry) {
      data.journalEntry = null;
    } else {
      data.journalEntry.moodFace = Math.round(data.journalEntry.moodFace);
    }
  }

  try {
    parsedData = createDailyLogSchema.parse(data);
  } catch (e) {
    handleZodError(e);
  }

  const { moodLog, journalEntry, shouldBroadcast = false } = parsedData;

  const existingLogToday = await getDailyCheckInByUserIdAndDate(
    userId,
    normaliseDate(new Date()),
  );

  if (existingLogToday) {
    throw new CustomError('You have already logged your mood for today.', 409);
  }

  return prisma.$transaction(async (tx) => {
    let mood = await createMoodLog(
      {
        ...moodLog,
        user: {
          connect: { id: userId },
        },
      },
      tx,
    );

    let journal;
    if (journalEntry) {
      if (journalEntry.tags.length > 0) {
        journalEntry.tags = journalEntry.tags.filter(
          (tag): tag is JournalEntryTags => {
            return tag.category.trim().length > 0 && tag.keywords.length > 0;
          },
        );
      }

      journal = await createJournalEntry(
        {
          ...journalEntry,
          user: {
            connect: { id: userId },
          },
          moodLog: {
            connect: { id: mood.id },
          },
        },
        tx,
      );

      // update mood log with journal ID
      mood = await updateMoodLog(
        mood.id,
        {
          journalEntryId: journal.id,
        },
        tx,
      );
    }

    // TODO: Implement broadcasting logic
    // if (broadcast) {
    //   await triggerBroadcast(mood); // Fire-and-forget or queue it
    // }
    const dailyLog = await createDailyCheckIn(
      {
        userId,
        moodLogId: mood.id,
        broadcasted: shouldBroadcast,
      },
      tx,
    );

    if (dailyLog.broadcasted) {
      let expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 4);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      if (expiresAt > endOfDay) {
        expiresAt = endOfDay;
      }

      await createBeacon(
        {
          expiresAt,
          user: {
            connect: { id: userId },
          },
          dailyCheckIn: {
            connect: {
              userId_date: {
                userId,
                date: dailyLog.date, // must be EXACT same value from createDailyCheckIn
              },
            },
          },
        },
        tx,
      );
    }

    if (journal) {
      return { mood, journal, dailyLog };
    }

    return { mood, dailyLog };
  });
}

export const dailyLogService = {
  create,
};
