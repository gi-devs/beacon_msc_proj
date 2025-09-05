import { communityRoomService } from '../../../src/services/service.communityRoom';
import {
  getCommunityRoomByUserIdCount,
  getCommunityRoomsByUserId,
} from '../../../src/models/model.communityRoom';
import { normaliseDate } from '../../../src/utils/dates';
import {
  getCommunityRoomPostByRoomIdCount,
  getCommunityRoomPostsByRoomId,
} from '../../../src/models/model.communityRoomPost';

jest.mock('@/models/model.communityRoom');
jest.mock('@/utils/dates');
jest.mock('@/models/model.communityRoomPost');

describe('communityRoomService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUsersCommunityRooms', () => {
    it('should throw error when skip or take is NaN', async () => {
      await expect(
        communityRoomService.fetchUsersCommunityRooms('u1', 'abc', '10'),
      ).rejects.toThrow('Invalid skip or take parameters');

      await expect(
        communityRoomService.fetchUsersCommunityRooms('u1', '0', 'xyz'),
      ).rejects.toThrow('Invalid skip or take parameters');
    });

    it('should return formatted paginated community rooms', async () => {
      (normaliseDate as jest.Mock).mockReturnValue(new Date('2025-01-01'));
      (getCommunityRoomsByUserId as jest.Mock).mockResolvedValue([
        {
          id: 1,
          roomName: 'Room 1',
          expiresAt: new Date('2024-12-31'), // expired
          createdAt: new Date('2024-01-01'),
          members: [{ id: 'm1', username: 'member1' }],
        },
        {
          id: 2,
          roomName: 'Room 2',
          expiresAt: new Date('2025-12-31'), // active
          createdAt: new Date('2025-01-01'),
          members: [{ id: 'm2', username: 'member2' }],
        },
      ]);
      (getCommunityRoomByUserIdCount as jest.Mock).mockResolvedValue(2);

      const result = await communityRoomService.fetchUsersCommunityRooms(
        'u1',
        '0',
        '10',
      );

      expect(result.totalCount).toBe(2);
      expect(result.items).toEqual([
        expect.objectContaining({
          id: 1,
          roomName: 'Room 1',
          expired: true,
        }),
        expect.objectContaining({
          id: 2,
          roomName: 'Room 2',
          expired: false,
        }),
      ]);
    });
  });

  describe('fetchCommunityRoomPostsByRoomId', () => {
    it('should throw error when skip or take is NaN', async () => {
      await expect(
        communityRoomService.fetchCommunityRoomPostsByRoomId('r1', 'bad', '5'),
      ).rejects.toThrow('Invalid skip or take parameters');

      await expect(
        communityRoomService.fetchCommunityRoomPostsByRoomId('r1', '0', 'oops'),
      ).rejects.toThrow('Invalid skip or take parameters');
    });

    it('should return formatted paginated posts', async () => {
      (getCommunityRoomPostsByRoomId as jest.Mock).mockResolvedValue([
        {
          id: 101,
          title: 'Post 1',
          content: 'Content 1',
          createdAt: new Date('2025-01-01'),
          moodFace: 3,
          postUser: { id: 'u1', username: 'user1' },
        },
      ]);
      (getCommunityRoomPostByRoomIdCount as jest.Mock).mockResolvedValue(1);

      const result = await communityRoomService.fetchCommunityRoomPostsByRoomId(
        'r1',
        '0',
        '10',
      );

      expect(result.totalCount).toBe(1);
      expect(result.items[0]).toMatchObject({
        id: 101,
        title: 'Post 1',
        content: 'Content 1',
        moodFace: 3,
        postUser: { id: 'u1', username: 'user1' },
      });
    });
  });
});
