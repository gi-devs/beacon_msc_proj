import { NextFunction, Request, Response } from 'express';
import { beaconService } from '@/services/service.beacon';
import { CustomError } from '@/utils/custom-error';

async function receive(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // get /beacon/[id]/notification/[beaconNotifId]
    const { id, beaconNotifId } = req.params;
    const beaconId = parseInt(id);
    const beaconNotificationId = parseInt(beaconNotifId);

    const beaconReplyDetails =
      await beaconService.fetchBeaconDetailsForAffirmations(
        beaconId,
        beaconNotificationId,
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

export const beaconController = {
  receive,
};
