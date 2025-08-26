import { NextFunction, Request, Response } from 'express';
import { devService } from '@/services/services.dev';

async function createBeaconNotification(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const beaconId = req.body.beaconId;
  const userId = req.body.userId;

  try {
    const createBeaconNotification = await devService.manualCreateNotification(
      beaconId,
      userId,
    );
    res.status(201).json(createBeaconNotification.message);
  } catch (e) {
    next(e);
    return;
  }
}

async function notifyBeaconOwner(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const notificationId = req.body.notificationId;

  try {
    const notifyBeaconOwner =
      await devService.manualNotifyReply(notificationId);
    res.status(201).json(notifyBeaconOwner.message);
  } catch (e) {
    next(e);
    return;
  }
}

export const devController = {
  createBeaconNotification,
  notifyBeaconOwner,
};
