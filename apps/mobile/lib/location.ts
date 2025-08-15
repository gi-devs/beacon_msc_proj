import * as Location from 'expo-location';
import {
  checkIfGeohashesAreWithinDistance,
  encodeGeohash,
} from '@beacon/utils';
import { AsyncItemKey, getAsyncItem, saveAsyncItem } from '@/lib/aysncStorage';
import { updateLocationSettingRequest } from '@/api/locationSettingApi';
import { parseToSeverError } from '@/utils/parseToSeverError';

export async function requestLocationPermissions() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') {
    console.warn('Location permission granted');
    await pushLocationIfPermitted(true);
  }

  return status;
}

export async function pushLocationIfPermitted(granted: boolean) {
  // use check to ensure it's not called without permission
  if (!granted) {
    console.warn(
      '[location.ts] Location permission not granted, cannot push location',
    );
    return false;
  }
  try {
    const location = await getLocation();

    if (!location || !location.coords.latitude || !location.coords.longitude) {
      console.warn('[location.ts] No location data available');
      return false;
    }

    const geohashedLocation = encodeGeohash(
      location.coords.latitude,
      location.coords.longitude,
    );

    const storedLocation = await getAsyncItem(AsyncItemKey.LastLocation);

    // check if the stored location is the same as the new one
    if (storedLocation == geohashedLocation) {
      console.log('[location.ts] Location has not changed, no update needed');
      return false;
    }

    // check distance
    if (storedLocation) {
      const withinDistance = checkIfGeohashesAreWithinDistance(
        storedLocation,
        geohashedLocation,
        50,
      );
      if (withinDistance) {
        console.log(
          '[location.ts] User is within 50m of last location, no update needed',
        );
        return false;
      }
    }
    // If we reach here, we need to update the location
    // Try to update on server - will handle creation if it doesn't exist
    await updateLocationSettingRequest({
      geohash: geohashedLocation,
    });
    // If update works, store the new location locally
    await saveAsyncItem(AsyncItemKey.LastLocation, geohashedLocation);
    console.log('[location.ts] Location updated successfully');
  } catch (e) {
    const error = parseToSeverError(e);
    console.log('Error updating location setting: ', error.message);
    return false;
  }

  return true;
}

export async function getLocationStatus() {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getLocation() {
  try {
    return await Location.getCurrentPositionAsync();
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}
