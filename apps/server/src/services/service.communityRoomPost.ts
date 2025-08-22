import { CommunityPostDTO } from '@beacon/types';
import { getCommunityPostById } from '@/models/model.communityRoomPost';

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

export const communityRoomPostService = {
  fetchCommunityRoomPostByPostId,
};
