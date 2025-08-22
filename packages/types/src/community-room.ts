import { UserPayloadReduced } from './server';

export type CommunityPostDTO = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  moodFace: number;
  postUser: UserPayloadReduced;
};

export type UserCommunityRoomDTO = {
  id: string;
  roomName: string;
  expired: boolean;
  createdAt: Date;
  members: UserPayloadReduced[];
};
