import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../../.env.development', quiet: true });
}

import config from '@/config/config';
import app from './app';
import prisma from '@/lib/prisma';
import cron from 'node-cron';
import {
  scheduleNotificationsForBeacons,
  sendNotificationsForBeacons,
} from '@/jobs/scheduleNotifications';
import { notifyBeaconOwners } from '@/jobs/notifyBeaconOwners';
import { createCommunityRooms } from '@/jobs/createCommunityRooms';

// ! Uncomment the following lines to enable the cron job for scheduling notifications
cron.schedule('*/5 * * * *', async () => {
  console.log('[CRON] Running beacon notifications job...');
  console.log('Time:', new Date().toISOString());
  try {
    await scheduleNotificationsForBeacons();
    await sendNotificationsForBeacons();
    await notifyBeaconOwners();
  } catch (err) {
    console.error('Notifications job failed', err);
  }
});

cron.schedule('0 * * * *', async () => {
  console.log('[CRON] Running create community rooms job...');
  console.log('Time:', new Date().toISOString());
  try {
    await createCommunityRooms();
  } catch (err) {
    console.error('[CRON] Create community rooms job failed', err);
  }
});

const server = app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

const shutdown = async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
