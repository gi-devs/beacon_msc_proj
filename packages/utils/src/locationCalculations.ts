import { decodeGeohash } from './geohash';

// Some of these functions were created with the help of AI (ChatGPT) and is based on the Haversine formula.
// Prompt used: 'write function which check if two geohash are within a certain distance in meters'
// Why was it used: My mathematics skills are not good enough to write this function,
// after attempts to write it myself, I decided to use AI to help me with this task.

const EARTH_RADIUS = 6371000; // Earth radius in meters
const toRadius = (deg: number) => (deg * Math.PI) / 180;

const haversineDistanceFromGeohashes = (
  geohash1: string,
  geohash2: string,
): number => {
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
  return EARTH_RADIUS * c; // in meters
};

export const checkIfGeohashesAreWithinDistance = (
  geohash1: string,
  geohash2: string,
  distance: number, // in meters
): boolean => {
  if (geohash1 == geohash2) return true;

  const actualDistance = haversineDistanceFromGeohashes(geohash1, geohash2);

  return actualDistance <= distance;
};

export function getDistanceFromGeohashes(
  geohash1: string,
  geohash2: string,
): number {
  if (geohash1 === geohash2) return 0;

  return haversineDistanceFromGeohashes(geohash1, geohash2);
}

// This was not created from AI
export function boundingBox(lat: number, lon: number, radius: number) {
  const latDelta = radius / 111320; // 1 deg per meter
  const lonDelta = radius / (111320 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
}
