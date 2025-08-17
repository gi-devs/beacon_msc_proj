type BeaconPushNotificationData = {
  dataType: 'BEACON_NOTIFICATION';
  beaconId: number;
  notificationId: number;
  receiverUserId: string;
  beaconExpiresAt: string;
  route: string;
};
