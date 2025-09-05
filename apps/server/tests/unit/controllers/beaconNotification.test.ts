import { beaconNotificationService } from '../../../src/services/service.beaconNotification';
import { beaconNotificationController } from '../../../src/controllers/controller.beaconNotification';

jest.mock('@/services/service.beaconNotification', () => ({
  beaconNotificationService: {
    fetchUserBeaconNotifications: jest.fn(),
    fetchBeaconNotification: jest.fn(),
  },
}));

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('beaconNotificationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should fetch user notifications and return 200', async () => {
      const req: any = {
        user: { userId: 'u1' },
        query: { take: '10', skip: '0' },
      };
      const res = mockResponse();

      (
        beaconNotificationService.fetchUserBeaconNotifications as jest.Mock
      ).mockResolvedValue([{ id: 'n1', text: 'hello' }]);

      await beaconNotificationController.getNotifications(req, res, mockNext);

      expect(
        beaconNotificationService.fetchUserBeaconNotifications,
      ).toHaveBeenCalledWith('u1', '10', '0');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 'n1', text: 'hello' }]);
    });

    it('should call next on error', async () => {
      const req: any = {
        user: { userId: 'u1' },
        query: { take: '10', skip: '0' },
      };
      const res = mockResponse();

      (
        beaconNotificationService.fetchUserBeaconNotifications as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await beaconNotificationController.getNotifications(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getSingleNotification', () => {
    it('should fetch a single notification and return 200', async () => {
      const req: any = { user: { userId: 'u1' }, params: { id: 'n1' } };
      const res = mockResponse();

      (
        beaconNotificationService.fetchBeaconNotification as jest.Mock
      ).mockResolvedValue({ id: 'n1', text: 'hello' });

      await beaconNotificationController.getSingleNotification(
        req,
        res,
        mockNext,
      );

      expect(
        beaconNotificationService.fetchBeaconNotification,
      ).toHaveBeenCalledWith('n1', 'u1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 'n1', text: 'hello' });
    });

    it('should call next on error', async () => {
      const req: any = { user: { userId: 'u1' }, params: { id: 'n1' } };
      const res = mockResponse();

      (
        beaconNotificationService.fetchBeaconNotification as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await beaconNotificationController.getSingleNotification(
        req,
        res,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
