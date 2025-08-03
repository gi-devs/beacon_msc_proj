import { NextFunction, Request, Response } from 'express';
import { pushTokenService } from '@/services/service.pushToken';

async function sync(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const decoded = req.user as UserPayload;
    const userId = decoded.userId;
    const { pushToken } = req.body;

    const hasCreated = await pushTokenService.syncPushToken({
      userId,
      pushToken,
    });

    const statusCode = hasCreated ? 201 : 200;
    const message = hasCreated
      ? 'Push token created successfully'
      : 'Push token updated successfully';

    res.status(statusCode).json({ message });
  } catch (e) {
    next(e);
  }
}

export const pushTokenController = {
  sync,
};
