import { faker } from '@faker-js/faker';
import prisma from '@/lib/prisma';
import { normaliseDate } from '@/utils/dates';
import { BeaconReplyTextKey } from '@beacon/types';
import roomNames from '@/data/roomNames.json';
import {
  activeConfigs,
  expiredConfigs,
  fixedUsers,
} from '@/scripts/seed/constants';
import { decodeGeohash } from '@beacon/utils';

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBool(probability = 0.5) {
  if (probability == 0) return false;
  if (probability == 1) return true;

  return Math.random() < probability;
}

function randomTimeBetween(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function randomReplyKey() {
  const keys = ['generic', 'anxious', 'stress', 'sad'];

  return keys[Math.floor(Math.random() * keys.length)] as BeaconReplyTextKey;
}

export async function seedDummyUserData() {
  const now = Date.now();
  const today = normaliseDate(new Date());
  const users = await prisma.user.findMany({
    select: { id: true, username: true },
  });

  for (const user of users) {
    // --- MoodLog + DailyCheckIn ---
    const moodLogsToMake = randInt(3, 10);
    const moodLogsData = Array.from({ length: moodLogsToMake }, () => ({
      userId: user.id,
      stressScale: randInt(10, 80),
      anxietyScale: randInt(10, 80),
      sadnessScale: randInt(10, 80),
      stressNote: faker.lorem.sentence(),
      anxietyNote: faker.lorem.sentence(),
      sadnessNote: faker.lorem.sentence(),
    }));

    await prisma.moodLog.createMany({ data: moodLogsData });

    const moodLogs = await prisma.moodLog.findMany({
      where: { userId: user.id },
    });

    const over50 = moodLogs.filter(
      (log) => (log.stressScale + log.anxietyScale + log.sadnessScale) / 3 > 50,
    );

    if (over50.length > 0) {
      const dateNormalised = normaliseDate(new Date());
      await prisma.dailyCheckIn.create({
        data: {
          userId: user.id,
          moodLogId: over50[0].id,
          broadcasted: true,
          createdAt: new Date(),
          date: dateNormalised,
        },
      });
    }

    const journalsToMake = randInt(1, 5);
    const linkableMoodLogs = moodLogs.slice(0, journalsToMake);
    for (let i = 0; i < journalsToMake; i++) {
      await prisma.journalEntry.create({
        data: {
          title: faker.company.catchPhrase(),
          content: faker.lorem.paragraph(),
          moodFace: randInt(1, 100),
          userId: user.id,
          moodLogId: linkableMoodLogs[i]?.id,
        },
      });
    }
  }

  // --- Beacons ---
  const checkIns = await prisma.dailyCheckIn.findMany();
  for (const c of checkIns) {
    const expiresAt = randomTimeBetween(
      new Date(now - 1000 * 60 * 60),
      new Date(now + 1000 * 60 * 60 * 6),
    );
    const createdAt = new Date(expiresAt.getTime() - 1000 * 60 * 60 * 6);

    await prisma.beacon.create({
      data: {
        userId: c.userId,
        dailyCheckInDate: c.date,
        expiresAt: expiresAt, // 6 hrs later
        active: expiresAt > new Date(),
        createdAt,
      },
    });
  }

  // --- Beacon Notifications + Replies ---
  const beacons = await prisma.beacon.findMany({
    include: { user: true },
  });
  for (const beacon of beacons) {
    // pick 2 other users to notify
    const otherUsers = users.filter((u) => u.id !== beacon.userId).slice(0, 2);
    const isExpired = beacon.expiresAt < new Date();

    for (const user of otherUsers) {
      const notif = await prisma.beaconNotification.create({
        data: {
          userId: user.id,
          beaconId: beacon.id,
          status: isExpired ? 'EXPIRED' : 'SENT',
          notifiedAt: new Date(),
        },
      });

      if (isExpired) continue;

      if (randomBool(0.4)) {
        await prisma.beaconReply.create({
          data: {
            beaconId: beacon.id,
            replierId: user.id,
            replyTextKey: randomReplyKey(),
            replyTextId: randInt(1, 10),
          },
        });

        // update notif to REPLIED
        await prisma.beaconNotification.update({
          where: {
            userId_beaconId: { userId: user.id, beaconId: beacon.id },
          },
          data: { status: 'REPLIED' },
        });
      }
    }
  }

  console.log('Dummy user data seeded!');
}

function distributeEvenly<T>(arr: T[], numGroups: number): T[][] {
  const groups: T[][] = Array.from({ length: numGroups }, () => []);
  arr.forEach((item, idx) => {
    groups[idx % numGroups].push(item);
  });
  return groups;
}

export async function seedCommunityRooms() {
  const users = await prisma.user.findMany({
    include: {
      LocationSetting: true,
    },
  });

  const shuffledUsers = faker.helpers.shuffle(users);

  const expiredGroups = distributeEvenly(shuffledUsers, expiredConfigs.length);
  const activeGroups = distributeEvenly(shuffledUsers, activeConfigs.length);

  for (let i = 0; i < expiredConfigs.length; i++) {
    const config = expiredConfigs[i];
    const members = expiredGroups[i];
    const expireTime = config.expiresAt.getTime();
    const { latitude, longitude } = decodeGeohash(
      members[0].LocationSetting?.geohash || 'gcuvy7gh',
    );

    const room = await prisma.communityRoom.create({
      data: {
        roomName: faker.helpers.arrayElement(roomNames),
        expiresAt: config.expiresAt,
        members: { connect: members.map((u) => ({ id: u.id })) },
      },
    });

    await prisma.communityRoomLocation.create({
      data: {
        roomId: room.id,
        latitude,
        longitude,
        geohash: members[0].LocationSetting?.geohash || 'gcuvy7gh',
      },
    });

    for (const user of members) {
      // random number of post between 1-5
      const numPosts = randInt(1, 5);
      // random time between expiresAt -7 days to expiresAt -1 day
      const postTime = randomTimeBetween(
        new Date(expireTime - 1000 * 60 * 60 * 24 * 7),
        new Date(expireTime - 1000 * 60 * 60 * 24 * 1),
      );

      for (let j = 0; j < numPosts; j++) {
        await prisma.communityRoomPost.create({
          data: {
            roomId: room.id,
            postUserId: user.id,
            title: faker.lorem.words(3),
            content: faker.lorem.sentences(2),
            moodFace: randInt(1, 100),
            createdAt: postTime,
          },
        });
      }
    }

    console.log(
      `Created ${config.type} room "${room.roomName}" with ${members.length} members.`,
    );
  }

  // Create active rooms
  for (let i = 0; i < activeConfigs.length; i++) {
    const config = activeConfigs[i];
    const members = activeGroups[i];
    const expireTime = config.expiresAt.getTime();
    const { latitude, longitude } = decodeGeohash(
      members[0].LocationSetting?.geohash || 'gcuvy7gh',
    );

    const room = await prisma.communityRoom.create({
      data: {
        roomName: faker.helpers.arrayElement(roomNames),
        expiresAt: config.expiresAt,
        members: { connect: members.map((u) => ({ id: u.id })) },
      },
    });

    await prisma.communityRoomLocation.create({
      data: {
        roomId: room.id,
        latitude,
        longitude,
        geohash: members[0].LocationSetting?.geohash || 'gcuvy7gh',
      },
    });

    for (const user of members) {
      // random number of post between 1-5
      const numPosts = randInt(1, 5);
      // random time between expiresAt -7 days to now
      const postTime = randomTimeBetween(
        new Date(expireTime - 1000 * 60 * 60 * 24 * 7),
        new Date(),
      );

      for (let j = 0; j < numPosts; j++) {
        await prisma.communityRoomPost.create({
          data: {
            roomId: room.id,
            postUserId: user.id,
            title: faker.lorem.words(3),
            content: faker.lorem.sentences(2),
            moodFace: randInt(1, 100),
            createdAt: postTime,
          },
        });
      }
    }

    console.log(
      `Created ${config.type} room "${room.roomName}" with ${members.length} members.`,
    );
  }
}

export async function seedResetData() {
  console.log('Clearing old data...');
  const fixedIds = fixedUsers.map((u) => u.id);

  await prisma.beaconReply.deleteMany({});
  await prisma.beaconNotification.deleteMany({});
  await prisma.beacon.deleteMany({});
  await prisma.dailyCheckIn.deleteMany({});
  await prisma.journalEntry.deleteMany({});
  await prisma.moodLog.deleteMany({});
  await prisma.communityRoomPost.deleteMany({});
  await prisma.communityRoomLocation.deleteMany({});
  await prisma.communityRoom.deleteMany({});
  await prisma.session.deleteMany({
    where: { userId: { notIn: fixedIds } },
  });
  await prisma.pushToken.deleteMany({
    where: { userId: { notIn: fixedIds } },
  });
  await prisma.user.deleteMany({
    where: {
      id: { notIn: fixedUsers.map((u) => u.id) },
    },
  });
  await prisma.locationSetting.deleteMany({
    where: { userId: { notIn: fixedIds } },
  });
  await prisma.notificationSetting.deleteMany({
    where: { userId: { notIn: fixedIds } },
  });

  console.log('Cleared all data except users + settings');
}
