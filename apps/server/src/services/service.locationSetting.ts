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
import {
  getAllUsersAndLocationSettings,
  getUserById,
} from '@/models/model.user';
import {
  decodeGeohash,
  encodeGeohash,
  getDistanceFromGeohashes,
} from '@beacon/utils';

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

// ! ---------------
// ! For Testing
// ! ---------------
async function fetchIntersectingUsers() {
  const data = await getAllUsersAndLocationSettings();

  const users = data
    .filter((u) => u.LocationSetting?.geohash)
    .map((u) => {
      const { latitude, longitude } = decodeGeohash(
        u.LocationSetting!.geohash!,
      );
      return {
        id: u.id,
        email: u.email,
        username: u.username,
        lat: latitude,
        lon: longitude,
        geohash: u.LocationSetting!.geohash!,
        radius: u.LocationSetting!.beaconRadius, // meters
      };
    });

  const mutualMap: Record<string, string[]> = {};

  for (let i = 0; i < users.length; i++) {
    const u1 = users[i];
    mutualMap[u1.username] = [];

    for (let j = 0; j < users.length; j++) {
      if (i === j) continue;
      const u2 = users[j];

      const distance = getDistanceFromGeohashes(u1.geohash, u2.geohash);

      const u1ContainsU2 = distance <= u1.radius;
      const u2ContainsU1 = distance <= u2.radius;

      if (u1ContainsU2 && u2ContainsU1) {
        mutualMap[u1.username].push(
          `${u2.username} - (${distance.toFixed(2)}m)`,
        );
      }
    }
  }

  return mutualMap;
}

export const locationSettingService = {
  fetchUserLocationSetting,
  createUserLocationSetting,
  updateUserLocationSetting,
  deleteUserLocationSetting,
  fetchIntersectingUsers,
};
