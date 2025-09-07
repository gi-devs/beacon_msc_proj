// This file was assisted with the help of AI (CoPilot).
import prisma from '@/lib/prisma';
import {
  boundingBox,
  decodeGeohash,
  getDistanceFromGeohashes,
  getGeohashesOfBoundingBox,
} from '@beacon/utils';
import * as console from 'node:console';
import Expo from 'expo-server-sdk';
import { BeaconNotificationStatus, Prisma } from '@/generated/prisma';
import { BeaconPushNotificationData } from '@beacon/types';
import { normaliseDate } from '@/utils/dates';

type SafeBeaconNotification = Prisma.BeaconNotificationGetPayload<{
  include: {
    user: {
      include: {
        NotificationSetting: true;
        pushToken: true;
      };
    };
    beacon: {
      select: {
        id: true;
        active: true;
        expiresAt: true;
      };
    };
  };
}> & {
  user: {
    NotificationSetting: NonNullable<unknown>;
    pushToken: NonNullable<unknown>;
  };
};

export async function scheduleNotificationsForBeacons() {
  // This function is intended to be run periodically to check for beacons
  console.log('[scheduleNotificationsForBeacons] Scheduling Notifications....');
  const now = new Date();

  // * any beacon which is going to expire in the next 5 minutes should be updated to active = false
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  try {
    prisma.$transaction(async (tx) => {
      const expiredBeacons = await tx.beacon.updateMany({
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

      // update any pending notifications for these beacons to expired
      if (expiredBeacons.count > 0) {
        await tx.beaconNotification.updateMany({
          where: {
            beacon: {
              active: false,
            },
            status: {
              in: [
                BeaconNotificationStatus.PENDING,
                BeaconNotificationStatus.SENT_SILENTLY,
                BeaconNotificationStatus.SENT,
              ],
            },
          },
          data: {
            status: BeaconNotificationStatus.EXPIRED,
          },
        });
        console.log(
          `[scheduleNotificationsForBeacons] Marked ${expiredBeacons.count} beacons as expired and their pending notifications as EXPIRED.`,
        );
      }
    });
  } catch (e) {
    console.error(
      '[scheduleNotificationsForBeacons] Error updating expired beacons:',
      e,
    );
  }

  // * Fetch all active beacons with their user and location settings
  const beacons = await prisma.beacon.findMany({
    where: {
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
      _count: {
        select: {
          beaconNotification: {
            where: {
              createdAt: {
                gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
              },
              NOT: {
                status: {
                  in: [
                    BeaconNotificationStatus.CANCELLED,
                    BeaconNotificationStatus.DECLINED,
                  ],
                },
              },
            },
          },
        },
      },
    },
  });

  console.log(beacons);

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

  if (activeUsersInSetOfGeohashes.length === 0) {
    console.log(
      '[scheduleNotificationsForBeacons] No active users found in the geohashes of active beacons.',
    );
    return;
  }

  console.log(activeUsersInSetOfGeohashes);
  /*
   This validates users from the geohashes by filtering with the required rules.

   ------------- RULES -------------
   1. user must not have reached their max beacon notifications for the day
   2. Must not have be notified for any beacon within their minBeaconPushInterval
  */
  const validUsers = activeUsersInSetOfGeohashes.filter((user) => {
    // ----- SATISFIES RULE 1 -----

    const userMaxBeaconPushes = user.NotificationSetting!.maxBeaconPushes;
    const countWithoutCanceled =
      user._count.beaconNotification -
      user.beaconNotification.filter(
        (n) =>
          n.status === BeaconNotificationStatus.CANCELLED ||
          n.status === BeaconNotificationStatus.DECLINED,
      ).length;

    if (countWithoutCanceled >= userMaxBeaconPushes) {
      return false;
    }

    if (user._count.beaconNotification === 0) {
      return true; // no notifications yet, so they can receive a new one
    }

    // ----- SATISFIES RULE 2 -----

    const latestNotification = user.beaconNotification.reduce(
      (latest, current) => {
        // If latest has no notifiedAt, take current
        if (!latest.notifiedAt) return current;
        // If current has no notifiedAt, keep latest
        if (!current.notifiedAt) return latest;

        // Both have notifiedAt pick the later one
        return current.notifiedAt > latest.notifiedAt ? current : latest;
      },
    );

    // If latest notification has no notifiedAt, they can receive a new one
    if (!latestNotification.notifiedAt) {
      return true;
    }

    const timeSinceLastNotification =
      now.getTime() - latestNotification.notifiedAt.getTime();
    const userPushIntervalInMs =
      user.NotificationSetting!.minBeaconPushInterval * 1000; // convert to ms

    // If the latest notification is within the user's minBeaconPushInterval, skip this user
    return timeSinceLastNotification >= userPushIntervalInMs;
  });

  console.log('[scheduleNotificationsForBeacons] Valid users:', validUsers);

  // * create a map to track which users have been notified for each beacon already today
  const usersHaveBeenNotifiedByBeacon = new Map<string, Set<number>>();
  for (const u of validUsers) {
    usersHaveBeenNotifiedByBeacon.set(
      u.id,
      new Set(u.beaconNotification.map((n) => n.beaconId)),
    );
  }

  // * Map to hold beacons and their corresponding users in range
  const mapOfBeaconsAndUsers = new Map<number, typeof validUsers>();

  /*
   Validates users against the beacons.

   ------------- RULES -------------
   1. user must NOT have been notified for this beacon
   2. user must NOT be the beacon's owner
   3. user must be in the beacon's geohash set
   4. user must be within the beacon's radius and their own radius

   This populates the mapOfBeaconsAndUsers with all users [values]
   that are valid choices for the beacon [key].
  */
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

    const usersInRange: typeof validUsers = [];
    for (const user of validUsers) {
      // * skip users who have already been notified for this beacon today
      if (usersHaveBeenNotifiedByBeacon.get(user.id)?.has(beacon.id)) continue;
      // * skip the beacon's owner user
      if (user.id === beacon.userId) continue;

      const { geohash: userGeohash, beaconRadius: userRadius } =
        user.LocationSetting!;

      // * skip users who's geohash is not in the beacon's geohash set
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

  // log map but only show id and username of users
  console.log(
    JSON.stringify(
      Array.from(mapOfBeaconsAndUsers.entries()).map(([beaconId, users]) => ({
        beaconId,
        users: users.map((u) => ({ id: u.id, username: u.username })),
      })),
      null,
      2, // pretty-print with 2 spaces
    ),
  ); // ! Debugging output

  /*
    -------- LOGIC TO ASSIGN USERS TO BEACONS ----------
    Beacons will only be assigned one user at a time, this is to ensure
    that users are not overwhelmed with notifications and any notifications are
    received and responded to staggered throughout the beacon duration.

    ------------- RULES -------------
    1. if a beacon only has one user assigned to it, assign that user to the beacon.
      a. If user is in multiple beacons, check which beacon has had the most notifications sent today.
    2. If user is only in one beacon, assign them to that beacon.
      a. if multiple users are only in one beacon, sort them by distance to the beacon and assign the closest user.
    3. For remaining beacons, assign the user who is closest to the beacon
   */

  function sortClosestUsers(
    a: (typeof validUsers)[number],
    b: (typeof validUsers)[number],
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

  // ! might not be needed ------------
  const userNotifCount = new Map<string, number>();
  validUsers.forEach((u) => {
    userNotifCount.set(u.id, u._count.beaconNotification);
  });
  // ! --------------------------------

  // Final Assignment
  const mapOfUsersToNotifyOfBeacons = new Map<number, string>();
  // Track users assigned on this run
  const setOfAssignedOnRunUsers = new Set<string>();
  // Map of users in multiple beacons
  const mapOfUsersInMultipleBeacons = new Map<string, Set<number>>();
  for (const [beaconId, users] of mapOfBeaconsAndUsers.entries()) {
    for (const user of users) {
      if (!mapOfUsersInMultipleBeacons.has(user.id)) {
        mapOfUsersInMultipleBeacons.set(user.id, new Set());
      }
      mapOfUsersInMultipleBeacons.get(user.id)!.add(beaconId);
    }
  }

  // ------ Rule 1: Assign user to Beacon's with only 1 user count ------
  const beaconsWithSingleUser = Array.from(
    mapOfBeaconsAndUsers.entries(),
  ).filter(([, users]) => users.length === 1);

  for (const [beaconId, users] of beaconsWithSingleUser) {
    if (users.length === 0) continue; // only for safety, should not happen

    const user = users[0]; // only one user in this beacon

    // check if this user has already been assigned to a beacon
    if (setOfAssignedOnRunUsers.has(user.id)) continue;
    // check if this beacon already has a user assigned
    if (mapOfUsersToNotifyOfBeacons.has(beaconId)) continue;

    const beaconsWithThisUser = mapOfUsersInMultipleBeacons.get(user.id);
    if (beaconsWithThisUser && beaconsWithThisUser.size > 1) {
      // check if other beacon only has a count of 1 with this user
      const otherBeaconsWithThisUser = Array.from(beaconsWithThisUser).filter(
        (bId) => {
          if (bId === beaconId) return false;
          return mapOfBeaconsAndUsers.get(bId)?.length === 1;
        },
      );

      if (otherBeaconsWithThisUser.length === 0) {
        // if no other beacons have this user, assign them to the current beacon
        mapOfUsersToNotifyOfBeacons.set(beaconId, user.id);
        setOfAssignedOnRunUsers.add(user.id);
        // remove the beacon from the map of beacons and users
        mapOfBeaconsAndUsers.delete(beaconId);
        console.log(
          'User ' +
            user.username +
            ' assigned to beacon ' +
            beaconId +
            ' - for being the only user in this beacon.',
        );
        continue;
      }

      // check which beacon has had the least notifications sent today
      // assisted with AI (CoPilot)
      const beaconWithLeastNotifications = Array.from(
        otherBeaconsWithThisUser,
      ).reduce((prev, curr) => {
        const prevBeacon = validBeacons.find((b) => b.id === prev);
        const currBeacon = validBeacons.find((b) => b.id === curr);
        if (!prevBeacon || !currBeacon) return prev; // safety check

        const prevCount = prevBeacon._count.beaconNotification;
        const currCount = currBeacon._count.beaconNotification;

        return prevCount < currCount ? prev : curr;
      }, beaconId); // default to current beacon

      // if the beacon with the least notifications is the current beacon, assign the user
      if (beaconWithLeastNotifications === beaconId) {
        mapOfUsersToNotifyOfBeacons.set(beaconId, user.id);
        setOfAssignedOnRunUsers.add(user.id);
        // remove the beacon from the map of beacons and users
        mapOfBeaconsAndUsers.delete(beaconId);
        console.log(
          'User ' +
            user.username +
            ' assigned to beacon ' +
            beaconId +
            ' - for having the least notifications sent today.',
        );
      }
    } else {
      // If the user is only in one beacon, assign them to that beacon
      mapOfUsersToNotifyOfBeacons.set(beaconId, user.id);
      setOfAssignedOnRunUsers.add(user.id);
      // remove the beacon from the map of beacons and users
      mapOfBeaconsAndUsers.delete(beaconId);
      console.log(
        'User ' +
          user.username +
          ' assigned to beacon ' +
          beaconId +
          ' - for being the only user in this beacon.',
      );
    }
  }

  // ------ Rule 2: Assign users who are only in one beacon ------

  // copy array to avoid modifying the original map during iteration (deleting key)
  for (const [beaconId, users] of Array.from(mapOfBeaconsAndUsers.entries())) {
    const assignedOnlyToCurrBeaconUsers = users.filter((user) => {
      const appearances = Array.from(mapOfBeaconsAndUsers.values()).filter(
        (arr) => arr.some((u) => u.id === user.id),
      ).length;

      return appearances === 1;
    });

    if (assignedOnlyToCurrBeaconUsers.length > 0) {
      assignedOnlyToCurrBeaconUsers.sort((a, b) =>
        sortClosestUsers(a, b, beaconId),
      );

      const chosen = assignedOnlyToCurrBeaconUsers[0];

      mapOfUsersToNotifyOfBeacons.set(beaconId, chosen.id);
      setOfAssignedOnRunUsers.add(chosen.id);
      mapOfBeaconsAndUsers.delete(beaconId); // remove the beacon from the map
      console.log(
        'User ' +
          chosen.username +
          ' assigned to beacon ' +
          beaconId +
          ' - for being the only in this beacon and not others.',
      );
    }
  }

  // ------ Rule 3: Assign remaining users to beacons based on distance ------
  for (const [beaconId, users] of mapOfBeaconsAndUsers.entries()) {
    if (users.length === 0) continue;
    if (mapOfUsersToNotifyOfBeacons.has(beaconId)) continue;
    // Filter out users who have already been assigned on this run
    // Sort users by distance to the beacon
    const candidates = users
      .filter((user) => {
        return !setOfAssignedOnRunUsers.has(user.id);
      })
      .sort((a, b) => sortClosestUsers(a, b, beaconId));

    if (candidates.length > 0) {
      let closestUser;
      for (const user of candidates) {
        if (setOfAssignedOnRunUsers.has(user.id)) continue;
        closestUser = user;
        break; // take the first user who is not assigned yet
      }

      if (!closestUser) {
        console.log(
          `[scheduleNotificationsForBeacons] No valid users found for beacon ${beaconId}.`,
        );
        continue;
      }

      mapOfUsersToNotifyOfBeacons.set(beaconId, closestUser.id);
      setOfAssignedOnRunUsers.add(closestUser.id);
      console.log(
        'User ' +
          closestUser.username +
          ' assigned to beacon ' +
          beaconId +
          ' - for being the closest user.',
      );
    }
  }

  console.log('Final assignments:', mapOfUsersToNotifyOfBeacons);
  // * At this point, mapOfUsersToNotifyOfBeacons should contain all beacons and their assigned users
  if (mapOfUsersToNotifyOfBeacons.size === 0) {
    console.log(
      '[scheduleNotificationsForBeacons] No users to notify for any beacons.',
    );
    return;
  }

  // * Create notifications for each user assigned to the beacon
  const notifications = Array.from(mapOfUsersToNotifyOfBeacons.entries()).map(
    ([beaconId, userId]) => ({
      userId,
      beaconId,
      createdAt: now,
    }),
  );

  // * Save notifications in the database
  if (notifications.length === 0) {
    console.log(
      '[scheduleNotificationsForBeacons] No notifications to create.',
    );
    return;
  }

  await prisma.beaconNotification.createMany({
    data: notifications,
  });

  console.log(
    `[scheduleNotificationsForBeacons] Created notifications for beacons: ${Array.from(
      mapOfUsersToNotifyOfBeacons.keys(),
    ).join(', ')}`,
  );

  console.log(
    '[scheduleNotificationsForBeacons] Notifications scheduled successfully.',
  );
}

export async function sendNotificationsForBeacons() {
  // * get all unNotified beaconNotifications for today
  const now = new Date();
  const startOfDay = normaliseDate(new Date());

  const unNotifiedBeaconNotifications =
    await prisma.beaconNotification.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
        },
        notifiedAt: {
          equals: null, // only get notifications that have not been notified yet
        },
        NOT: {
          status: {
            in: [
              BeaconNotificationStatus.CANCELLED,
              BeaconNotificationStatus.DECLINED,
            ],
          }, // only get notifications that are not canceled or declined}
        },
      },
      include: {
        user: {
          include: {
            NotificationSetting: true,
            pushToken: true,
          },
        },
        beacon: {
          select: {
            id: true,
            active: true,
            expiresAt: true, // include expiresAt to use in notification data
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

  /*
   ---------- ADDITIONAL USER CHECKS FOR SAFETY ----------
   These check are to ensure that the application keeps to the users preferences
   and does not send notifications to users who have opted out or are not active.

   All other check are done in the scheduleNotificationsForBeacons function.
   - maxBeaconPushes is not checked here and a notification will never be able to
   be scheduled if the user has reached their maxBeaconPushes for the day.
   - minBeaconPushInterval is not checked here and a notification will never be able to
   be scheduled if the user has received a notification for any beacon within their
   minBeaconPushInterval.
  */
  const unNotifiedToSend = unNotifiedBeaconNotifications.filter((n) => {
    return (
      n.beacon.active &&
      n.user &&
      n.user.NotificationSetting &&
      n.user.pushToken &&
      n.user.NotificationSetting.push === true
    );
  }) as SafeBeaconNotification[];

  const unNotifiedToUpdateSilent = unNotifiedBeaconNotifications.filter((n) => {
    return (
      n.beacon.active &&
      n.user &&
      (!n.user.NotificationSetting ||
        n.user.NotificationSetting.push === false ||
        !n.user.pushToken)
    );
  });

  const unNotifiedToCancel = unNotifiedBeaconNotifications
    .filter((n) => {
      return !n.beacon.active || !n.user;
    })
    .map((n) => n.id);

  if (unNotifiedToCancel.length > 0)
    console.log(
      '[sendNotificationsForBeacons] Canceling notifications for beacons:',
      unNotifiedToCancel,
    );

  await prisma.beaconNotification.updateMany({
    where: {
      id: {
        in: unNotifiedToCancel,
      },
    },
    data: {
      status: BeaconNotificationStatus.CANCELLED,
    },
  });

  if (unNotifiedToSend.length === 0 && unNotifiedToUpdateSilent.length === 0) {
    console.log(
      '[sendNotificationsForBeacons] No notifications to send after filtering.',
    );
    return;
  }

  const expo = new Expo();

  const messages = [];
  for (const notification of unNotifiedToSend) {
    const { user, beacon } = notification;
    const { pushToken } = user;

    // TODO: change the data so that it directs user to the beacon for message sending
    messages.push({
      to: pushToken.token,
      sound: 'default',
      body: `Someone just put up a beacon near you, why don't you send them something nice!`,
      data: {
        dataType: 'BEACON_NOTIFICATION',
        beaconId: beacon.id,
        notificationId: notification.id,
        receiverUserId: user.id,
        beaconExpiresAt: beacon.expiresAt.toISOString(),
        route: '/(beacon)/reply', // TODO: make this page in mobile app
      } as BeaconPushNotificationData,
    });
  }

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      const successfulIds: number[] = [];

      receipts.forEach((receipt, i) => {
        if (receipt.status === 'ok') {
          const message = chunk[i];
          if (
            message.data &&
            'beaconId' in message.data &&
            'receiverUserId' in message.data
          ) {
            const receiverUserId = message.data.receiverUserId as string;
            const beaconId = message.data.beaconId as number;

            const notification = unNotifiedToSend.find(
              (n) => n.user.id === receiverUserId && n.beacon.id === beaconId,
            );

            if (notification) {
              successfulIds.push(notification.id);
            }
          }
        } else {
          console.error(
            `Notification failed: ${receipt.message}`,
            receipt.details,
          );
        }
      });

      if (successfulIds.length > 0) {
        await prisma.beaconNotification.updateMany({
          where: { id: { in: successfulIds } },
          data: {
            notifiedAt: new Date(),
            status: BeaconNotificationStatus.SENT,
          },
        });
      }

      console.log(
        `[sendNotificationsForBeacons] Sent ${successfulIds.length} notifications successfully. Here are the receipts: ${JSON.stringify(receipts, null, 2)}`,
      );
    } catch (error) {
      console.error('Error sending push notifications', error);
    }
  }

  try {
    if (unNotifiedToUpdateSilent.length > 0) {
      const silentIds = unNotifiedToUpdateSilent.map((n) => n.id);
      await prisma.beaconNotification.updateMany({
        where: { id: { in: silentIds } },
        data: {
          status: BeaconNotificationStatus.SENT_SILENTLY,
          notifiedAt: new Date(),
        },
      });

      console.log(
        `[sendNotificationsForBeacons] Updated ${silentIds.length} silent notifications successfully.`,
      );
    }
  } catch (error) {
    console.error('Error updating silent notifications', error);
  }
}

async function getAllActiveUsersInGeohashes(
  setOfAllGeohashes: Set<string>,
  now: Date,
) {
  const startOfDay = normaliseDate(now);
  return prisma.user.findMany({
    where: {
      LocationSetting: {
        geohash: {
          in: Array.from(setOfAllGeohashes),
        },
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
          notifiedAt: true,
          status: true,
        },
      },
      NotificationSetting: {
        select: {
          maxBeaconPushes: true,
          push: true,
          minBeaconPushInterval: true,
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
