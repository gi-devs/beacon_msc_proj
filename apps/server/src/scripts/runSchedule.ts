// ! This is a script to test the scheduleNotificationsForBeacons and sendNotificationsForBeacons jobs.

import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../../.env.development' });
}

import {
  scheduleNotificationsForBeacons,
  sendNotificationsForBeacons,
} from '@/jobs/scheduleNotifications';
import { notifyBeaconOwners } from '@/jobs/notifyBeaconOwners';
import { createCommunityRooms } from '@/jobs/createCommunityRooms';

(async () => {
  try {
    // await scheduleNotificationsForBeacons();
    // await sendNotificationsForBeacons();
    // await notifyBeaconOwners();
    await createCommunityRooms();
    console.log('Job completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Job failed', err);
    process.exit(1);
  }
})();
