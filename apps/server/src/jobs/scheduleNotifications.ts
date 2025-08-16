import prisma from '@/lib/prisma';
import {
  boundingBox,
  decodeGeohash,
  getDistanceFromGeohashes,
  getGeohashesOfBoundingBox,
} from '@beacon/utils';

export async function scheduleNotificationsForBeacons() {
  // This function is intended to be run periodically to check for beacons
  console.log('[scheduleNotificationsForBeacons] Scheduling Notifications....');
  const now = new Date();

  // * Fetch all active beacons with their user and location settings
  const beacons = await prisma.beacon.findMany({
    where: {
      OR: [
        {
          expiresAt: {
            gt: now,
          },
        },
        {
          active: true,
        },
      ],
      active: true,
      expiresAt: {
        gt: now,
      },
      user: {
        LocationSetting: {
          geohash: { not: null },
        },
      },
    },
    include: {
      user: {
        include: {
          LocationSetting: { select: { geohash: true, beaconRadius: true } },
        },
      },
    },
  });

  // * If no beacons are found, log and return early
  if (beacons.length === 0) {
    console.log('[scheduleNotificationsForBeacons] No active beacons found.');
    return;
  }

  // * Filter beacons to ensure they have valid geohash and beaconRadius
  const validBeacons: (typeof beacons)[number][] = [];
  // * Create a map to hold beacons and their corresponding geohashes
  const mapOfBeaconsToGeohashes = new Map<number, Set<string>>();
  // * Create a set to hold all unique geohashes from ALL beacons
  const setOfAllGeohashes = new Set<string>();

  // * Loop through each beacon to extract geohashes of their bounding boxes based on their owner users location settings
  for (const beacon of beacons) {
    if (!beacon.user?.LocationSetting) {
      console.log(
        `[scheduleNotificationsForBeacons] Beacon ${beacon.id} has no user or LocationSetting.`,
      );
      continue;
    }

    const { geohash, beaconRadius } = beacon.user.LocationSetting;

    if (!geohash || !beaconRadius) {
      console.log(
        `[scheduleNotificationsForBeacons] Beacon ${beacon.id} has no geohash or beaconRadius.`,
      );
      continue;
    }

    const decodedGeohash = decodeGeohash(geohash);
    const boundingBoxCoords = boundingBox(
      decodedGeohash.latitude,
      decodedGeohash.longitude,
      beaconRadius,
    );

    const geohashes = getGeohashesOfBoundingBox(boundingBoxCoords);

    // * If no geohashes are found for the beacon, log and continue to the next beacon
    if (geohashes.length === 0) {
      console.log(
        `[scheduleNotificationsForBeacons] No prefixes found for beacon ${beacon.id}.`,
      );

      continue;
    }

    // * Add the geohashes to the set of all geohashes and map them to the beacon ID
    for (const geohash of geohashes) {
      setOfAllGeohashes.add(geohash);
    }
    mapOfBeaconsToGeohashes.set(beacon.id, new Set(geohashes));
    validBeacons.push(beacon);
  }

  // * If no valid beacons are found, log and return early
  if (setOfAllGeohashes.size === 0) {
    console.log(
      '[scheduleNotificationsForBeacons] No prefixes found for beacons.',
    );
    return;
  }

  // * Fetch all active users who have a location and push notifications enabled and have a geohash in the set of all geohashes
  const activeUsersInSetOfGeohashes = await getAllActiveUsersInGeohashes(
    setOfAllGeohashes,
    now,
  );

  // * filter only users who have not reached their max beacon notifications
  const validUsersInGeohashes = activeUsersInSetOfGeohashes.filter((user) => {
    return (
      user.beaconNotification.length < user.NotificationSetting!.maxBeaconPushes
    );
  });

  // * create a map to track which users have been notified for each beacon already today
  const usersHaveBeenNotifiedByBeacon = new Map<string, Set<number>>();
  for (const u of validUsersInGeohashes) {
    usersHaveBeenNotifiedByBeacon.set(
      u.id,
      new Set(u.beaconNotification.map((n) => n.beaconId)),
    );
  }

  // * Map to hold beacons and their corresponding users in range
  const mapOfBeaconsAndUsers = new Map<number, typeof validUsersInGeohashes>();

  for (const beacon of validBeacons) {
    const beaconGeohashSet = mapOfBeaconsToGeohashes.get(beacon.id);
    if (!beaconGeohashSet) {
      console.log(
        `[scheduleNotificationsForBeacons] No prefixes for beacon ${beacon.id}.`,
      );
      continue;
    }

    const { geohash: beaconGeohash, beaconRadius } =
      beacon.user.LocationSetting!;

    const usersInRange: typeof validUsersInGeohashes = [];
    for (const user of validUsersInGeohashes) {
      // * skip users who have already been notified for this beacon today
      if (usersHaveBeenNotifiedByBeacon.get(user.id)?.has(beacon.id)) continue;
      // * skip the beacon's owner user
      if (user.id === beacon.userId) continue;

      const { geohash: userGeohash, beaconRadius: userRadius } =
        user.LocationSetting!;

      // * skip users whos geohash is not in the beacon's geohash set
      if (!beaconGeohashSet.has(userGeohash!)) continue;

      // * get the distance between the beacon and user geohashes
      const distance = getDistanceFromGeohashes(beaconGeohash!, userGeohash!);

      // * only add users who are within the beacon's radius and the user's radius
      // ! implied that user is in range of the beacon as filter using bounding box
      // ! but defining the check to ensure accuracy
      if (distance <= userRadius && distance <= beaconRadius) {
        usersInRange.push(user);
      }
    }

    mapOfBeaconsAndUsers.set(beacon.id, usersInRange);
  }

  console.log(mapOfBeaconsAndUsers); // ! Debugging output

  // -------- LOGIC TO ASSIGN USERS TO BEACONS ----------

  const userNotifCount = new Map<string, number>();
  validUsersInGeohashes.forEach((u) => {
    userNotifCount.set(u.id, u._count.beaconNotification);
  });

  // ! Final assignment: beaconId -> [usernames]
  const mapOfUsersToNotifyOfBeacons = new Map<number, string[]>();

  function sortClosestUsers(
    a: (typeof validUsersInGeohashes)[number],
    b: (typeof validUsersInGeohashes)[number],
    beaconId: number,
  ): number {
    const distA = getDistanceFromGeohashes(
      validBeacons.find((bc) => bc.id === beaconId)!.user.LocationSetting!
        .geohash!,
      a.LocationSetting!.geohash!,
    );

    const distB = getDistanceFromGeohashes(
      validBeacons.find((bc) => bc.id === beaconId)!.user.LocationSetting!
        .geohash!,
      b.LocationSetting!.geohash!,
    );

    return distA - distB;
  }

  // ! Step 1: Assign users who are only in one beacon
  for (const [beaconId, users] of mapOfBeaconsAndUsers.entries()) {
    const uniqueUsers = users.filter((user) => {
      const appearances = Array.from(mapOfBeaconsAndUsers.values()).filter(
        (arr) => arr.some((u) => u.id === user.id),
      ).length;

      return appearances === 1; // only in one beacon
    });

    if (uniqueUsers.length > 0) {
      // * pick the closest user in unique ones
      uniqueUsers.sort((a, b) => sortClosestUsers(a, b, beaconId));

      const chosen = uniqueUsers[0];
      if (
        userNotifCount.get(chosen.id)! <
        chosen.NotificationSetting!.maxBeaconPushes
      ) {
        mapOfUsersToNotifyOfBeacons.set(beaconId, [chosen.id]);
        userNotifCount.set(chosen.id, userNotifCount.get(chosen.id)! + 1);
      }
    }
  }

  // ! Step 2: Assign users who are in multiple beacons (one user per beacon)
  for (const [beaconId, users] of mapOfBeaconsAndUsers.entries()) {
    if (mapOfUsersToNotifyOfBeacons.has(beaconId)) continue; // already has a user

    // * users who are still under their daily max
    const availableUsers = users.filter(
      (user) =>
        (userNotifCount.get(user.id) ?? 0) <
        user.NotificationSetting!.maxBeaconPushes,
    );

    if (availableUsers.length === 0) continue;

    // * sort by distance to beacon
    availableUsers.sort((a, b) => sortClosestUsers(a, b, beaconId));

    const chosen = availableUsers[0];
    mapOfUsersToNotifyOfBeacons.set(beaconId, [chosen.id]);
    userNotifCount.set(chosen.id, userNotifCount.get(chosen.id)! + 1);
  }

  // ! Step 3: Assign remaining available users to beacons (multi-assign allowed)
  for (const [beaconId, users] of mapOfBeaconsAndUsers.entries()) {
    const assigned = mapOfUsersToNotifyOfBeacons.get(beaconId) ?? []; // already assigned users

    // * users who are still under their daily max
    const availableExtraUsers = users.filter(
      (user) =>
        (userNotifCount.get(user.id) ?? 0) <
          user.NotificationSetting!.maxBeaconPushes &&
        !assigned.includes(user.id), // avoid duplicates
    );

    availableExtraUsers.sort((a, b) => sortClosestUsers(a, b, beaconId));

    for (const user of availableExtraUsers) {
      assigned.push(user.id);
      userNotifCount.set(user.id, userNotifCount.get(user.id)! + 1);
    }

    mapOfUsersToNotifyOfBeacons.set(beaconId, assigned);
  }

  console.log('Final assignments:', mapOfUsersToNotifyOfBeacons);

  await Promise.all(
    Array.from(mapOfUsersToNotifyOfBeacons.entries()).map(
      async ([beaconId, userIds]) => {
        // * Create notifications for each user assigned to the beacon
        const notifications = userIds.map((userId) => ({
          userId,
          beaconId,
          createdAt: now,
        }));

        // * Save notifications in the database
        if (notifications.length === 0) {
          console.log(
            `[scheduleNotificationsForBeacons] No notifications to create for beacon ${beaconId}.`,
          );
          return;
        }
        await prisma.beaconNotification.createMany({
          data: notifications,
        });

        console.log(
          `[scheduleNotificationsForBeacons] Created notifications for beacon ${beaconId} for users: ${userIds.join(', ')}`,
        );
      },
    ),
  );

  // * any beacon which is going to expire in the next 5 minutes should be updated to active = false
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  await prisma.beacon.updateMany({
    where: {
      active: true,
      expiresAt: {
        lte: fiveMinutesFromNow,
      },
    },
    data: {
      active: false,
    },
  });

  console.log(
    '[scheduleNotificationsForBeacons] Notifications scheduled successfully.',
  );
}

export async function sendNotificationsForBeacons() {
  // ---------- RULES -----------
  // 1. If a beacon is active, it can send notifications to users.
  // 2. Users can only receive a beacon notification if they have not reached their maxBeaconPushes for the day.
  // 3. Any notification created for a user should be sent within their push interval.
  // ---------- LOGIC -----------
  // 1. Want to send notifications for beacons with the least amount of notifications sent first.
  // 2. Get the notification for beacons using the BeaconNotification model.

  // * get all unNotified beaconNotifications for today
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  ); // ? might need

  const unNotifiedBeaconNotifications =
    await prisma.beaconNotification.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
        },
        notifiedAt: {
          equals: null, // only get notifications that have not been notified yet
        },
      },
      include: {
        user: {
          include: {
            NotificationSetting: true,
          },
        },
      },
    });

  if (unNotifiedBeaconNotifications.length === 0) {
    console.log(
      '[sendNotificationsForBeacons] No unnotified beaconNotifications found.',
    );
    return;
  }

  const beaconsToUsersMap = new Map<
    number,
    Set<(typeof unNotifiedBeaconNotifications)[number]['user']>
  >();

  for (const notification of unNotifiedBeaconNotifications) {
    const beaconId = notification.beaconId;
    if (!beaconsToUsersMap.has(beaconId)) {
      beaconsToUsersMap.set(beaconId, new Set());
    }
    beaconsToUsersMap.get(beaconId)!.add(notification.user);
  }

  console.log(beaconsToUsersMap);
}

async function getAllActiveUsersInGeohashes(
  setOfAllGeohashes: Set<string>,
  now: Date,
) {
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return prisma.user.findMany({
    where: {
      LocationSetting: {
        geohash: {
          in: Array.from(setOfAllGeohashes),
        },
      },
      NotificationSetting: {
        push: true,
      },
    },
    select: {
      id: true,
      username: true,
      LocationSetting: {
        select: {
          geohash: true,
          beaconRadius: true,
        },
      },
      beaconNotification: {
        where: {
          createdAt: {
            gte: startOfDay,
          },
        },
        select: {
          beaconId: true,
        },
      },
      NotificationSetting: {
        select: {
          maxBeaconPushes: true,
          push: true,
        },
      },
      _count: {
        select: {
          beaconNotification: {
            where: {
              createdAt: {
                gte: startOfDay,
              },
            },
          },
        },
      },
    },
  });
}
