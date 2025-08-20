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

async function getManyByUserId(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const decoded = req.user as UserPayload;
  const userId = decoded.userId;
  const take = parseInt(req.query.take as string) || 10;
  const skip = parseInt(req.query.skip as string) || 0;

  try {
    const paginatedMoodLogRes = await moodLogService.getMoodLogsByUserId(
      userId,
      take,
      skip,
    );

    res.status(200).json(paginatedMoodLogRes);
  } catch (e) {
    next(e);
  }
}

async function getDetail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const id = parseInt(req.params.id as string, 10);

  if (isNaN(id)) {
    return next(new Error('Invalid mood log ID'));
  }

  try {
    const detail = await moodLogService.fetchMoodLogDetail(id);
    res.status(200).json(detail);
  } catch (e) {
    next(e);
  }
}

export const moodLogController = {
  create,
  getManyByUserId,
  getDetail,
};
