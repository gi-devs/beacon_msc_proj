import { NextFunction, Request, Response } from 'express';
import { UserPayload } from '@beacon/types';
import { communityRoomService } from '@/services/service.communityRoom';

async function getByUserId(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const decoded = req.user as UserPayload;
    const userId = decoded.userId;
    const skip = req.query.skip as string;
    const take = req.query.take as string;

    const rooms = await communityRoomService.fetchUsersCommunityRooms(
      userId,
      skip,
      take,
    );

    res.status(201).json(rooms);
  } catch (e) {
    next(e);
  }
}

export const communityRoomController = {
  getByUserId,
};
