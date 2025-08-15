import dotenv from 'dotenv';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.resolve(__dirname, '../../../../.env.development'),
    quiet: true,
  });
}

import prisma from '../lib/prisma';
import { encodeGeohash } from '@beacon/utils';

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

const dummyUserLocationSettings: Record<
  string,
  { geohash: string; radius: number }
> = {
  dummy7: { geohash: 'gcuvy7gh', radius: 500 },
  dummy6: { geohash: 'gcuvysvb', radius: 500 },
  dummy5: { geohash: 'gcuvyebj', radius: 500 },
  dummy4: { geohash: 'gcuvyss3', radius: 500 },
  dummy3: { geohash: 'gcuvy5wz', radius: 500 },
  dummy2: { geohash: 'gcuvyknr', radius: 500 },
  dummy1: { geohash: 'gcuvykzt', radius: 500 },
};

async function main() {
  // Your 3 provided users
  const fixedUsers = [
    {
      id: 'cmdmdvby00000fd65z35q7fm5',
      email: 'geraldine@mail.com',
      createdAt: new Date('2025-07-28T00:42:13.175Z'),
      isEmailVerified: false,
      password: '$2b$10$ocSnSlsBsCoje4q138FD/.oIW4enZVJ1ZZ9FdsO0Xc5T7t3cGf0PK',
      updatedAt: new Date('2025-07-28T00:42:13.175Z'),
      username: 'gerri',
    },
    {
      id: 'cmdvz9f640002fdmsn07esoxl',
      email: 'test@mail.com',
      createdAt: new Date('2025-08-03T17:50:58.060Z'),
      isEmailVerified: false,
      password: '$2b$10$1wb5ra6nhWjCsNQQUSCD3uXpbjfUQt2JL62cHJx6aOWdB7jDzcCLi',
      updatedAt: new Date('2025-08-03T17:50:58.060Z'),
      username: 'Tester',
    },
    {
      id: 'cme3ht99f0000fdo16t5ydaq5',
      email: 'httpuser@mail.com',
      createdAt: new Date('2025-08-09T00:04:39.843Z'),
      isEmailVerified: false,
      password: '$2b$10$nFOchhb3S32M3Jithbp/GOiGcZ5zhOnHIu7lUoCh1EAE5Xw6bnzM.',
      updatedAt: new Date('2025-08-09T00:04:39.843Z'),
      username: 'HttpUser',
    },
  ];

  const sharedPasswordHash = fixedUsers[0].password;

  console.log('🗑 Deleting all users except fixed...');
  await prisma.user.deleteMany({
    where: {
      id: { notIn: fixedUsers.map((u) => u.id) },
    },
  });

  console.log('👤 Inserting fixed users...');
  await prisma.user.createMany({
    data: fixedUsers,
    skipDuplicates: true,
  });

  console.log('👥 Inserting dummy users...');
  const dummyUsers = Array.from({ length: 7 }, (_, i) => ({
    email: `dummy${i + 1}@mail.com`,
    username: `dummy${i + 1}`,
    password: sharedPasswordHash,
    isEmailVerified: false,
  }));

  await prisma.user.createMany({
    data: dummyUsers,
    skipDuplicates: true,
  });

  console.log(
    '⚙️ Creating Notification & Location settings for non-fixed users...',
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
          beaconMinPushInterval: 7200, // 2 hours
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

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
