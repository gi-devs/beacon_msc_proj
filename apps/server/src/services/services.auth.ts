import { createUser, getUserByEmail, getUserById } from '@/models/model.user';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { CustomError } from '@/utils/custom-error';
import { LogInData, SignUpData } from '@beacon/validation';

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
  const newUser = await createUser(userData);

  // Generate tokens
  const accessToken = jwt.sign(
    { userId: newUser.id },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' },
  );

  const refreshToken = jwt.sign(
    { userId: newUser.id },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: '7d' },
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

  // Generate tokens
  const accessToken = jwt.sign(
    { userId: userFound.id },
    process.env.JWT_SECRET!,
    {
      expiresIn: '15m',
    },
  );

  const refreshToken = jwt.sign(
    { userId: userFound.id },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: '7d' },
  );

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

async function refreshAccessToken(refreshToken: string) {
  if (!refreshToken) {
    throw new CustomError('Refresh token is required', 401);
  }

  const decoded = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET!,
  ) as JwtPayload;

  if (!decoded.userId) {
    throw new CustomError('Invalid refresh token', 401);
  }

  return jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });
}

async function getProfile(userId: string) {
  const userFound = await getUserById(userId);

  if (!userFound) {
    throw new CustomError('User not found', 404);
  }

  return {
    id: userFound.id,
    email: userFound.email,
    displayName: userFound.username,
  };
}

export const authService = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getProfile,
};
