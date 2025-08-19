export type ServerErrorResponse = {
  message: string;
  statusCode: number;
  code?: string;
};

export type UserPayload = {
  userId: string;
  username: string;
  sessionId?: string;
  appConfig?: {
    hasCompletedDailyCheckIn: boolean;
  };
};

export type DataRequestOptions = {
  skip?: number;
  take?: number;
  order?: {
    createdAt: 'asc' | 'desc';
  };
};
