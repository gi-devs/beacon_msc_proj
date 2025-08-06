type ServerErrorResponse = {
  message: string;
  statusCode: number;
  code?: string;
};

type UserPayload = {
  userId: string;
  username: string;
  sessionId?: string;
};
