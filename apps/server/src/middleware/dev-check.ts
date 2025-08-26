import { NextFunction, Request, Response } from 'express';
import { CustomError, ErrorCodes } from '@/utils/custom-error';

export const verifyDev = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Verifying dev token...');
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    throw new CustomError(
      'Access denied. No token provided.',
      401,
      ErrorCodes.NO_TOKEN,
    );
  }

  const devToken = process.env.DEV_TOKEN;

  if (token !== devToken) {
    throw new CustomError(
      'Access denied. Invalid token.',
      401,
      ErrorCodes.INVALID_TOKEN,
    );
  }

  next();
};
