import { PrismaClientKnownRequestError } from '@/generated/prisma/runtime/library';

export enum ErrorCodes {
  NO_TOKEN = 'NO_TOKEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  MISSING_FIELDS = 'MISSING_FIELDS',
}

export class CustomError extends Error {
  statusCode: number;
  code: ErrorCodes | undefined;
  error: Error | undefined;

  constructor(
    message: string,
    statusCode: number,
    code?: ErrorCodes,
    error?: Error,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.error = error;

    if (error && error instanceof PrismaClientKnownRequestError) {
      this.message = `Prisma Error: ${error.message}`;
    }

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
    };
  }
}
