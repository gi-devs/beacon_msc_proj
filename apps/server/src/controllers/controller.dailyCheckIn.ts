import { NextFunction, Request, Response } from 'express';
import { dailyLogService } from '@/services/service.dailyCheckin';
import { UserPayload } from '@beacon/types';

async function log(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const decoded = req.user as UserPayload;
    const userId = decoded.userId;
    const data = req.body;

    const loggedData = await dailyLogService.create(data, userId);

    res.status(201).json(loggedData);
  } catch (e) {
    next(e);
  }
}

export const dailyLogController = {
  log,
};
