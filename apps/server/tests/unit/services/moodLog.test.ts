import { moodLogService } from '../../../src/services/service.moodLog';
import {
  createMoodLog,
  getMoodLogById,
  getMoodLogByJournalEntryId,
  getUserMoodLogCount,
  getUserMoodLogs,
  getUserMoodLogsAverageByMonth,
  getUserMoodLogsDateFilter,
} from '../../../src/models/model.moodLog';
import { getDailyCheckInsByMoodLogId } from '../../../src/models/model.dailyCheckIn';

jest.mock('@/models/model.moodLog');
jest.mock('@/models/model.dailyCheckIn');

describe('moodLogService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw if mood scales are invalid', async () => {
      const invalidData = {
        stressScale: -1,
        anxietyScale: 50,
        sadnessScale: 150,
      };
      await expect(
        moodLogService.create(invalidData as any, 'u1'),
      ).rejects.toThrow(
        'Mood scale values must be integers between 1 and 100.',
      );
    });

    it('should round scales and create mood log', async () => {
      (createMoodLog as jest.Mock).mockResolvedValue({
        id: 'm1',
        stressScale: 50.4,
        anxietyScale: 50.6,
        sadnessScale: 40.1,
        userId: 'u1',
      });

      const result = await moodLogService.create(
        { stressScale: 50.4, anxietyScale: 50.6, sadnessScale: 40.1 },
        'u1',
      );

      expect(createMoodLog).toHaveBeenCalledWith(
        expect.objectContaining({
          stressScale: 50,
          anxietyScale: 51,
          sadnessScale: 40,
          user: { connect: { id: 'u1' } },
        }),
      );
      expect(result).toHaveProperty('id', 'm1');
      expect(result).not.toHaveProperty('userId'); // no userId in response
    });
  });

  describe('getMoodLogsByUserId', () => {
    it('should return mood logs with beacon check', async () => {
      (getUserMoodLogs as jest.Mock).mockResolvedValue([{ id: 1 }]);
      (getUserMoodLogCount as jest.Mock).mockResolvedValue(1);
      (getDailyCheckInsByMoodLogId as jest.Mock).mockResolvedValue([
        { moodLogId: 1, broadcasted: true },
      ]);

      const result = await moodLogService.getMoodLogsByUserId('u1', 10, 0);

      expect(result.items[0]).toMatchObject({
        id: 1,
        beaconBroadcasted: true,
        isDailyCheckIn: true,
      });
      expect(result.totalCount).toBe(1);
    });
  });

  describe('fetchMoodLogDetail', () => {
    it('should throw if mood log not found', async () => {
      (getMoodLogById as jest.Mock).mockResolvedValue(null);
      await expect(moodLogService.fetchMoodLogDetail(1)).rejects.toThrow(
        'Mood log not found',
      );
    });

    it('should return mood log with beacon flags', async () => {
      (getMoodLogById as jest.Mock).mockResolvedValue({ id: 1 });
      (getDailyCheckInsByMoodLogId as jest.Mock).mockResolvedValue([
        { moodLogId: 1, broadcasted: false },
      ]);

      const result = await moodLogService.fetchMoodLogDetail(1);

      // expect to have beaconBroadcasted and isDailyCheckIn properties
      expect(result).toMatchObject({
        id: 1,
        beaconBroadcasted: false,
        isDailyCheckIn: true,
      });
    });
  });

  describe('fetchMoodLogByJournalEntryId', () => {
    it('should return null if not found', async () => {
      (getMoodLogByJournalEntryId as jest.Mock).mockResolvedValue(null);
      const result = await moodLogService.fetchMoodLogByJournalEntryId(1);
      expect(result).toBeNull();
    });

    it('should return mood log without userId', async () => {
      (getMoodLogByJournalEntryId as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 'u1',
        stressScale: 2,
      });

      const result = await moodLogService.fetchMoodLogByJournalEntryId(1);

      // should not have userId property
      expect(result).toHaveProperty('id', 1);
      expect(result).not.toHaveProperty('userId');
    });
  });

  describe('fetchMoodLogAverage', () => {
    it('should throw if params are not numbers', async () => {
      await expect(
        moodLogService.fetchMoodLogAverage('u1', 'abc', '1', '0'),
      ).rejects.toThrow('Months, weeks, and days must be valid integers');
    });

    it('should throw if params are negative', async () => {
      await expect(
        moodLogService.fetchMoodLogAverage('u1', '-1'),
      ).rejects.toThrow(
        'Months, weeks, and days must be non-negative integers',
      );
    });

    it('should return mood logs with averages', async () => {
      (getUserMoodLogsDateFilter as jest.Mock).mockResolvedValue([
        {
          id: 1,
          createdAt: new Date(),
          stressScale: 2,
          anxietyScale: 4,
          sadnessScale: 6,
        },
      ]);

      const result = await moodLogService.fetchMoodLogAverage('u1', '1');

      expect(result[0]).toHaveProperty('averageScale', 4);
    });
  });

  describe('fetchMoodLogAverageMonths', () => {
    it('should throw if months is invalid', async () => {
      await expect(
        moodLogService.fetchMoodLogAverageMonths('u1', 'abc'),
      ).rejects.toThrow('Months must be a positive integer');
    });

    it('should aggregate averages correctly', async () => {
      (getUserMoodLogsAverageByMonth as jest.Mock).mockResolvedValue([
        { month: '2025-01', averageScore: 3.5, totalLogs: 2 },
        { month: '2025-01', averageScore: 4.5, totalLogs: 2 },
      ]);

      const result = await moodLogService.fetchMoodLogAverageMonths('u1', '1');

      expect(result).toHaveLength(2);
    });
  });
});
