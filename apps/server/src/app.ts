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
} from '@/routes';

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

// Not found handler
app.use(notFound);
// Error handler
app.use(error);

export default app;
