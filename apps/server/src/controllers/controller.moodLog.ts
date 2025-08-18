import { NextFunction, Response, Request } from 'express';
import { moodLogService } from '@/services/service.moodLog';
import { UserPayload } from '@beacon/types';

async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const decoded = req.user as UserPayload;
  const userId = decoded.userId;
  const data = req.body;

  try {
    const moodLog = await moodLogService.create(data, userId);
    res.status(201).json(moodLog);
  } catch (e) {
    next(e);
  }
}

export const moodLogController = {
  create,
};
