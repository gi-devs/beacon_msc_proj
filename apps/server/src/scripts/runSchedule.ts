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

(async () => {
  try {
    await scheduleNotificationsForBeacons();
    // await sendNotificationsForBeacons();
    // await notifyBeaconOwners();
    console.log('Job completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Job failed', err);
    process.exit(1);
  }
})();
