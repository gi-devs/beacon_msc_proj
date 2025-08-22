import { CommunityPostDTO } from '@beacon/types';
import {
  createCommunityRoomPost,
  getCommunityPostById,
} from '@/models/model.communityRoomPost';
import {
  CreateCommunityRoomPostData,
  createCommunityRoomPostSchema,
} from '@beacon/validation';
import { getUserById } from '@/models/model.user';
import { getCommunityRoomById } from '@/models/model.communityRoom';
import { handleZodError } from '@/utils/handle-zod-error';

async function fetchCommunityRoomPostByPostId(
  postId: string,
): Promise<CommunityPostDTO | null> {
  const postIdInt = parseInt(postId, 10);

  if (isNaN(postIdInt)) {
    throw new Error('Invalid post ID');
  }

  const post = await getCommunityPostById(postIdInt);

  if (!post) {
    return null;
  }

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    moodFace: post.moodFace,
    postUser: {
      id: post.postUser.id,
      username: post.postUser.username,
    },
  };
}

async function createUserCommunityRoomPost(
  userId: string,
  roomId: string,
  data: CreateCommunityRoomPostData,
): Promise<CommunityPostDTO> {
  let parsedData;
  try {
    parsedData = createCommunityRoomPostSchema.parse(data);
  } catch (e) {
    handleZodError(e);
  }

  const { title, content } = parsedData;

  // check user exists
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  // check room exists
  const room = await getCommunityRoomById(roomId);
  if (!room) {
    throw new Error('Community room not found');
  }

  // check user is member of room
  if (!room.members.some((member) => member.id === userId)) {
    throw new Error('User is not a member of this community room');
  }

  // create
  const post = await createCommunityRoomPost({
    title,
    content,
    room: {
      connect: { id: roomId },
    },
    postUser: {
      connect: { id: userId },
    },
  });

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    moodFace: post.moodFace,
    postUser: {
      id: user.id,
      username: user.username,
    },
  };
}

export const communityRoomPostService = {
  fetchCommunityRoomPostByPostId,
  createUserCommunityRoomPost,
};
