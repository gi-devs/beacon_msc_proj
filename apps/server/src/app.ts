import express, { json, urlencoded } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { error, notFound } from '@/middleware';
import { CustomError } from '@/utils/custom-error';
import prisma from '@/lib/prisma';
import authRoutes from '@/routes/routes.auth';

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

app.use('/auth', authRoutes); // Authentication routes

app.get('/test-error', (req, res, next) =>
  next(new CustomError('Testing Error', 404)),
);

// Not found handler
app.use(notFound);
// Error handler
app.use(error);

export default app;
