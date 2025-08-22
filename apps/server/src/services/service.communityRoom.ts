import { PaginatedResponse } from '@beacon/types';
import {
  getCommunityRoomByUserIdCount,
  getCommunityRoomsByUserId,
} from '@/models/model.communityRoom';
import { UserCommunityRoomDTO } from '@beacon/types';
import { normaliseDate } from '@/utils/dates';

async function fetchUsersCommunityRooms(
  userId: string,
  skip: string,
  take: string,
): Promise<PaginatedResponse<UserCommunityRoomDTO>> {
  const skipInt = parseInt(skip, 10) || 0;
  const takeInt = parseInt(take, 10) || 10;

  if (isNaN(skipInt) || isNaN(takeInt)) {
    throw new Error('Invalid skip or take parameters');
  }

  const today = normaliseDate(new Date());
  const rooms = await getCommunityRoomsByUserId(userId, undefined, {
    skip: skipInt,
    take: takeInt,
    order: { createdAt: 'desc' },
  });

  const formattedRooms: UserCommunityRoomDTO[] = rooms.map((room) => ({
    id: room.id,
    roomName: room.roomName,
    expired: room.expiresAt < today,
    createdAt: room.createdAt,
    members: room.members.map((member) => ({
      id: member.id,
      username: member.username,
    })),
    posts: room.communityRoomPosts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      moodFace: post.moodFace,
      postUser: {
        id: post.postUser.id,
        username: post.postUser.username,
      },
    })),
  }));

  const userCommunitiesCount = await getCommunityRoomByUserIdCount(userId);

  return {
    items: formattedRooms,
    totalCount: userCommunitiesCount,
    page: Math.floor(skipInt / takeInt) + 1,
    totalPages: Math.ceil(userCommunitiesCount / takeInt),
    hasMore: skipInt + takeInt < userCommunitiesCount,
  };
}

export const communityRoomService = {
  fetchUsersCommunityRooms,
};
