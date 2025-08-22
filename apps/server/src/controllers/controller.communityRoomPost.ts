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

async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const decoded = req.user as { userId: string };
  const userId = decoded.userId;
  const roomId = req.params.roomId as string;
  const data = req.body;

  try {
    const post = await communityRoomPostService.createUserCommunityRoomPost(
      userId,
      roomId,
      data,
    );
    res.status(201).json(post);
  } catch (e) {
    next(e);
  }
}

export const communityRoomPostController = {
  getPostById,
  create,
};
