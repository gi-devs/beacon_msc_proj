import { NextFunction, Request, Response } from 'express';
import { authService } from '@/services/services.auth';
import { CustomError, ErrorCodes } from '@/utils/custom-error';

async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const loginData = await authService.registerUser(req.body);

    res.status(201).json(loginData);
  } catch (e) {
    next(e);
  }
}

async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const loginData = await authService.loginUser(req.body);

    res.status(200).json(loginData);
  } catch (e) {
    next(e);
  }
}

async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    console.log('Logout request received');
    const decoded = req.user as UserPayload;
    const userId = decoded.userId;

    await authService.logoutUser(userId);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (e) {
    next(e);
  }
}

async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const accessToken = await authService.refreshAccessToken(
      req.body.refreshToken,
    );
    res.status(200).json(accessToken);
  } catch (e) {
    next(e);
  }
}

async function profile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const decoded = req.user as UserPayload;
    const user = await authService.getProfile(decoded.userId);

    res.status(200).json(user);
  } catch (e) {
    next(e);
  }
}

export const authController = {
  register,
  login,
  logout,
  refreshToken,
  profile,
};
