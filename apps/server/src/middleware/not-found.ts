import { CustomError } from '@/utils/custom-error';
import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response, next: NextFunction) {
  return next(new CustomError('Route not found', 404));
}
