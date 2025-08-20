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
    const entries = await journalEntryService.fetchJournalEntriesByUserId(
      userId,
      take,
      skip,
    );
    res.status(200).json(entries);
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
    return next(new Error('Invalid journal entry ID'));
  }

  try {
    const entry = await journalEntryService.fetchJournalEntryDetail(id);
    res.status(200).json(entry);
  } catch (e) {
    next(e);
  }
}

export const journalEntryController = {
  create,
  getManyByUserId,
  getDetail,
};
