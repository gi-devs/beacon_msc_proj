import { CustomError } from '../../../src/utils/custom-error';
import { authService } from '../../../src/services/service.auth';
import {
  createUser,
  getUserByEmail,
  getUserById,
} from '../../../src/models/model.user';
import * as bcrypt from 'bcryptjs';
import {
  createSession,
  deleteSessionByToken,
  getSessionByToken,
  getSessionByUserId,
} from '../../../src/models/models.session';
import { getDailyCheckInByUserIdAndDate } from '../../../src/models/model.dailyCheckIn';
import { deleteManyPushTokenByUserId } from '../../../src/models/model.pushToken';
import prisma from '../../../src/lib/prisma';

jest.mock('@/models/model.user');
jest.mock('@/models/models.session');
jest.mock('@/models/model.pushToken');
jest.mock('@/models/model.dailyCheckIn');
jest.mock('@/lib/prisma', () => ({
  $transaction: jest.fn((fn) => fn({})),
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mockedAccessToken'),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should throw error if fields are missing', async () => {
      await expect(
        authService.registerUser({ email: '', username: '', password: '' }),
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if email already exists', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValueOnce({ id: 'u1' });
      await expect(
        authService.registerUser({
          email: 'test@test.com',
          username: 'user1',
          password: '123',
        }),
      ).rejects.toThrow('SignUp already exists');
    });

    it('should throw error if username already exists', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValueOnce(null);
      (getUserByEmail as jest.Mock).mockResolvedValueOnce({ id: 'u2' });
      await expect(
        authService.registerUser({
          email: 'test@test.com',
          username: 'user1',
          password: '123',
        }),
      ).rejects.toThrow('Username already exists');
    });

    it('should create a new user and return tokens', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValueOnce(null);
      (getUserByEmail as jest.Mock).mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      (createUser as jest.Mock).mockResolvedValue({
        id: 'u1',
        username: 'user1',
      });
      (createSession as jest.Mock).mockResolvedValue({ token: 'refresh123' });

      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        return cb({});
      });

      const result = await authService.registerUser({
        email: 'new@test.com',
        username: 'user1',
        password: '123',
      });

      expect(result).toMatchObject({
        accessToken: 'mockedAccessToken',
        refreshToken: 'refresh123',
        user: { userId: 'u1', username: 'user1' },
      });
    });
  });

  describe('loginUser', () => {
    it('should throw error if email or password is missing', async () => {
      await expect(
        authService.loginUser({ email: '', password: '' }),
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if user is not found', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue(null);
      await expect(
        authService.loginUser({ email: 'x@test.com', password: 'pw' }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password does not match', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue({
        id: 'u1',
        password: 'hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        authService.loginUser({ email: 'x@test.com', password: 'pw' }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should delete existing session and push token session if found', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue({
        id: 'u1',
        username: 'user1',
        password: 'hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (getSessionByUserId as jest.Mock).mockResolvedValue({
        token: 'oldToken',
      });
      (deleteSessionByToken as jest.Mock).mockResolvedValue(undefined);
      (createSession as jest.Mock).mockResolvedValue({ token: 'newToken' });
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        return cb({});
      });
      (getDailyCheckInByUserIdAndDate as jest.Mock).mockResolvedValue(null);

      const result = await authService.loginUser({
        email: 'test@mail.com',
        password: 'pw',
      });

      expect(deleteSessionByToken).toHaveBeenCalledWith(
        'oldToken',
        expect.anything(),
      );
      expect(deleteManyPushTokenByUserId).toHaveBeenCalledWith(
        'u1',
        expect.anything(),
      );
      expect(result).toHaveProperty('refreshToken', 'newToken');
    });

    it('should return tokens and user info when successful', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue({
        id: 'u1',
        username: 'user1',
        password: 'hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (getSessionByUserId as jest.Mock).mockResolvedValue(null);
      (createSession as jest.Mock).mockResolvedValue({ token: 'refresh456' });
      (getDailyCheckInByUserIdAndDate as jest.Mock).mockResolvedValue(null);

      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        return cb({});
      });

      const result = await authService.loginUser({
        email: 'user@test.com',
        password: 'pw',
      });

      expect(result).toMatchObject({
        accessToken: 'mockedAccessToken',
        refreshToken: 'refresh456',
        user: { userId: 'u1', username: 'user1' },
      });
    });
  });

  describe('logoutUser', () => {
    it('should throw if user is not found', async () => {
      (getUserById as jest.Mock).mockResolvedValue(null);
      await expect(authService.logoutUser('u1')).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw if no active session exists', async () => {
      (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
      (getSessionByUserId as jest.Mock).mockResolvedValue(null);
      await expect(authService.logoutUser('u1')).rejects.toThrow(
        'No active session',
      );
    });

    it('should throw if delete transaction fails', async () => {
      (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
      (getSessionByUserId as jest.Mock).mockResolvedValue({ token: 't1' });

      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        throw new Error('Transaction failed');
      });

      await expect(authService.logoutUser('u1')).rejects.toThrow(
        'Failed to logout',
      );
    });

    it('should delete session and push tokens when successful', async () => {
      (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
      (getSessionByUserId as jest.Mock).mockResolvedValue({ token: 't1' });

      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        return cb({});
      });

      await authService.logoutUser('u1');

      expect(deleteSessionByToken).toHaveBeenCalledWith(
        't1',
        expect.anything(),
      );
      expect(deleteManyPushTokenByUserId).toHaveBeenCalledWith(
        'u1',
        expect.anything(),
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should throw if refresh token is missing', async () => {
      await expect(authService.refreshAccessToken('')).rejects.toThrow(
        'Refresh token is required',
      );
    });

    it('should throw if session is not found', async () => {
      (getSessionByToken as jest.Mock).mockResolvedValue(null);
      await expect(authService.refreshAccessToken('bad')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should return new accessToken when successful', async () => {
      (getSessionByToken as jest.Mock).mockResolvedValue({
        userId: 'u1',
        token: 'r1',
      });
      const result = await authService.refreshAccessToken('r1');
      expect(result).toEqual({ accessToken: 'mockedAccessToken' });
    });
  });

  describe('getProfile', () => {
    it('should throw if user is not found', async () => {
      (getUserById as jest.Mock).mockResolvedValue(null);
      await expect(authService.getProfile('u1')).rejects.toThrow(
        'User not found',
      );
    });

    it('should return profile with daily check-in info', async () => {
      (getUserById as jest.Mock).mockResolvedValue({
        id: 'u1',
        username: 'user1',
      });
      (getDailyCheckInByUserIdAndDate as jest.Mock).mockResolvedValue(true);
      const result = await authService.getProfile('u1');
      expect(result).toMatchObject({
        userId: 'u1',
        username: 'user1',
        appConfig: { hasCompletedDailyCheckIn: true },
      });
    });
  });
});
