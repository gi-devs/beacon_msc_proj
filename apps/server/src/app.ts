import express, { json, urlencoded } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { error, notFound } from '@/middleware';
import { CustomError } from '@/utils/custom-error';

const app = express();
app.use(json());
app.use(cors());
app.use(morgan('dev'));

// middlewares
app.use(urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => res.send('Hello World!')); // Example route
app.get('/test-error', (req, res, next) =>
  next(new CustomError('Testing Error', 404)),
);

// Not found handler
app.use(notFound);
// Error handler
app.use(error);

export default app;
