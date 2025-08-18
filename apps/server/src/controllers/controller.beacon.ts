import { NextFunction, Request, Response } from 'express';
import { beaconService } from '@/services/service.beacon';
import { CustomError } from '@/utils/custom-error';
import { UserPayload } from '@beacon/types';

async function receive(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // get /beacon/[id]/notification/[beaconNotifId]
    const decoded = req.user as UserPayload;
    const currUserId = decoded.userId;
    const { id, beaconNotifId } = req.params;

    // parse id and beaconNotifId to integers
    const beaconId = parseInt(id);
    const beaconNotificationId = parseInt(beaconNotifId);

    const beaconReplyDetails =
      await beaconService.fetchBeaconDetailsForAffirmations(
        beaconId,
        beaconNotificationId,
        currUserId,
      );

    res.status(201).json(beaconReplyDetails);
  } catch (e) {
    // check if number parsing failed
    if (e instanceof TypeError && e.message.includes('NaN')) {
      throw new CustomError('Invalid beacon or notification ID', 400);
    }
    next(e);
  }
}

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

export const beaconController = {
  receive,
  reply,
};
