import { createUser, getUserByEmail, getUserById } from '@/models/model.user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CustomError } from '@/utils/custom-error';
import { LogInData, SignUpData } from '@beacon/validation';
import { addDays } from 'date-fns';
import {
  createSession,
  deleteSessionByToken,
  getSessionByToken,
  getSessionByUserId,
} from '@/models/models.session';
import prisma from '@/lib/prisma';
import { deleteManyPushTokenByUserId } from '@/models/model.pushToken';

async function registerUser(
  data: Omit<SignUpData, 'confirmPassword'>,
): Promise<LoginResponse> {
  const { email, username, password } = data;
  if (!email || !password || !username) {
    throw new CustomError('Missing required fields', 400);
  }

  const lowercasedEmail = email.toLowerCase();

  // Check if user already exists
  const existingUserEmail = await getUserByEmail(lowercasedEmail);
  if (existingUserEmail) {
    throw new CustomError('SignUp already exists', 409);
  }

  const existingUsername = await getUserByEmail(username);
  if (existingUsername) {
    throw new CustomError('Username already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user and return inserted row
  const userData = {
    email: lowercasedEmail,
    username,
    password: hashedPassword,
  };

  const { newUser, refreshToken, accessToken } = await prisma.$transaction(
    async (tx) => {
      const newUser = await createUser(userData, tx);

      const session = await createSession(
        {
          userId: newUser.id,
          expiresAt: addDays(new Date(), 7), // Set session expiration to 7 days
        },
        tx,
      );

      // Generate tokens
      const accessToken = createAccessToken(newUser.id, session.token);

      return { newUser, refreshToken: session.token, accessToken };
    },
  );

  // Respond with tokens and user info
  return {
    accessToken,
    refreshToken,
    user: {
      userId: newUser.id,
      username: newUser.username,
    },
  };
}

async function loginUser(data: LogInData): Promise<LoginResponse> {
  const { email, password } = data;

  if (!email || !password) {
    throw new CustomError('SignUp and password are required', 400);
  }

  const lowercasedEmail = email.toLowerCase();

  // Fetch user by email
  const userFound = await getUserByEmail(lowercasedEmail);

  if (!userFound) {
    throw new CustomError('Invalid credentials', 401);
  }

  // Check if user exists and password matches
  if (!userFound || !(await bcrypt.compare(password, userFound.password))) {
    throw new CustomError('Invalid credentials', 401);
  }

  const { refreshToken, accessToken } = await prisma.$transaction(
    async (tx) => {
      const existingSession = await getSessionByUserId(userFound.id, tx);

      if (existingSession) {
        await deleteSessionByToken(existingSession.token, tx);
        await deleteManyPushTokenByUserId(userFound.id, tx);
      }

      // Create a new session
      const session = await createSession(
        {
          userId: userFound.id,
          expiresAt: addDays(new Date(), 7), // Set session expiration to 7 days
        },
        tx,
      );

      // Generate tokens
      const accessToken = createAccessToken(userFound.id, session.token);

      return { refreshToken: session.token, accessToken: accessToken };
    },
  );

  console.log({ accessToken, refreshToken });

  // Respond with tokens and user info
  return {
    accessToken,
    refreshToken,
    user: {
      userId: userFound.id,
      username: userFound.username,
    },
  };
}

async function logoutUser(userId: string): Promise<void> {
  const userFound = await getUserById(userId);

  if (!userFound) {
    throw new CustomError('User not found', 404);
  }

  const session = await getSessionByUserId(userId);
  if (!session) {
    throw new CustomError('No active session found', 404);
  }

  // things that must happen on logout
  try {
    await prisma.$transaction(async (tx) => {
      // Delete the session
      await deleteSessionByToken(session.token, tx);
      // Delete the push token if it exists
      await deleteManyPushTokenByUserId(userId, tx);
    });
  } catch (error) {
    console.error('Error during logout transaction:', error);
    throw new CustomError('Failed to logout', 500);
  }
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshTokenResponse> {
  if (!refreshToken) {
    throw new CustomError('Refresh token is required', 400);
  }

  const session = await getSessionByToken(refreshToken);

  if (!session) {
    throw new CustomError('Invalid refresh token', 401);
  }

  const accessToken = createAccessToken(session.userId, session.token);

  return {
    accessToken,
  };
}

async function getProfile(userId: string) {
  const userFound = await getUserById(userId);

  if (!userFound) {
    throw new CustomError('User not found', 404);
  }

  return {
    id: userFound.id,
    email: userFound.email,
    username: userFound.username,
  };
}

export const authService = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getProfile,
};

function createAccessToken(userId: string, sessionId: string): string {
  return jwt.sign({ userId, sessionId }, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });
}
