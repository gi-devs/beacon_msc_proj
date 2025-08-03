import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { CustomError, ErrorCodes } from '@/utils/custom-error';
import prisma from '@/lib/prisma';

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    throw new CustomError(
      'Access denied. No token provided.',
      401,
      ErrorCodes.NO_TOKEN,
    );
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

    const session = await prisma.session.findUnique({
      where: { token: payload.sessionId },
    });

    if (!session) {
      throw new CustomError('You have been logged out.', 401);
    }

    if (session.expiresAt < new Date()) {
      throw new CustomError('Session expired, please login again.', 401);
    }

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(
      'Your session is not valid, please log in again.',
      401,
      ErrorCodes.INVALID_TOKEN,
    );
  }
};
