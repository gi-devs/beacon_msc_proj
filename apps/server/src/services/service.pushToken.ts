import { getUserById } from '@/models/model.user';
import { CustomError } from '@/utils/custom-error';
import {
  createPushToken,
  getPushTokenByUserId,
  updatePushToken,
} from '@/models/model.pushToken';

/**
 * Syncs the push token for a user.
 * it either creates a new push token or updates the existing one.
 * - if creating a new push token, it returns true.
 * - if updating an existing push token, it returns false.
 */
async function syncPushToken(data: {
  userId: string;
  pushToken: string;
}): Promise<boolean> {
  // * checks user id from jwt
  const { userId, pushToken } = data;

  if (!userId || !pushToken) {
    throw new CustomError('User ID and push token are required', 400);
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  // Check if the push token already exists for the user
  const existingToken = await getPushTokenByUserId(userId);

  if (existingToken) {
    // Update the existing push token if it has changed
    if (existingToken.token !== pushToken) {
      await updatePushToken(userId, pushToken);
      // Return false for update
      return false;
    }
    // If the token is the same, no action is needed
    return false;
  } else {
    await createPushToken(userId, pushToken);
    // Return true for create
    return true;
  }
}

export const pushTokenService = {
  syncPushToken,
};
