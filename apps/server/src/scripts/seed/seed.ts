import dotenv from 'dotenv';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.resolve(__dirname, '../../../../../.env.development'),
    quiet: true,
  });
}

import prisma from '@/lib/prisma';
import { encodeGeohash } from '@beacon/utils';
import {
  fixedUsers,
  sharedPasswordHash,
  dummyUsers,
  dummyUserLocationSettings,
} from './constants';
import {
  seedCommunityRooms,
  seedDummyUserData,
  seedResetData,
} from '@/scripts/seed/seed-helpers';

const BASE_LAT = 55.876893562570345;
const BASE_LON = -4.286377159029303;
const EARTH_RADIUS = 6378137; // meters

function randomNearbyGeohash50to1000m() {
  const distance = 50 + Math.random() * (1000 - 50);
  const bearing = Math.random() * 2 * Math.PI;

  const latOffset = (distance * Math.cos(bearing)) / EARTH_RADIUS;
  const lonOffset =
    (distance * Math.sin(bearing)) /
    (EARTH_RADIUS * Math.cos(BASE_LAT * (Math.PI / 180)));

  const newLat = BASE_LAT + (latOffset * 180) / Math.PI;
  const newLon = BASE_LON + (lonOffset * 180) / Math.PI;

  return encodeGeohash(newLat, newLon);
}

async function main() {
  console.log('Start Seeding...');
  await seedResetData();
  await createDummyUsers();
  await seedDummyUserData();
  await seedCommunityRooms();

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

async function createDummyUsers() {
  console.log('Inserting dummy users...');
  const dummyUsersToIns = dummyUsers.map((dummyUser, i) => {
    return {
      email: `dummy${i + 1}@mail.com`,
      username: dummyUser.username,
      password: sharedPasswordHash, // hashed password
      isEmailVerified: false,
    };
  });

  await prisma.user.createMany({
    data: dummyUsersToIns,
    skipDuplicates: true,
  });

  console.log(
    'Creating Notification & Location settings for non-fixed users...',
  );

  const allNonFixedUsers = await prisma.user.findMany({
    where: { id: { notIn: fixedUsers.map((u) => u.id) } },
    select: { id: true },
  });

  // Create NotificationSettings
  await Promise.all(
    allNonFixedUsers.map((u) =>
      prisma.notificationSetting.upsert({
        where: { userId: u.id },
        update: {},
        create: {
          userId: u.id,
          push: true,
          maxBeaconPushes: 3,
          minBeaconPushInterval: 7200, // 2 hours
        },
      }),
    ),
  );

  // Create LocationSettings with random geohashes
  await Promise.all(
    allNonFixedUsers.map(async (u) => {
      const user = await prisma.user.findUnique({
        where: { id: u.id },
        select: { username: true },
      });

      const fixedLoc = user ? dummyUserLocationSettings[user.username] : null;

      return prisma.locationSetting.upsert({
        where: { userId: u.id },
        update: {},
        create: {
          userId: u.id,
          geohash: fixedLoc ? fixedLoc.geohash : randomNearbyGeohash50to1000m(),
          beaconRadius: fixedLoc ? fixedLoc.radius : 500,
        },
      });
    }),
  );
}
