import { UserPayload } from '@beacon/types';
import { beaconController } from '../../../src/controllers/controller.beacon';
import { beaconService } from '../../../src/services/service.beacon';

jest.mock('@/services/service.beacon', () => ({
  beaconService: {
    createReplyForBeacon: jest.fn(),
    fetchBeaconRepliesFromMoodLogId: jest.fn(),
  },
}));

// helpers
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('beaconController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reply', () => {
    it('should create a reply and return 201', async () => {
      const req: any = {
        user: { userId: 'u1' } as UserPayload,
        params: { id: '1', beaconNotifId: '2' },
        body: { replyTextKey: 'kind', replyTextId: '3' },
      };
      const res = mockResponse();

      (beaconService.createReplyForBeacon as jest.Mock).mockResolvedValue({
        id: 100,
        replyTextKey: 'kind',
      });

      await beaconController.reply(req, res, mockNext);

      expect(beaconService.createReplyForBeacon).toHaveBeenCalledWith(
        {
          beaconId: 1,
          beaconNotificationId: 2,
          replyTextKey: 'kind',
          replyTextId: 3,
        },
        'u1',
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 100,
        replyTextKey: 'kind',
      });
    });

    it('should call next on other errors', async () => {
      const req: any = {
        user: { userId: 'u1' } as UserPayload,
        params: { id: '1', beaconNotifId: '2' },
        body: { replyTextKey: 'kind', replyTextId: '3' },
      };
      const res = mockResponse();

      (beaconService.createReplyForBeacon as jest.Mock).mockRejectedValue(
        new Error('db fail'),
      );

      await beaconController.reply(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('beaconRepliesWithMoodLogId', () => {
    it('should fetch replies and return 200', async () => {
      const req: any = {
        params: { moodLogId: '10' },
        query: { take: '5', skip: '0' },
      };
      const res = mockResponse();

      (
        beaconService.fetchBeaconRepliesFromMoodLogId as jest.Mock
      ).mockResolvedValue([{ id: 1, text: 'reply' }]);

      await beaconController.beaconRepliesWithMoodLogId(req, res, mockNext);

      expect(
        beaconService.fetchBeaconRepliesFromMoodLogId,
      ).toHaveBeenCalledWith(10, 5, 0);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 1, text: 'reply' }]);
    });

    it('should throw CustomError for invalid pagination params', async () => {
      const req: any = {
        params: { moodLogId: 'x' }, // invalid
        query: { take: 'abc', skip: '0' },
      };
      const res = mockResponse();

      await beaconController.beaconRepliesWithMoodLogId(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next on service errors', async () => {
      const req: any = {
        params: { moodLogId: '10' },
        query: { take: '5', skip: '0' },
      };
      const res = mockResponse();

      (
        beaconService.fetchBeaconRepliesFromMoodLogId as jest.Mock
      ).mockRejectedValue(new Error('db fail'));

      await beaconController.beaconRepliesWithMoodLogId(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
