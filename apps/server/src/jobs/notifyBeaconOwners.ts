import prisma from '@/lib/prisma';
import { BeaconNotificationStatus, Prisma } from '@/generated/prisma';
import console from 'node:console';
import Expo from 'expo-server-sdk';

type BeaconWithUserAndNotifs = Prisma.BeaconGetPayload<{
  include: {
    user: {
      include: {
        NotificationSetting: true;
        pushToken: true;
      };
    };
    beaconNotification: true;
  };
}>;

type UserFromBeacon = Prisma.UserGetPayload<{
  include: {
    NotificationSetting: true;
    pushToken: true;
  };
}>;

export async function notifyBeaconOwners() {
  console.log('[notifyBeaconOwners] Starting to notify beacon owners...');
  const now = new Date();
  const activeBeacons = await prisma.beacon.findMany({
    where: {
      active: true,
      expiresAt: {
        gt: now,
      },
      user: {
        NotificationSetting: {
          push: true, // only get users who have push notifications enabled
        },
      },
    },
    include: {
      user: {
        include: {
          NotificationSetting: true,
          pushToken: true,
        },
      },
      beaconNotification: {
        where: {
          status: 'REPLIED', // only get notifications which have been replied to but not owner_notified
        },
      },
      dailyCheckIn: {
        select: {
          moodLogId: true,
        },
      },
    },
  });

  if (!activeBeacons) {
    console.error('[notifyBeaconOwners] No active beacons found');
    return;
  }

  console.info(
    '[notifyBeaconOwners] There is ' +
      activeBeacons.length +
      ' active beacons to process.',
  );

  /*
    ------------- LOGIC TO NOTIFY OWNERS ---------------
    this function should run and notify owners of beacons
    that have been replied to from their beacon notifications

    Constraints in the logic so that users are not spammed

    ----------------------  RULES ----------------------
    1. Only notify owners of beacons that have been replied to.
    2. Notify owners on their first reply beacon notified count is less than 1
    3. Notify owners who have had 2 or more replies after 2 hours of their beacon expiration notified count is less than 2
    4. Notify owners within the last 15 minutes of their beacon expiration if their notified count is less than 3
   */

  const usersToNotifyAndNotifications = new Map<
    string,
    {
      stage: number;
      notificationIds: Set<number>;
    }
  >();
  const filteredBeacons = new Set<number>();
  const usersToNotifyFromFilter = new Map<string, UserFromBeacon>();

  // ---- Helper -----
  function collectBeacons(
    beacons: BeaconWithUserAndNotifs[],
    condition: (beacon: BeaconWithUserAndNotifs) => boolean,
    stage: number,
    usersToNotify: Map<
      string,
      {
        stage: number;
        notificationIds: Set<number>;
      }
    >,
    filtered: Set<number>,
  ) {
    for (const beacon of beacons) {
      if (!condition(beacon)) continue;
      const userId = beacon.user.id;
      if (!usersToNotify.has(userId)) {
        usersToNotify.set(userId, {
          stage,
          notificationIds: new Set(),
        });
      }

      const userToNotify = usersToNotify.get(userId)!;
      for (const notification of beacon.beaconNotification) {
        userToNotify.notificationIds.add(notification.id);
        usersToNotifyFromFilter.set(userId, beacon.user);
      }

      filtered.add(beacon.id);
    }
  }

  // ------------ RULE 1 -------------
  collectBeacons(
    activeBeacons,
    (beacon) =>
      !filteredBeacons.has(beacon.id) &&
      beacon.beaconNotification.length === 1 &&
      beacon.userNotifiedStage === 0,
    0,
    usersToNotifyAndNotifications,
    filteredBeacons,
  );

  console.info(
    '[notifyBeaconOwners] Collected beacons at stage 0:',
    Array.from(usersToNotifyAndNotifications.values()).filter(
      (b) => b.stage === 0,
    ).length,
  );

  // ------------ RULE 2 -------------
  collectBeacons(
    activeBeacons,
    (beacon) => {
      if (filteredBeacons.has(beacon.id)) return false;

      const beaconExpiration = new Date(beacon.createdAt);
      const twoHoursLater = new Date(
        beaconExpiration.getTime() + 2 * 60 * 60 * 1000,
      );

      return (
        twoHoursLater <= now &&
        beacon.userNotifiedStage === 1 &&
        beacon.beaconNotification.length >= 2
      );
    },
    1,
    usersToNotifyAndNotifications,
    filteredBeacons,
  );

  console.info(
    '[notifyBeaconOwners] Collected beacons at stage 1: ',
    Array.from(usersToNotifyAndNotifications.values()).filter(
      (b) => b.stage === 1,
    ).length,
  );

  // ------------ RULE 3 -------------
  collectBeacons(
    activeBeacons,
    (beacon) => {
      if (filteredBeacons.has(beacon.id)) return false;

      const fifteenMinutesBeforeExpiration = new Date(beacon.expiresAt);
      fifteenMinutesBeforeExpiration.setMinutes(
        fifteenMinutesBeforeExpiration.getMinutes() - 15,
      );

      return (
        beacon.expiresAt > now &&
        fifteenMinutesBeforeExpiration <= now &&
        beacon.userNotifiedStage === 2 &&
        beacon.beaconNotification.length >= 1
      );
    },
    2,
    usersToNotifyAndNotifications,
    filteredBeacons,
  );

  console.info(
    '[notifyBeaconOwners] Collected beacons at stage 2: ',
    Array.from(usersToNotifyAndNotifications.values()).filter(
      (b) => b.stage === 2,
    ).length,
  );

  // ------------ NOTIFY OWNERS -------------

  // ---- helper ------
  function computeStageMessage(stage: number): string {
    switch (stage) {
      case 0:
        return "Hey someone's thinking of you!";
      case 1:
        return "You're on a few peoples minds today <3";
      case 2:
        return 'Your beacon is about to expire. Be sure to check in with your messages!';
      default:
        return 'You have a new notification.';
    }
  }

  const messages = [];
  for (const [userId, notificationInfo] of usersToNotifyAndNotifications) {
    const notificationIds = Array.from(notificationInfo.notificationIds);
    const beaconId = activeBeacons.find(
      (beacon) => beacon.user.id === userId,
    )?.id;

    if (notificationIds.length === 0) continue;

    if (!beaconId) {
      console.warn(`[notifyBeaconOwners] No beacon found for user ${userId}`);
      continue;
    }

    const user = usersToNotifyFromFilter.get(userId);

    if (!user) {
      console.warn(`[notifyBeaconOwners] User with ID ${userId} not found`);
      continue;
    }

    if (
      !user.NotificationSetting ||
      !user.NotificationSetting.push ||
      !user.pushToken
    ) {
      console.warn(
        `[notifyBeaconOwners] User with ID ${userId} has push notifications disabled`,
      );
      continue;
    }

    const moodLogId = activeBeacons.find((beacon) => beacon.user.id === userId)
      ?.dailyCheckIn?.moodLogId;

    let route;
    if (!moodLogId) {
      route = '/(home)/moodReview';
    } else {
      route = '/(home)/entry-details/mood-log/' + moodLogId;
    }

    messages.push({
      to: user.pushToken.token,
      sound: 'default',
      title: 'Beacon Notification',
      body: computeStageMessage(notificationInfo.stage),
      data: {
        notificationIds: notificationIds,
        beaconId: beaconId,
        route: route,
      },
    });
  }

  const expo = new Expo();

  if (messages.length > 0) {
    console.log(
      `[notifyBeaconOwners] Sending ${messages.length} notifications to owners`,
    );

    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const receipts = await expo.sendPushNotificationsAsync(chunk);
        for (const receipt of receipts) {
          const i = receipts.indexOf(receipt);

          if (receipt.status === 'ok') {
            const notificationId = chunk[i].data?.notificationIds as number[];
            const beaconId = chunk[i].data?.beaconId as number;

            if (notificationId && beaconId) {
              // update the notification status in the database
              console.info(
                '[notifyBeaconOwners] Notification sent successfully:',
                receipt,
              );
              await prisma.$transaction(async (tx) => {
                await tx.beaconNotification.updateMany({
                  where: { id: { in: notificationId } },
                  data: { status: BeaconNotificationStatus.OWNER_NOTIFIED },
                });

                await tx.beacon.update({
                  where: { id: beaconId },
                  data: { userNotifiedStage: { increment: 1 } },
                });
              });
            }
          } else {
            console.error(
              `Notification failed: ${receipt.message}`,
              receipt.details,
            );
          }
        }
      } catch (error) {
        console.error('Error sending push notifications', error);
      }
    }
  }
}
