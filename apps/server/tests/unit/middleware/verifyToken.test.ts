import { Request, Response } from 'express';
import { UserPayload } from '@beacon/types';
import { CustomError, ErrorCodes } from '../../../src/utils/custom-error';
import { verifyToken } from '../../../src/middleware';
import prisma from '../../../src/lib/prisma';
import * as jwt from 'jsonwebtoken';

jest.mock('@/lib/prisma', () => ({
  session: {
    findUnique: jest.fn(),
  },
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const mockNext = jest.fn();
const mockReq = (authHeader?: string) =>
  ({
    header: jest.fn().mockReturnValue(authHeader),
  }) as any as Request;
const mockRes = {} as Response;

describe('verifyToken middleware', () => {
  const defaultPayload: UserPayload = {
    userId: 'u1',
    sessionId: 's1',
    username: 'testuser',
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw if no token provided', async () => {
    const req = mockReq(undefined);

    await expect(verifyToken(req, mockRes, mockNext)).rejects.toThrow(
      new CustomError(
        'Access denied. No token provided.',
        401,
        ErrorCodes.NO_TOKEN,
      ),
    );
  });

  it('should throw if jwt.verify fails', async () => {
    const req = mockReq('Bearer invalid.token');
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    await expect(verifyToken(req, mockRes, mockNext)).rejects.toThrow(
      new CustomError(
        'Your session is not valid, please log in again.',
        401,
        ErrorCodes.INVALID_TOKEN,
      ),
    );
  });

  it('should throw if session not found', async () => {
    const req = mockReq('Bearer valid.token');
    (jwt.verify as jest.Mock).mockReturnValue(defaultPayload);
    (prisma.session.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(verifyToken(req, mockRes, mockNext)).rejects.toThrow(
      new CustomError('You have been logged out.', 401),
    );
  });

  it('should throw if session expired', async () => {
    const req = mockReq('Bearer valid.token');
    (jwt.verify as jest.Mock).mockReturnValue(defaultPayload);
    (prisma.session.findUnique as jest.Mock).mockResolvedValue({
      expiresAt: new Date(Date.now() - 1000), // expired
    });

    await expect(verifyToken(req, mockRes, mockNext)).rejects.toThrow(
      new CustomError('Session expired, please login again.', 401),
    );
  });

  it('should attach user and call next if valid', async () => {
    const req = mockReq('Bearer valid.token');
    const payload: UserPayload = defaultPayload;
    (jwt.verify as jest.Mock).mockReturnValue(payload);
    (prisma.session.findUnique as jest.Mock).mockResolvedValue({
      expiresAt: new Date(Date.now() + 10000), // valid
    });

    await verifyToken(req, mockRes, mockNext);

    expect((req as any).user).toEqual(payload);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should rethrow CustomError if caught', async () => {
    const req = mockReq('Bearer valid.token');
    (jwt.verify as jest.Mock).mockReturnValue(defaultPayload);
    (prisma.session.findUnique as jest.Mock).mockImplementation(() => {
      throw new CustomError('Forced fail', 401);
    });

    await expect(verifyToken(req, mockRes, mockNext)).rejects.toThrow(
      new CustomError('Forced fail', 401),
    );
  });
});
