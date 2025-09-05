import { notificationSettingService } from '../../../src/services/service.notificationSetting';
import {
  getNotificationSettingByUserId,
  createNotificationSetting,
  updateNotificationSettingByUserId,
} from '../../../src/models/model.notificationSetting';
import { getUserById } from '../../../src/models/model.user';
import { CustomError } from '../../../src/utils/custom-error';

jest.mock('@/models/model.notificationSetting');
jest.mock('@/models/model.user');

describe('notificationSettingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserNotificationSetting', () => {
    it('should throw if notification setting not found', async () => {
      (getNotificationSettingByUserId as jest.Mock).mockResolvedValue(null);
      await expect(
        notificationSettingService.fetchUserNotificationSetting('u1'),
      ).rejects.toThrow('Notification setting not found for this user');
    });

    it('should return notification setting if found', async () => {
      const mockSetting = { id: 'ns1', push: true };
      (getNotificationSettingByUserId as jest.Mock).mockResolvedValue(
        mockSetting,
      );
      const result =
        await notificationSettingService.fetchUserNotificationSetting('u1');
      expect(result).toBe(mockSetting);
    });
  });

  describe('createUserNotificationSetting', () => {
    const validData = {
      push: true,
      minBeaconPushInterval: 7200,
      maxBeaconPushes: 5,
    };

    it('should throw if validation fails', async () => {
      await expect(
        notificationSettingService.createUserNotificationSetting(
          {} as any,
          'u1',
        ),
      ).rejects.toThrow(CustomError);
    });

    it('should throw if user not found', async () => {
      (getUserById as jest.Mock).mockResolvedValue(null);
      await expect(
        notificationSettingService.createUserNotificationSetting(
          validData,
          'u1',
        ),
      ).rejects.toThrow('User not found');
    });

    it('should throw if setting already exists', async () => {
      (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
      (getNotificationSettingByUserId as jest.Mock).mockResolvedValue({
        id: 'existing',
      });

      await expect(
        notificationSettingService.createUserNotificationSetting(
          validData,
          'u1',
        ),
      ).rejects.toThrow('Notification setting already exists for this user');
    });

    it('should create a new notification setting if none exists', async () => {
      (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
      (getNotificationSettingByUserId as jest.Mock).mockResolvedValue(null);
      (createNotificationSetting as jest.Mock).mockResolvedValue({
        id: 'ns1',
        push: true,
      });

      const result =
        await notificationSettingService.createUserNotificationSetting(
          validData,
          'u1',
        );

      expect(createNotificationSetting).toHaveBeenCalledWith(
        expect.objectContaining({
          push: true,
          user: { connect: { id: 'u1' } },
        }),
      );
      expect(result).toHaveProperty('id', 'ns1');
    });
  });

  describe('updateUserNotificationSetting', () => {
    it('should throw if validation fails', async () => {
      await expect(
        notificationSettingService.updateUserNotificationSetting('u1', {
          maxBeaconPushes: -1, // invalid
        } as any),
      ).rejects.toThrow();
    });

    it('should create setting if not found', async () => {
      (getNotificationSettingByUserId as jest.Mock).mockResolvedValue(null);
      (createNotificationSetting as jest.Mock).mockResolvedValue({
        id: 'new',
      });

      const result =
        await notificationSettingService.updateUserNotificationSetting('u1', {
          push: true,
        });

      expect(createNotificationSetting).toHaveBeenCalledWith(
        expect.objectContaining({
          push: true,
          user: { connect: { id: 'u1' } },
        }),
      );
      expect(result).toHaveProperty('id', 'new');
    });

    it('should update setting if found', async () => {
      (getNotificationSettingByUserId as jest.Mock).mockResolvedValue({
        id: 'ns1',
        push: true,
      });
      (updateNotificationSettingByUserId as jest.Mock).mockResolvedValue({
        id: 'ns1',
        push: false,
      });

      const result =
        await notificationSettingService.updateUserNotificationSetting('u1', {
          push: false,
        });

      expect(updateNotificationSettingByUserId).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ push: false }),
      );
      expect(result).toHaveProperty('id', 'ns1');
      expect(result).toHaveProperty('push', false);
    });
  });

  describe('deleteUserLocationSetting', () => {
    it('should resolve without error (placeholder)', async () => {
      await expect(
        notificationSettingService.deleteUserLocationSetting('u1'),
      ).resolves.toBeUndefined();
    });
  });
});
