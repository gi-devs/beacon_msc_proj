import {
  createLocationSetting,
  getLocationSettingByUserId,
  updateLocationSettingByUserId,
} from '@/models/model.locationSetting';
import {
  CreateLocationSettingData,
  createLocationSettingSchema,
} from '@beacon/validation';
import { handleZodError } from '@/utils/handle-zod-error';
import { CustomError } from '@/utils/custom-error';
import { getUserById } from '@/models/model.user';

async function fetchUserLocationSetting(userId: string) {
  const locationSetting = await getLocationSettingByUserId(userId);

  if (!locationSetting) {
    throw new CustomError('Location setting not found for this user', 404);
  }

  return locationSetting;
}

async function createUserLocationSetting(
  data: CreateLocationSettingData,
  userId: string,
) {
  let parsedData;

  try {
    parsedData = createLocationSettingSchema.parse(data);
  } catch (e) {
    handleZodError(e);
  }

  if (!parsedData) {
    throw new CustomError(
      'Invalid data provided for creating location setting',
      400,
    );
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  const locationSetting = await getLocationSettingByUserId(userId);

  if (locationSetting) {
    throw new CustomError('Location setting already exists for this user', 400);
  }

  return await createLocationSetting({
    ...parsedData,
    user: {
      connect: { id: userId },
    },
  });
}

async function updateUserLocationSetting(
  userId: string,
  data: Partial<CreateLocationSettingData>,
) {
  let parsedData;
  try {
    parsedData = createLocationSettingSchema.partial().parse(data);
  } catch (e) {
    handleZodError(e);
  }

  if (!parsedData) {
    throw new CustomError(
      'Invalid data provided for updating location setting',
      400,
    );
  }

  const locationSetting = await getLocationSettingByUserId(userId);
  if (!locationSetting) {
    // create a new location setting if it does not exist
    return await createLocationSetting({
      ...parsedData,
      user: {
        connect: { id: userId },
      },
    });
  }

  return await updateLocationSettingByUserId(userId, {
    ...parsedData,
  });
}

async function deleteUserLocationSetting(userId: string) {
  // This function is a placeholder for deleting location settings by user ID.
  // Currently, it does not perform any operations.
  return;
}

export const locationSettingService = {
  fetchUserLocationSetting,
  createUserLocationSetting,
  updateUserLocationSetting,
  deleteUserLocationSetting,
};
