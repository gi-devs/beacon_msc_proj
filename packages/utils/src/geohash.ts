import geohash from 'ngeohash';

export function encodeGeohash(
  latitude: number,
  longitude: number,
  precision = 7,
): string {
  return geohash.encode(latitude, longitude, precision);
}

export function decodeGeohash(geohashString: string): {
  latitude: number;
  longitude: number;
  error: {
    latitude: number;
    longitude: number;
  };
} {
  const { latitude, longitude, error } = geohash.decode(geohashString);
  return { latitude, longitude, error };
}
