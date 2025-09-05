import { UserPayload } from '@beacon/types';
import { pushTokenService } from '../../../src/services/service.pushToken';
import { pushTokenController } from '../../../src/controllers/controller.pushToken';

jest.mock('@/services/service.pushToken', () => ({
  pushTokenService: {
    syncPushToken: jest.fn(),
  },
}));

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('pushTokenController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sync', () => {
    it('should create push token and return 201', async () => {
      const req: any = {
        user: { userId: 'u1' } as UserPayload,
        body: { pushToken: 'token1' },
      };
      const res = mockResponse();

      (pushTokenService.syncPushToken as jest.Mock).mockResolvedValue(true);

      await pushTokenController.sync(req, res, mockNext);

      expect(pushTokenService.syncPushToken).toHaveBeenCalledWith({
        userId: 'u1',
        pushToken: 'token1',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Push token created successfully',
      });
    });

    it('should update push token and return 200', async () => {
      const req: any = {
        user: { userId: 'u1' } as UserPayload,
        body: { pushToken: 'token1' },
      };
      const res = mockResponse();

      (pushTokenService.syncPushToken as jest.Mock).mockResolvedValue(false);

      await pushTokenController.sync(req, res, mockNext);

      expect(pushTokenService.syncPushToken).toHaveBeenCalledWith({
        userId: 'u1',
        pushToken: 'token1',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Push token updated successfully',
      });
    });

    it('should call next on error', async () => {
      const req: any = {
        user: { userId: 'u1' } as UserPayload,
        body: { pushToken: 'Token1' },
      };
      const res = mockResponse();

      (pushTokenService.syncPushToken as jest.Mock).mockRejectedValue(
        new Error('db error'),
      );

      await pushTokenController.sync(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
