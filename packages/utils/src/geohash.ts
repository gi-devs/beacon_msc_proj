import geohash from 'ngeohash';

export function encodeGeohash(
  latitude: number,
  longitude: number,
  precision = 8,
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

export function getGeohashesOfBoundingBox(
  box: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  },
  precision = 8,
) {
  return geohash.bboxes(
    box.minLat,
    box.minLon,
    box.maxLat,
    box.maxLon,
    precision,
  );
}
