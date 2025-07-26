import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { CustomError, ErrorCodes } from '@/utils/custom-error';

export const verifyToken = (
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
    req.user = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    next();
  } catch (error) {
    throw new CustomError('Invalid token', 401, ErrorCodes.INVALID_TOKEN);
  }
};
