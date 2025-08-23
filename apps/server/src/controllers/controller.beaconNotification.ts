import { NextFunction, Request, Response } from 'express';
import { beaconNotificationService } from '@/services/service.beaconNotification';

async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const decoded = req.user as { userId: string };
  const userId = decoded.userId;
  const take = req.query.take as string;
  const skip = req.query.skip as string;

  try {
    const paginatedUserNotifications =
      await beaconNotificationService.fetchUserBeaconNotifications(
        userId,
        take,
        skip,
      );

    res.status(200).json(paginatedUserNotifications);
  } catch (e) {
    next(e);
  }
}

async function getSingleNotification(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const decoded = req.user as { userId: string };
  const userId = decoded.userId;
  const notificationId = req.params.id;

  try {
    const notification =
      await beaconNotificationService.fetchBeaconNotification(
        notificationId,
        userId,
      );

    res.status(200).json(notification);
  } catch (e) {
    next(e);
  }
}

export const beaconNotificationController = {
  getNotifications,
  getSingleNotification,
};
