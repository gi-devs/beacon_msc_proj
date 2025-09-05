import { communityRoomPostService } from '../../../src/services/service.communityRoomPost';
import { communityRoomPostController } from '../../../src/controllers/controller.communityRoomPost';

jest.mock('@/services/service.communityRoomPost', () => ({
  communityRoomPostService: {
    fetchCommunityRoomPostByPostId: jest.fn(),
    createUserCommunityRoomPost: jest.fn(),
    deleteUserCommunityRoomPost: jest.fn(),
  },
}));

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('communityRoomPostController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPostById', () => {
    it('should fetch post and return 201', async () => {
      const req: any = { params: { postId: 'p1' } };
      const res = mockResponse();

      (
        communityRoomPostService.fetchCommunityRoomPostByPostId as jest.Mock
      ).mockResolvedValue({
        id: 'p1',
        content: 'hello',
      });

      await communityRoomPostController.getPostById(req, res, mockNext);

      expect(
        communityRoomPostService.fetchCommunityRoomPostByPostId,
      ).toHaveBeenCalledWith('p1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 'p1',
        content: 'hello',
      });
    });

    it('should call next on error', async () => {
      const req: any = { params: { postId: 'p1' } };
      const res = mockResponse();

      (
        communityRoomPostService.fetchCommunityRoomPostByPostId as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await communityRoomPostController.getPostById(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('create', () => {
    it('should create a post and return 201', async () => {
      const req: any = {
        user: { userId: 'u1' },
        params: { roomId: 'r1' },
        body: { content: 'new post' },
      };
      const res = mockResponse();

      (
        communityRoomPostService.createUserCommunityRoomPost as jest.Mock
      ).mockResolvedValue({
        id: 'p2',
        content: 'new post',
      });

      await communityRoomPostController.create(req, res, mockNext);

      expect(
        communityRoomPostService.createUserCommunityRoomPost,
      ).toHaveBeenCalledWith('u1', 'r1', { content: 'new post' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 'p2', content: 'new post' });
    });

    it('should call next on error', async () => {
      const req: any = {
        user: { userId: 'u1' },
        params: { roomId: 'r1' },
        body: { content: 'new post' },
      };
      const res = mockResponse();

      (
        communityRoomPostService.createUserCommunityRoomPost as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await communityRoomPostController.create(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deletePost', () => {
    it('should delete a post and return 204', async () => {
      const req: any = { user: { userId: 'u1' }, params: { postId: 'p1' } };
      const res = mockResponse();

      (
        communityRoomPostService.deleteUserCommunityRoomPost as jest.Mock
      ).mockResolvedValue(undefined);

      await communityRoomPostController.deletePost(req, res, mockNext);

      expect(
        communityRoomPostService.deleteUserCommunityRoomPost,
      ).toHaveBeenCalledWith('u1', 'p1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      const req: any = { user: { userId: 'u1' }, params: { postId: 'p1' } };
      const res = mockResponse();

      (
        communityRoomPostService.deleteUserCommunityRoomPost as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await communityRoomPostController.deletePost(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
