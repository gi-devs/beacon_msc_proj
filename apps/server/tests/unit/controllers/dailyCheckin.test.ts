import { UserPayload } from '@beacon/types';
import { dailyLogService } from '../../../src/services/service.dailyCheckin';
import { dailyLogController } from '../../../src/controllers/controller.dailyCheckIn';

jest.mock('@/services/service.dailyCheckin', () => ({
  dailyLogService: {
    create: jest.fn(),
  },
}));

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('dailyLogController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('log', () => {
    const moodLogData = {
      sadScale: 50,
      anxiousScale: 50,
      stressScale: 50,
    };
    it('should create a daily log and return 201', async () => {
      const req: any = {
        user: { userId: 'u1' } as UserPayload,
        body: moodLogData,
      };
      const res = mockResponse();

      (dailyLogService.create as jest.Mock).mockResolvedValue({
        id: 'd1',
        moodLogData,
      });

      await dailyLogController.log(req, res, mockNext);

      expect(dailyLogService.create).toHaveBeenCalledWith(moodLogData, 'u1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 'd1', moodLogData });
    });

    it('should call next on error', async () => {
      const req: any = {
        user: { userId: 'u1' } as UserPayload,
        body: moodLogData,
      };
      const res = mockResponse();

      (dailyLogService.create as jest.Mock).mockRejectedValue(
        new Error('db error'),
      );

      await dailyLogController.log(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
