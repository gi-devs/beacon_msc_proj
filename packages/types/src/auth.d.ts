type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserPayload;
};

type RefreshTokenResponse = {
  accessToken: string;
};
