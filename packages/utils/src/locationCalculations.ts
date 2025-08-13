import { decodeGeohash } from './geohash';

const EARTH_RADIUS = 6371000; // Earth radius in meters
const toRadius = (deg: number) => (deg * Math.PI) / 180;

export const checkIfGeohashesAreWithinDistance = (
  geohash1: string,
  geohash2: string,
  distance: number, // in meters
): boolean => {
  if (geohash1 == geohash2) return true;

  const { latitude: lat1, longitude: lon1 } = decodeGeohash(geohash1);
  const { latitude: lat2, longitude: lon2 } = decodeGeohash(geohash2);

  const dLat = toRadius(lat2 - lat1);
  const dLon = toRadius(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadius(lat1)) *
      Math.cos(toRadius(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const actualDistance = EARTH_RADIUS * c;

  return actualDistance <= distance;
};
