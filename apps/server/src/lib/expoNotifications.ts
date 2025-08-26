import Expo from 'expo-server-sdk';
import { BeaconPushNotificationData } from '@beacon/types';

type NotificationData = BeaconPushNotificationData | any;

/**
 * @throws {Error} Throws an error if sending the notification fails
 **/
export async function sendNotification(data: {
  pushToken: string;
  message: string;
  notificationData: NotificationData;
}) {
  const { pushToken, message, notificationData } = data;
  let expo = new Expo();

  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    throw new Error('Invalid Expo push token');
  }

  const notification = {
    to: pushToken,
    sound: 'default',
    body: message,
    data: notificationData,
  };

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync([notification]);
    console.log('Notification ticket:', ticketChunk);
    return ticketChunk;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
