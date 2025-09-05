import { communityRoomService } from '../../../src/services/service.communityRoom';
import { communityRoomController } from '../../../src/controllers/controller.communityRoom';

jest.mock('@/services/service.communityRoom', () => ({
  communityRoomService: {
    fetchUsersCommunityRooms: jest.fn(),
    fetchCommunityRoomPostsByRoomId: jest.fn(),
  },
}));

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('communityRoomController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getByUserId', () => {
    it('should fetch rooms for user and return 201', async () => {
      const req: any = {
        user: { userId: 'u1' },
        query: { skip: '0', take: '10' },
      };
      const res = mockResponse();

      (
        communityRoomService.fetchUsersCommunityRooms as jest.Mock
      ).mockResolvedValue([{ id: 'r1', name: 'Room 1' }]);

      await communityRoomController.getByUserId(req, res, mockNext);

      expect(
        communityRoomService.fetchUsersCommunityRooms,
      ).toHaveBeenCalledWith('u1', '0', '10');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith([{ id: 'r1', name: 'Room 1' }]);
    });

    it('should call next on error', async () => {
      const req: any = {
        user: { userId: 'u1' },
        query: { skip: '0', take: '10' },
      };
      const res = mockResponse();

      (
        communityRoomService.fetchUsersCommunityRooms as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await communityRoomController.getByUserId(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getPostsByRoomId', () => {
    it('should fetch posts for room and return 201', async () => {
      const req: any = {
        params: { roomId: 'r1' },
        query: { skip: '0', take: '5' },
      };
      const res = mockResponse();

      (
        communityRoomService.fetchCommunityRoomPostsByRoomId as jest.Mock
      ).mockResolvedValue([{ id: 'p1', content: 'hello' }]);

      await communityRoomController.getPostsByRoomId(req, res, mockNext);

      expect(
        communityRoomService.fetchCommunityRoomPostsByRoomId,
      ).toHaveBeenCalledWith('r1', '0', '5');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith([{ id: 'p1', content: 'hello' }]);
    });

    it('should call next on error', async () => {
      const req: any = {
        params: { roomId: 'r1' },
        query: { skip: '0', take: '5' },
      };
      const res = mockResponse();

      (
        communityRoomService.fetchCommunityRoomPostsByRoomId as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await communityRoomController.getPostsByRoomId(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
