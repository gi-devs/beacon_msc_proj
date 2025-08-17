import express, { json, urlencoded } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { error, notFound } from '@/middleware';
import prisma from '@/lib/prisma';
import {
  authRoutes,
  moodLogRoutes,
  pushTokenRoutes,
  journalEntryRoutes,
  dailyLogRoutes,
  locationSettingRoutes,
  notificationSettingRoutes,
} from '@/routes';
import { scheduleNotificationsForBeacons } from '@/jobs/scheduleNotifications';

const app = express();
app.use(json());
app.use(cors());
app.use(morgan('dev'));

// middlewares
app.use(urlencoded({ extended: true }));

// Routes
app.get('/', async (req, res) => {
  const user = await prisma.user.findMany();
  res.status(200).json({ message: 'Welcome to the API', users: user });
}); // Example route

// App routes
app.use('/auth', authRoutes); // Authentication routes
app.use('/push-token', pushTokenRoutes);
app.use('/mood-log', moodLogRoutes);
app.use('/journal-entry', journalEntryRoutes);
app.use('/daily-log', dailyLogRoutes);
app.use('/location-setting', locationSettingRoutes);
app.use('/notification-setting', notificationSettingRoutes);

// ! for testing purposes only - remove in production and use cron job instead
app.get('/manual-call/notification', async (req, res) => {
  try {
    await scheduleNotificationsForBeacons();
    res
      .status(200)
      .json({ message: 'Notifications job executed successfully' });
  } catch (err) {
    console.error('Notifications job failed', err);
    res.status(500).json({ error: 'Failed to execute notifications job' });
  }
});

// Not found handler
app.use(notFound);
// Error handler
app.use(error);

export default app;
