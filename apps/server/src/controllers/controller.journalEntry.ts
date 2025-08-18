import { NextFunction, Response, Request } from 'express';
import { journalEntryService } from '@/services/service.journalEntry';
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
    const moodLog = await journalEntryService.create(data, userId);
    res.status(201).json(moodLog);
  } catch (e) {
    next(e);
  }
}

export const journalEntryController = {
  create,
};
