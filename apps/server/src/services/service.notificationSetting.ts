import {
  createNotificationSetting,
  getNotificationSettingByUserId,
  updateNotificationSettingByUserId,
} from '@/models/model.notificationSetting';
import { CustomError } from '@/utils/custom-error';
import { handleZodError } from '@/utils/handle-zod-error';
import { getUserById } from '@/models/model.user';
import {
  CreateNotificationSettingData,
  createNotificationSettingSchema,
} from '@beacon/validation';

async function fetchUserNotificationSetting(userId: string) {
  const notificationSetting = await getNotificationSettingByUserId(userId);

  if (!notificationSetting) {
    throw new CustomError('Notification setting not found for this user', 404);
  }

  return notificationSetting;
}

async function createUserNotificationSetting(
  data: CreateNotificationSettingData,
  userId: string,
) {
  let parsedData;

  try {
    parsedData = createNotificationSettingSchema.parse(data);
  } catch (e) {
    handleZodError(e);
  }

  if (!parsedData) {
    throw new CustomError(
      'Invalid data provided for creating notification setting',
      400,
    );
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  const notificationSetting = await getNotificationSettingByUserId(userId);

  if (notificationSetting) {
    throw new CustomError(
      'Notification setting already exists for this user',
      400,
    );
  }

  return await createNotificationSetting({
    ...parsedData,
    user: {
      connect: { id: userId },
    },
  });
}

async function updateUserNotificationSetting(
  userId: string,
  data: Partial<CreateNotificationSettingData>,
) {
  let parsedData;
  try {
    parsedData = createNotificationSettingSchema.partial().parse(data);
  } catch (e) {
    handleZodError(e);
  }

  if (!parsedData) {
    throw new CustomError(
      'Invalid data provided for updating notification setting',
      400,
    );
  }

  const notificationSetting = await getNotificationSettingByUserId(userId);
  if (!notificationSetting) {
    // create a new notification setting if it does not exist
    return await createNotificationSetting({
      ...parsedData,
      user: {
        connect: { id: userId },
      },
    });
  }

  return await updateNotificationSettingByUserId(userId, {
    ...parsedData,
  });
}

async function deleteUserLocationSetting(userId: string) {
  // This function is a placeholder for deleting notification settings by user ID.
  // Currently, it does not perform any operations.
  return;
}

export const notificationSettingService = {
  fetchUserNotificationSetting,
  createUserNotificationSetting,
  updateUserNotificationSetting,
  deleteUserLocationSetting,
};
