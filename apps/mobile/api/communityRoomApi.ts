import { CommunityPostDTO, PaginatedResponse } from '@beacon/types';
import axiosInstance from '@/lib/axios';
import { parseToSeverError } from '@/utils/parseToSeverError';
import { UserCommunityRoomDTO } from '@beacon/types/dist/community-room';
import { CreateCommunityRoomPostData } from '@beacon/validation';

export async function getUserCommunityRoomsRequest(
  take: number,
  skip: number,
): Promise<PaginatedResponse<UserCommunityRoomDTO>> {
  try {
    const res = await axiosInstance.get(
      `/community-room?take=${take}&skip=${skip}`,
    );
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

export async function getCommunityRoomPostsByRoomIdRequest(
  roomId: string,
  take: number,
  skip: number,
): Promise<PaginatedResponse<CommunityPostDTO>> {
  try {
    const res = await axiosInstance.get(
      `/community-room/${roomId}/posts?take=${take}&skip=${skip}`,
    );
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

export async function getCommunityRoomPostByIdRequest(
  postId: number,
): Promise<CommunityPostDTO> {
  try {
    const res = await axiosInstance.get(`/community-room/posts/${postId}`);
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

export async function createCommunityRoomPostRequest(
  roomId: string,
  data: CreateCommunityRoomPostData,
): Promise<CommunityPostDTO> {
  try {
    const { content, moodFace, title } = data;
    const res = await axiosInstance.post(
      `/community-room/posts/room/${roomId}`,
      {
        title,
        content,
        moodFace,
      },
    );
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

export async function deleteCommunityRoomPostRequest(
  postId: number,
): Promise<{ message: string }> {
  try {
    const res = await axiosInstance.delete(`/community-room/posts/${postId}`);
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}
