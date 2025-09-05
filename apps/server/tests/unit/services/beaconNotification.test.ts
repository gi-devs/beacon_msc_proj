import { beaconNotificationService } from '../../../src/services/service.beaconNotification';
import { CustomError } from '../../../src/utils/custom-error';
import { getUserById } from '../../../src/models/model.user';
import {
  getAllBeaconNotificationsByUserId,
  getAllBeaconNotificationsByUserIdCount,
  getBeaconNotificationById,
} from '../../../src/models/model.beaconNotification';

jest.mock('@/models/model.beaconNotification');
jest.mock('@/models/model.user');

describe('beaconNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserBeaconNotifications', () => {
    it('should throw if pagination params are invalid', async () => {
      await expect(
        beaconNotificationService.fetchUserBeaconNotifications('u1', '0', '0'),
      ).rejects.toThrow(new CustomError('Invalid pagination parameters', 400));

      await expect(
        beaconNotificationService.fetchUserBeaconNotifications('u1', 'x', '0'),
      ).rejects.toThrow('Invalid pagination parameters');
    });

    it('should throw if user not found', async () => {
      (getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        beaconNotificationService.fetchUserBeaconNotifications('u1', '10', '0'),
      ).rejects.toThrow(new CustomError('User not found', 404));
    });

    it('should throw if associated MoodLog missing', async () => {
      (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
      (getAllBeaconNotificationsByUserId as jest.Mock).mockResolvedValue([
        {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'SENT',
          beacon: {
            id: 2,
            expiresAt: new Date(),
            user: { username: 'owner' },
            dailyCheckIn: { MoodLog: null }, // missing mood log
          },
        },
      ]);
      (getAllBeaconNotificationsByUserIdCount as jest.Mock).mockResolvedValue(
        1,
      );

      await expect(
        beaconNotificationService.fetchUserBeaconNotifications('u1', '10', '0'),
      ).rejects.toThrow('Associated MoodLog not found');
    });

    it('should return paginated beacon notifications successfully', async () => {
      const moodLog = { stressScale: 1, anxietyScale: 2, sadnessScale: 3 };
      (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
      (getAllBeaconNotificationsByUserId as jest.Mock).mockResolvedValue([
        {
          id: 1,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-02'),
          status: 'SENT',
          beacon: {
            id: 2,
            expiresAt: new Date('2025-12-31'),
            user: { username: 'owner' },
            dailyCheckIn: { MoodLog: moodLog },
          },
        },
      ]);
      (getAllBeaconNotificationsByUserIdCount as jest.Mock).mockResolvedValue(
        1,
      );

      const result =
        await beaconNotificationService.fetchUserBeaconNotifications(
          'u1',
          '10',
          '0',
        );

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: 1,
        status: 'SENT',
        beacon: {
          ownerUsername: 'owner',
          moodInfo: {
            moodFace: 2, // avg of 1,2,3
          },
        },
      });
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('fetchBeaconNotification', () => {
    it('should throw if ID is invalid', async () => {
      await expect(
        beaconNotificationService.fetchBeaconNotification('abc', 'u1'),
      ).rejects.toThrow(new CustomError('Invalid beacon notification ID', 400));
    });

    it('should throw if beaconNotification not found', async () => {
      (getBeaconNotificationById as jest.Mock).mockResolvedValue(null);

      await expect(
        beaconNotificationService.fetchBeaconNotification('1', 'u1'),
      ).rejects.toThrow('Beacon notification not found');
    });

    it('should throw if unauthorized access', async () => {
      (getBeaconNotificationById as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 'other',
        beacon: { dailyCheckIn: { MoodLog: {} } },
      });

      await expect(
        beaconNotificationService.fetchBeaconNotification('1', 'u1'),
      ).rejects.toThrow('Unauthorized access to this beacon notification');
    });

    it('should throw if associated MoodLog missing', async () => {
      (getBeaconNotificationById as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 'u1',
        beacon: { dailyCheckIn: { MoodLog: null } },
      });

      await expect(
        beaconNotificationService.fetchBeaconNotification('1', 'u1'),
      ).rejects.toThrow('Associated MoodLog not found');
    });

    it('should return BeaconNotificationDTO successfully', async () => {
      const moodLog = { stressScale: 1, anxietyScale: 2, sadnessScale: 3 };
      (getBeaconNotificationById as jest.Mock).mockResolvedValue({
        id: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
        status: 'REPLIED',
        userId: 'u1',
        beacon: {
          id: 2,
          expiresAt: new Date('2025-12-31'),
          user: { username: 'owner' },
          dailyCheckIn: { MoodLog: moodLog },
        },
      });

      const result = await beaconNotificationService.fetchBeaconNotification(
        '1',
        'u1',
      );

      expect(result).toMatchObject({
        id: 1,
        status: 'REPLIED',
        beacon: {
          beaconId: 2,
          ownerUsername: 'owner',
          moodInfo: { moodFace: 2 },
        },
      });
    });
  });
});
