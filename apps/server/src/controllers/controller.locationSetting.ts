import { NextFunction, Response, Request } from 'express';
import { locationSettingService } from '@/services/service.locationSetting';

async function getByUserId(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const decoded = req.user as UserPayload;
  const userId = decoded.userId;

  try {
    const locationSetting =
      await locationSettingService.fetchUserLocationSetting(userId);
    res.status(200).json(locationSetting);
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
    const locationSetting =
      await locationSettingService.createUserLocationSetting(data, userId);
    res.status(201).json(locationSetting);
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
    const locationSetting =
      await locationSettingService.updateUserLocationSetting(userId, data);
    res.status(200).json(locationSetting);
  } catch (e) {
    next(e);
  }
}

// ! ---------------
// ! For Testing
// ! ---------------
async function getIntersectingUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const usersAndLocations =
      await locationSettingService.fetchIntersectingUsers();
    res.status(200).json(usersAndLocations);
  } catch (e) {
    next(e);
  }
}

export const locationSettingController = {
  create,
  getByUserId,
  update,
  getIntersectingUsers,
};
