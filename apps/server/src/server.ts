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

// ! Uncomment the following lines to enable the cron job for scheduling notifications
// cron.schedule('*/5 * * * *', async () => {
//   console.log('[CRON] Running beacon notifications job...');
//   try {
//     await scheduleNotificationsForBeacons();
//     await sendNotificationsForBeacons();
//   } catch (err) {
//     console.error('Notifications job failed', err);
//   }
// });

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
