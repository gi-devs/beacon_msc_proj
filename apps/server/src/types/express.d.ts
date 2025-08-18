// apps/server/src/types/express.d.ts
import { UserPayload } from '@beacon/types';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// required so this file is treated as a module
export {};
