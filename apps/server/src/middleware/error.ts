import { Request, Response, NextFunction } from 'express';
import { CustomError } from '@/utils/custom-error';

export async function error(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json(err.toJSON());
  } else {
    // console.error(err);  // Log unexpected errors

    res.status(500).json({
      message: err.message || 'Internal Server Error',
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}
