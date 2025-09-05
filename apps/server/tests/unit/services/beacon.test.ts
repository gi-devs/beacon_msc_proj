import { getBeaconById } from '../../../src/models/model.beacon';
import { beaconService } from '../../../src/services/service.beacon';
import { CustomError } from '../../../src/utils/custom-error';
import { BeaconReplyTextKey } from '@beacon/types';
import {
  getBeaconNotificationById,
  updateBeaconNotificationById,
} from '../../../src/models/model.beaconNotification';
import {
  createBeaconReply,
  getBeaconRepliesByBeaconId,
  getBeaconRepliesByBeaconIdCount,
} from '../../../src/models/model.beaconReply';
import { getDailyCheckInByMoodLogId } from '../../../src/models/model.dailyCheckIn';
import prisma from '../../../src/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  $transaction: jest.fn((cb) => cb({})),
}));
jest.mock('@/models/model.beacon');
jest.mock('@/models/model.beaconNotification');
jest.mock('@/models/model.beaconReply');
jest.mock('@/models/model.dailyCheckIn');

describe('beaconService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReplyForBeacon', () => {
    const validData = {
      beaconId: 1,
      beaconNotificationId: 2,
      replyTextKey: 'generic' as BeaconReplyTextKey,
      replyTextId: 5,
    };

    it('should throw CustomError when schema validation fails', async () => {
      const invalidData: any = {
        // missing fields
      };

      await expect(
        beaconService.createReplyForBeacon(invalidData, 'user1'),
      ).rejects.toBeInstanceOf(CustomError);
    });

    it('should throw if beacon not found', async () => {
      (getBeaconById as jest.Mock).mockResolvedValue(null);
      await expect(
        beaconService.createReplyForBeacon(validData, 'u1'),
      ).rejects.toThrow(CustomError);
    });

    it('should throw if beacon expired', async () => {
      (getBeaconById as jest.Mock).mockResolvedValue({
        id: 1,
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(
        beaconService.createReplyForBeacon(validData, 'u1'),
      ).rejects.toThrow('has expired');
    });

    it('should throw if beaconNotification not found', async () => {
      (getBeaconById as jest.Mock).mockResolvedValue({
        id: 1,
        expiresAt: new Date(Date.now() + 1000),
      });
      (getBeaconNotificationById as jest.Mock).mockResolvedValue(null);

      await expect(
        beaconService.createReplyForBeacon(validData, 'u1'),
      ).rejects.toThrow('not found');
    });

    it('should throw if replier does not own beaconNotification', async () => {
      (getBeaconById as jest.Mock).mockResolvedValue({
        id: 1,
        expiresAt: new Date(Date.now() + 1000),
      });
      (getBeaconNotificationById as jest.Mock).mockResolvedValue({
        id: 2,
        userId: 'other',
        beaconId: 1,
      });

      await expect(
        beaconService.createReplyForBeacon(validData, 'u1'),
      ).rejects.toThrow('do not have permission');
    });

    it('should throw if beaconNotification does not belong to beacon', async () => {
      (getBeaconById as jest.Mock).mockResolvedValue({
        id: 1,
        expiresAt: new Date(Date.now() + 1000),
      });
      (getBeaconNotificationById as jest.Mock).mockResolvedValue({
        id: 2,
        userId: 'u1',
        beaconId: 2, // different beaconId not matching 1
      });

      await expect(
        beaconService.createReplyForBeacon(validData, 'u1'),
      ).rejects.toThrow(
        'Beacon notification with ID 2 does not belong to beacon with ID 1',
      );
    });

    it('should throw if fail to fetch updatedBeaconNotif', async () => {
      (getBeaconById as jest.Mock).mockResolvedValue({
        id: 1,
        expiresAt: new Date(Date.now() + 1000),
      });
      (getBeaconNotificationById as jest.Mock)
        .mockResolvedValueOnce({
          id: 2,
          userId: 'u1',
          beaconId: 1,
        })
        .mockResolvedValueOnce(null);
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        return cb({});
      });
      (createBeaconReply as jest.Mock).mockResolvedValue({ id: 'reply1' });
      (updateBeaconNotificationById as jest.Mock).mockResolvedValue({});

      await expect(
        beaconService.createReplyForBeacon(validData, 'u1'),
      ).rejects.toThrow('Failed to fetch updated beacon notification');
    });

    it('should throw if reply creation fails', async () => {
      (getBeaconById as jest.Mock).mockResolvedValue({
        id: 1,
        expiresAt: new Date(Date.now() + 1000),
      });
      (getBeaconNotificationById as jest.Mock)
        .mockResolvedValueOnce({
          id: 2,
          userId: 'u1',
          beaconId: 1,
        }) // first call
        .mockResolvedValueOnce({
          id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'REPLIED',
          beacon: {
            id: 1,
            expiresAt: new Date(),
            user: { username: 'owner' },
            dailyCheckIn: {
              MoodLog: { stressScale: 50, anxietyScale: 50, sadnessScale: 50 },
            },
          },
        });
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        return cb({});
      });
      (createBeaconReply as jest.Mock).mockResolvedValue(null);
      (updateBeaconNotificationById as jest.Mock).mockResolvedValue({});

      await expect(
        beaconService.createReplyForBeacon(validData, 'u1'),
      ).rejects.toThrow('Failed to create beacon reply');
    });

    it('should create reply and return BeaconNotificationDTO', async () => {
      (getBeaconById as jest.Mock).mockResolvedValue({
        id: 1,
        expiresAt: new Date(Date.now() + 1000),
      });
      (getBeaconNotificationById as jest.Mock)
        .mockResolvedValueOnce({
          id: 2,
          userId: 'u1',
          beaconId: 1,
        })
        .mockResolvedValueOnce({
          id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'REPLIED',
          beacon: {
            id: 1,
            expiresAt: new Date(),
            user: { username: 'owner' },
            dailyCheckIn: {
              MoodLog: { stressScale: 50, anxietyScale: 50, sadnessScale: 50 },
            },
          },
        });
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        return cb({});
      });
      (createBeaconReply as jest.Mock).mockResolvedValue({ id: 'reply1' });
      (updateBeaconNotificationById as jest.Mock).mockResolvedValue({});

      const result = await beaconService.createReplyForBeacon(validData, 'u1');

      expect(createBeaconReply).toHaveBeenCalled();
      expect(updateBeaconNotificationById).toHaveBeenCalledWith(
        2,
        { status: 'REPLIED' },
        expect.anything(),
      );
      expect(result).toMatchObject({
        id: 2,
        status: 'REPLIED',
        beacon: {
          ownerUsername: 'owner',
          moodInfo: { moodFace: expect.any(Number) },
        },
      });
    });
  });

  describe('fetchBeaconRepliesFromMoodLogId', () => {
    it('should throw if daily check-in not found', async () => {
      (getDailyCheckInByMoodLogId as jest.Mock).mockResolvedValue(null);
      await expect(
        beaconService.fetchBeaconRepliesFromMoodLogId(1, 10, 0),
      ).rejects.toThrow('not found');
    });

    it('should throw if no beacon associated with daily check-in', async () => {
      (getDailyCheckInByMoodLogId as jest.Mock).mockResolvedValue({});
      await expect(
        beaconService.fetchBeaconRepliesFromMoodLogId(1, 10, 0),
      ).rejects.toThrow('No beacon associated');
    });

    it('should return paginated replies', async () => {
      (getDailyCheckInByMoodLogId as jest.Mock).mockResolvedValue({
        Beacon: { id: 5 },
      });
      (getBeaconRepliesByBeaconId as jest.Mock).mockResolvedValue([
        {
          id: 1,
          beaconId: 5,
          createdAt: new Date(),
          replyTextKey: 'kind',
          replyTextId: 101,
          replierId: 'u1',
          replier: { username: 'test' },
        },
      ]);
      (getBeaconRepliesByBeaconIdCount as jest.Mock).mockResolvedValue(1);

      const result = await beaconService.fetchBeaconRepliesFromMoodLogId(
        1,
        10,
        0,
      );

      expect(getBeaconRepliesByBeaconId).toHaveBeenCalledWith(5, undefined, {
        take: 10,
        skip: 0,
      });
      expect(result).toMatchObject({
        items: [
          expect.objectContaining({
            beaconId: 5,
            replierUsername: 'test',
          }),
        ],
        totalCount: 1,
        totalPages: 1,
        hasMore: false,
      });
    });
  });
});
