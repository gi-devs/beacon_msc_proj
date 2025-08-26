import { getUserById } from '@/models/model.user';
import { getBeaconById } from '@/models/model.beacon';
import { getNotificationSettingByUserId } from '@/models/model.notificationSetting';
import prisma from '@/lib/prisma';
import {
  createBeaconNotification,
  getBeaconNotificationById,
  updateBeaconNotificationById,
} from '@/models/model.beaconNotification';
import { sendNotification } from '@/lib/expoNotifications';
import { getPushTokenByUserId } from '@/models/model.pushToken';
import { getDailyCheckInByUserIdAndDate } from '@/models/model.dailyCheckIn';
import { getMoodLogById } from '@/models/model.moodLog';

/**
 * Manually create a beacon notification for a user and send a push notification if applicable.
 * @param beaconId - The ID of the beacon.
 * @param userId - The ID of the user to notify.
 **/
async function manualCreateNotification(beaconId: string, userId: string) {
  if (!beaconId || !userId) {
    throw new Error('beaconId and userId are required');
  }

  const beaconIdNum = parseInt(beaconId, 10);

  if (isNaN(beaconIdNum)) {
    throw new Error('Invalid beaconId');
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const beacon = await getBeaconById(beaconIdNum);
  if (!beacon) {
    throw new Error('Beacon not found');
  }

  const notificationSettings = await getNotificationSettingByUserId(userId);
  if (!notificationSettings) {
    throw new Error('Notification settings not found for user');
  }

  let shouldNotify = notificationSettings.push;

  let pushToken = await getPushTokenByUserId(userId);
  if (shouldNotify && !pushToken) {
    shouldNotify = false;
  }

  prisma.$transaction(async (tx) => {
    const createdNotification = await createBeaconNotification(
      {
        status: shouldNotify ? 'SENT' : 'SENT_SILENTLY',
        user: {
          connect: { id: user.id },
        },
        beacon: {
          connect: { id: beacon.id },
        },
      },
      tx,
    );

    if (shouldNotify && pushToken) {
      const notificationTicketChunk = await sendNotification({
        pushToken: pushToken.token,
        message: `Someone just put up a beacon near you, why don't you send them something nice!`,
        notificationData: {
          dataType: 'BEACON_NOTIFICATION',
          beaconId: beacon.id,
          notificationId: createdNotification.id,
          receiverUserId: user.id,
          beaconExpiresAt: beacon.expiresAt.toISOString(),
          route: '/(beacon)/reply',
        },
      });

      if (notificationTicketChunk[0].status !== 'ok') {
        console.log(
          'Sending push failed, updating notification to SENT_SILENTLY',
        );
        await updateBeaconNotificationById(createdNotification.id, {
          status: 'SENT_SILENTLY',
        });
        shouldNotify = false;
      }
    }
  });

  return {
    message:
      'Successfully created beacon notification and was sent ' +
      (shouldNotify ? 'with' : 'without') +
      ' notification.',
  };
}

/**
 * Manually notify the beacon owner when a reply has been made to their beacon notification.
 * @param notificationId - The ID of the beacon notification.
 **/

async function manualNotifyReply(notificationId: string) {
  if (!notificationId) {
    throw new Error('notificationId is required');
  }
  const notificationIdNum = parseInt(notificationId, 10);
  if (isNaN(notificationIdNum)) {
    throw new Error('Invalid notificationId');
  }

  const beaconNotification = await getBeaconNotificationById(notificationIdNum);

  if (!beaconNotification) {
    throw new Error('Beacon notification not found');
  }

  if (beaconNotification.status !== 'REPLIED') {
    throw new Error('Beacon notification already replied to');
  }

  const beacon = await getBeaconById(beaconNotification.beaconId);
  if (!beacon) {
    throw new Error('Beacon not found');
  }
  const owner = await getUserById(beacon.userId);
  if (!owner) {
    throw new Error('User not found');
  }

  const notificationSettings = await getNotificationSettingByUserId(owner.id);
  if (!notificationSettings) {
    throw new Error('Notification settings not found for user');
  }

  let shouldNotify = notificationSettings.push;

  let pushToken = await getPushTokenByUserId(owner.id);
  if (shouldNotify && !pushToken) {
    shouldNotify = false;
  }

  const checkIn = await getDailyCheckInByUserIdAndDate(
    beacon.userId,
    beacon.dailyCheckInDate,
  );
  if (!checkIn) {
    throw new Error('Daily check-in not found for beacon owner');
  }
  const moodLog = await getMoodLogById(checkIn.moodLogId);

  let route = '/(home)/moodReview';
  if (moodLog) {
    route = '/(home)/entry-details/mood-log/' + moodLog.id;
  }

  prisma.$transaction(async (tx) => {
    if (shouldNotify && pushToken) {
      const notificationTicketChunk = await sendNotification({
        pushToken: pushToken.token,
        message: "Hey someone's thinking of you!",
        notificationData: {
          notificationIds: notificationId,
          beaconId: beacon.id,
          route: route,
        },
      });

      if (notificationTicketChunk[0].status !== 'ok') {
        console.log('Sending push failed');
        shouldNotify = false;
      }
    }

    await updateBeaconNotificationById(notificationIdNum, {
      status: 'OWNER_NOTIFIED',
    });
  });

  return {
    message:
      'Successfully notified beacon owner ' +
      (shouldNotify ? 'with' : 'without') +
      ' notification.',
  };
}

export const devService = {
  manualCreateNotification,
  manualNotifyReply,
};
