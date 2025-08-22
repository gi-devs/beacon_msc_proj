import { NextFunction, Request, Response } from 'express';
import { communityRoomPostService } from '@/services/service.communityRoomPost';

async function getPostById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const postId = req.params.postId as string;

    const post =
      await communityRoomPostService.fetchCommunityRoomPostByPostId(postId);

    res.status(201).json(post);
  } catch (e) {
    next(e);
  }
}

export const communityRoomPostController = {
  getPostById,
};
