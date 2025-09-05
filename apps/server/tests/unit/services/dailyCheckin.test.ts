import {
  createMoodLog,
  updateMoodLog,
} from '../../../src/models/model.moodLog';
import { createJournalEntry } from '../../../src/models/model.journalEntry';
import {
  createDailyCheckIn,
  getDailyCheckInByUserIdAndDate,
} from '../../../src/models/model.dailyCheckIn';
import { createBeacon } from '../../../src/models/model.beacon';
import { CustomError } from '../../../src/utils/custom-error';
import { dailyLogService } from '../../../src/services/service.dailyCheckin';
import prisma from '../../../src/lib/prisma';

jest.mock('@/models/model.moodLog');
jest.mock('@/models/model.journalEntry');
jest.mock('@/models/model.dailyCheckIn');
jest.mock('@/models/model.beacon');
jest.mock('@/lib/prisma', () => ({
  $transaction: jest.fn((cb) => cb({})),
}));

describe('dailyLogService.create', () => {
  const validMoodLog = {
    stressScale: 2,
    anxietyScale: 3,
    sadnessScale: 4,
  };

  const validData = {
    moodLog: validMoodLog,
    shouldBroadcast: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set journalEntry to null if empty object', async () => {
    (getDailyCheckInByUserIdAndDate as jest.Mock).mockResolvedValue(null);
    (createMoodLog as jest.Mock).mockResolvedValue({ id: 'm1' });
    (createDailyCheckIn as jest.Mock).mockResolvedValue({
      id: 'd1',
      date: new Date(),
      broadcasted: false,
    });
    (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb({}));

    const result = await dailyLogService.create(
      {
        moodLog: validMoodLog,
        shouldBroadcast: false,
        journalEntry: {},
      } as any,
      'u1',
    );

    expect(createJournalEntry).not.toHaveBeenCalled();
    expect(result).toHaveProperty('mood');
    expect(result).toHaveProperty('dailyLog');
  });

  it('should throw CustomError if data is invalid', async () => {
    const invalidData: any = {
      // Missing moodLog
    };
    await expect(dailyLogService.create(invalidData, 'u1')).rejects.toThrow(
      CustomError,
    );
  });

  it('should throw if user already logged today', async () => {
    // mock current time to 23:00
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T23:00:00Z'));
    (getDailyCheckInByUserIdAndDate as jest.Mock).mockResolvedValue(null);
    (createMoodLog as jest.Mock).mockResolvedValue({ id: 'm1' });
    (createDailyCheckIn as jest.Mock).mockResolvedValue({
      id: 'd1',
      date: new Date(),
      broadcasted: true,
    });
    (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
      return cb({});
    });

    await dailyLogService.create(validData, 'u1');
    // expect createBeacon to be called with expiresAt of 23:59
    const expectedExpiry = new Date();
    expectedExpiry.setHours(23, 59, 59, 999);
    expect(createBeacon).toHaveBeenCalledWith(
      expect.objectContaining({
        user: { connect: { id: 'u1' } },
        expiresAt: expectedExpiry,
      }),
      expect.anything(),
    );
  });

  it('should create mood log and daily check-in without journal entry', async () => {
    (getDailyCheckInByUserIdAndDate as jest.Mock).mockResolvedValue(null);
    (createMoodLog as jest.Mock).mockResolvedValue({ id: 'm1' });
    (createDailyCheckIn as jest.Mock).mockResolvedValue({
      id: 'd1',
      date: new Date(),
      broadcasted: false,
    });
    (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
      return cb({});
    });

    const result = await dailyLogService.create(validData, 'u1');

    expect(createMoodLog).toHaveBeenCalled();

    expect(createMoodLog).toHaveBeenCalledWith(
      expect.objectContaining({
        stressScale: 2,
        anxietyScale: 3,
        sadnessScale: 4,
        user: { connect: { id: 'u1' } },
      }),
      expect.anything(),
    );
    expect(createDailyCheckIn).toHaveBeenCalled();
    expect(result).toHaveProperty('mood');
    expect(result).toHaveProperty('dailyLog');
  });

  it('should create mood log, journal entry, and daily check-in when journal provided', async () => {
    (getDailyCheckInByUserIdAndDate as jest.Mock).mockResolvedValue(null);
    (createMoodLog as jest.Mock).mockResolvedValue({ id: 'm1' });
    (createJournalEntry as jest.Mock).mockResolvedValue({ id: 'j1' });
    (updateMoodLog as jest.Mock).mockResolvedValue({ id: 'm1' });
    (createDailyCheckIn as jest.Mock).mockResolvedValue({
      id: 'd1',
      date: new Date(),
      broadcasted: false,
    });
    (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
      return cb({});
    });

    const result = await dailyLogService.create(
      {
        moodLog: validMoodLog,
        shouldBroadcast: false,
        journalEntry: {
          title: 'Test entry',
          content: 'Feeling ok',
          moodFace: 3.7, // will be rounded in service
          tags: [{ category: 'mood', keywords: ['ok'] }],
        },
      },
      'u1',
    );

    expect(createJournalEntry).toHaveBeenCalled();
    expect(updateMoodLog).toHaveBeenCalledWith(
      'm1',
      { journalEntryId: 'j1' },
      expect.anything(),
    );
    expect(result).toHaveProperty('journal');
  });

  it('should create beacon when shouldBroadcast is true', async () => {
    (getDailyCheckInByUserIdAndDate as jest.Mock).mockResolvedValue(null);
    (createMoodLog as jest.Mock).mockResolvedValue({ id: 'm1' });
    (createDailyCheckIn as jest.Mock).mockResolvedValue({
      id: 'd1',
      date: new Date(),
      broadcasted: true,
    });
    (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
      return cb({});
    });

    await dailyLogService.create(validData, 'u1');

    expect(createBeacon).toHaveBeenCalledWith(
      expect.objectContaining({
        user: { connect: { id: 'u1' } },
      }),
      expect.anything(),
    );
  });
});
