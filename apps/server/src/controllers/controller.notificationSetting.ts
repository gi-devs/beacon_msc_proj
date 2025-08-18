import { NextFunction, Response, Request } from 'express';
import { notificationSettingService } from '@/services/service.notificationSetting';
import { UserPayload } from '@beacon/types';

async function getByUserId(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const decoded = req.user as UserPayload;
  const userId = decoded.userId;

  try {
    const notificationSetting =
      await notificationSettingService.fetchUserNotificationSetting(userId);
    res.status(200).json(notificationSetting);
  } catch (e) {
    next(e);
  }
}

async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const decoded = req.user as UserPayload;
  const userId = decoded.userId;
  const data = req.body;

  try {
    const notificationSetting =
      await notificationSettingService.createUserNotificationSetting(
        data,
        userId,
      );
    res.status(201).json(notificationSetting);
  } catch (e) {
    next(e);
  }
}

async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const decoded = req.user as UserPayload;
  const userId = decoded.userId;
  const data = req.body;

  try {
    const notificationSetting =
      await notificationSettingService.updateUserNotificationSetting(
        userId,
        data,
      );
    res.status(200).json(notificationSetting);
  } catch (e) {
    next(e);
  }
}

export const notificationSettingController = {
  create,
  getByUserId,
  update,
};
