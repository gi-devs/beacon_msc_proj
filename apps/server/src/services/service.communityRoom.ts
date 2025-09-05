import { CommunityPostDTO, PaginatedResponse } from '@beacon/types';
import {
  getCommunityRoomByUserIdCount,
  getCommunityRoomsByUserId,
} from '@/models/model.communityRoom';
import { UserCommunityRoomDTO } from '@beacon/types';
import { normaliseDate } from '@/utils/dates';
import {
  getCommunityRoomPostByRoomIdCount,
  getCommunityRoomPostsByRoomId,
} from '@/models/model.communityRoomPost';

async function fetchUsersCommunityRooms(
  userId: string,
  skip: string,
  take: string,
): Promise<PaginatedResponse<UserCommunityRoomDTO>> {
  const skipInt = parseInt(skip, 10);
  const takeInt = parseInt(take, 10);

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
    expiresAt: room.expiresAt,
    createdAt: room.createdAt,
    members: room.members.map((member) => ({
      id: member.id,
      username: member.username,
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

async function fetchCommunityRoomPostsByRoomId(
  roomId: string,
  skip: string,
  take: string,
): Promise<PaginatedResponse<CommunityPostDTO>> {
  const skipInt = parseInt(skip, 10);
  const takeInt = parseInt(take, 10);

  if (isNaN(skipInt) || isNaN(takeInt)) {
    throw new Error('Invalid skip or take parameters');
  }

  const posts = await getCommunityRoomPostsByRoomId(roomId, undefined, {
    skip: skipInt,
    take: takeInt,
    order: { createdAt: 'desc' },
  });

  const postCount = await getCommunityRoomPostByRoomIdCount(roomId);

  const formattedPosts: CommunityPostDTO[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    moodFace: post.moodFace,
    postUser: {
      id: post.postUser.id,
      username: post.postUser.username,
    },
  }));

  return {
    items: formattedPosts,
    totalCount: postCount,
    page: Math.floor(skipInt / takeInt) + 1,
    totalPages: Math.ceil(postCount / takeInt),
    hasMore: skipInt + takeInt < postCount,
  };
}

export const communityRoomService = {
  fetchUsersCommunityRooms,
  fetchCommunityRoomPostsByRoomId,
};
