import { NextFunction, Request, Response } from 'express';
import { beaconService } from '@/services/service.beacon';
import { CustomError } from '@/utils/custom-error';
import { UserPayload } from '@beacon/types';

async function reply(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const decoded = req.user as UserPayload;
    const currUserId = decoded.userId;
    const { id, beaconNotifId } = req.params;
    const { replyTextKey, replyTextId } = req.body;

    // parse id and beaconNotifId to integers
    const beaconId = parseInt(id);
    const beaconNotificationId = parseInt(beaconNotifId);
    const replyTextIdParsed = parseInt(replyTextId);

    const reply = await beaconService.createReplyForBeacon(
      {
        beaconId,
        beaconNotificationId,
        replyTextKey,
        replyTextId: replyTextIdParsed,
      },
      currUserId,
    );

    res.status(201).json(reply);
  } catch (e) {
    if (e instanceof TypeError && e.message.includes('NaN')) {
      throw new CustomError('Invalid IDs', 400);
    }
    next(e);
  }
}

async function beaconRepliesWithMoodLogId(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { moodLogId } = req.params;
    const take = parseInt(req.query.take as string);
    const skip = parseInt(req.query.skip as string);

    if (isNaN(take) || isNaN(skip) || isNaN(parseInt(moodLogId))) {
      throw new CustomError('Invalid pagination parameters', 400);
    }

    const replies = await beaconService.fetchBeaconRepliesFromMoodLogId(
      parseInt(moodLogId),
      take,
      skip,
    );

    res.status(200).json(replies);
  } catch (e) {
    next(e);
  }
}

export const beaconController = {
  reply,
  beaconRepliesWithMoodLogId,
};
