import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload | JwtPayload;
    }
  }
}

export {};
