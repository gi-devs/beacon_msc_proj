import { UserPayload } from './server';

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserPayload;
};

export type RefreshTokenResponse = {
  accessToken: string;
};
