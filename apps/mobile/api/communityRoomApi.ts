import { PaginatedResponse } from '@beacon/types';
import axiosInstance from '@/lib/axios';
import { parseToSeverError } from '@/utils/parseToSeverError';
import { UserCommunityRoomDTO } from '@beacon/types/dist/community-room';

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
