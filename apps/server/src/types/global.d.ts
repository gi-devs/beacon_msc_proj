type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    displayName: string;
  };
};

type UserPayload = {
  userId: string;
  username: string;
};
