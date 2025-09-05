import { UserPayload } from '@beacon/types';
import { notificationSettingController } from '../../../src/controllers/controller.notificationSetting';
import { notificationSettingService } from '../../../src/services/service.notificationSetting';

jest.mock('@/services/service.notificationSetting', () => ({
  notificationSettingService: {
    fetchUserNotificationSetting: jest.fn(),
    createUserNotificationSetting: jest.fn(),
    updateUserNotificationSetting: jest.fn(),
  },
}));

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('notificationSettingController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getByUserId', () => {
    it('should fetch notification setting and return 200', async () => {
      const req: any = { user: { userId: 'u1' } as UserPayload };
      const res = mockResponse();

      (
        notificationSettingService.fetchUserNotificationSetting as jest.Mock
      ).mockResolvedValue({
        id: 'n1',
        enabled: true,
      });

      await notificationSettingController.getByUserId(req, res, mockNext);

      expect(
        notificationSettingService.fetchUserNotificationSetting,
      ).toHaveBeenCalledWith('u1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 'n1', enabled: true });
    });

    it('should call next on error', async () => {
      const req: any = { user: { userId: 'u1' } };
      const res = mockResponse();

      (
        notificationSettingService.fetchUserNotificationSetting as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await notificationSettingController.getByUserId(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('create', () => {
    it('should create notification setting and return 201', async () => {
      const req: any = { user: { userId: 'u1' }, body: { enabled: true } };
      const res = mockResponse();

      (
        notificationSettingService.createUserNotificationSetting as jest.Mock
      ).mockResolvedValue({
        id: 'n2',
        enabled: true,
      });

      await notificationSettingController.create(req, res, mockNext);

      expect(
        notificationSettingService.createUserNotificationSetting,
      ).toHaveBeenCalledWith({ enabled: true }, 'u1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 'n2', enabled: true });
    });

    it('should call next on error', async () => {
      const req: any = { user: { userId: 'u1' }, body: { enabled: true } };
      const res = mockResponse();

      (
        notificationSettingService.createUserNotificationSetting as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await notificationSettingController.create(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('update', () => {
    it('should update notification setting and return 200', async () => {
      const req: any = { user: { userId: 'u1' }, body: { enabled: false } };
      const res = mockResponse();

      (
        notificationSettingService.updateUserNotificationSetting as jest.Mock
      ).mockResolvedValue({
        id: 'n3',
        enabled: false,
      });

      await notificationSettingController.update(req, res, mockNext);

      expect(
        notificationSettingService.updateUserNotificationSetting,
      ).toHaveBeenCalledWith('u1', { enabled: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 'n3', enabled: false });
    });

    it('should call next on error', async () => {
      const req: any = { user: { userId: 'u1' }, body: { enabled: false } };
      const res = mockResponse();

      (
        notificationSettingService.updateUserNotificationSetting as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await notificationSettingController.update(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
