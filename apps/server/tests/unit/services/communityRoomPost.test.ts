import { communityRoomPostService } from '../../../src/services/service.communityRoomPost';
import {
  createCommunityRoomPost,
  deleteCommunityRoomPostById,
  getCommunityPostById,
} from '../../../src/models/model.communityRoomPost';
import { getUserById } from '../../../src/models/model.user';
import { getCommunityRoomById } from '../../../src/models/model.communityRoom';
import { CustomError } from '../../../src/utils/custom-error';

jest.mock('@/models/model.communityRoomPost');
jest.mock('@/models/model.user');
jest.mock('@/models/model.communityRoom');

describe('communityRoomPostService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCommunityRoomPostByPostId', () => {
    it('should throw error when postId is invalid', async () => {
      await expect(
        communityRoomPostService.fetchCommunityRoomPostByPostId('abc'),
      ).rejects.toThrow('Invalid post ID');
    });

    it('should return null if post not found', async () => {
      (getCommunityPostById as jest.Mock).mockResolvedValue(null);

      const result =
        await communityRoomPostService.fetchCommunityRoomPostByPostId('1');

      expect(result).toBeNull();
    });

    it('should return formatted post if found', async () => {
      (getCommunityPostById as jest.Mock).mockResolvedValue({
        id: 1,
        title: 'Post Title',
        content: 'Post Content',
        createdAt: new Date(),
        moodFace: 3,
        postUser: { id: 'u1', username: 'user1' },
      });

      const result =
        await communityRoomPostService.fetchCommunityRoomPostByPostId('1');

      expect(result).toMatchObject({
        id: 1,
        title: 'Post Title',
        postUser: { id: 'u1', username: 'user1' },
      });
    });
  });

  describe('createUserCommunityRoomPost', () => {
    const validData = {
      title: 'New Post',
      content: 'Post content',
      moodFace: 50,
    };

    it('should throw CustomError when schema validation fails', async () => {
      const invalidData: any = {
        // Missing fields
      };

      await expect(
        communityRoomPostService.createUserCommunityRoomPost(
          'u1',
          'r1',
          invalidData,
        ),
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if user not found', async () => {
      (getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        communityRoomPostService.createUserCommunityRoomPost(
          'u1',
          'r1',
          validData,
        ),
      ).rejects.toThrow('User not found');
    });

    it('should throw error if room not found', async () => {
      (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
      (getCommunityRoomById as jest.Mock).mockResolvedValue(null);

      await expect(
        communityRoomPostService.createUserCommunityRoomPost(
          'u1',
          'r1',
          validData,
        ),
      ).rejects.toThrow('Community room not found');
    });

    it('should throw error if user is not a member of the room', async () => {
      (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
      (getCommunityRoomById as jest.Mock).mockResolvedValue({
        members: [{ id: 'u2' }], // does not include u1
      });

      await expect(
        communityRoomPostService.createUserCommunityRoomPost(
          'u1',
          'r1',
          validData,
        ),
      ).rejects.toThrow('User is not a member of this community room');
    });

    it('should create post successfully', async () => {
      (getUserById as jest.Mock).mockResolvedValue({
        id: 'u1',
        username: 'user1',
      });
      (getCommunityRoomById as jest.Mock).mockResolvedValue({
        id: 'r1',
        members: [{ id: 'u1' }], // user is a member
      });
      (createCommunityRoomPost as jest.Mock).mockResolvedValue({
        id: 100,
        title: 'New Post',
        content: 'Post content',
        createdAt: new Date(),
        moodFace: 4,
      });

      const result = await communityRoomPostService.createUserCommunityRoomPost(
        'u1',
        'r1',
        validData,
      );

      expect(createCommunityRoomPost).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: 100,
        title: 'New Post',
        postUser: { id: 'u1', username: 'user1' },
      });
    });
  });

  describe('deleteUserCommunityRoomPost', () => {
    it('should throw error when postId is invalid', async () => {
      await expect(
        communityRoomPostService.deleteUserCommunityRoomPost('u1', 'abc'),
      ).rejects.toThrow('Invalid post ID');
    });

    it('should throw error if post not found', async () => {
      (getCommunityPostById as jest.Mock).mockResolvedValue(null);

      await expect(
        communityRoomPostService.deleteUserCommunityRoomPost('u1', '1'),
      ).rejects.toThrow('Post not found');
    });

    it('should throw error if user is not the owner of the post', async () => {
      (getCommunityPostById as jest.Mock).mockResolvedValue({
        id: 1,
        postUser: { id: 'u2' },
      });

      await expect(
        communityRoomPostService.deleteUserCommunityRoomPost('u1', '1'),
      ).rejects.toThrow('User is not the owner of this post');
    });

    it('should delete post if user is owner', async () => {
      (getCommunityPostById as jest.Mock).mockResolvedValue({
        id: 1,
        postUser: { id: 'u1' },
      });

      const result = await communityRoomPostService.deleteUserCommunityRoomPost(
        'u1',
        '1',
      );

      expect(deleteCommunityRoomPostById).toHaveBeenCalledWith(1);
      expect(result).toBeNull();
    });
  });
});
