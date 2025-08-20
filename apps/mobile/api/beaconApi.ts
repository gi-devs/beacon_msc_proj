import axiosInstance from '@/lib/axios';
import { parseToSeverError } from '@/utils/parseToSeverError';
import { CreateBeaconFormData } from '@beacon/validation';
import {
  BeaconRepliesDTOWithUser,
  BeaconReplyDetailsDTO,
  PaginatedResponse,
} from '@beacon/types';

export async function getBeaconReplyDetails(
  id: string,
  beaconNotifId: string,
): Promise<BeaconReplyDetailsDTO> {
  try {
    const res = await axiosInstance.get(
      `beacon/${id}/notification/${beaconNotifId}`,
    );
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

export async function requestBeaconReply(data: CreateBeaconFormData) {
  try {
    const res = await axiosInstance.post(
      `beacon/${data.beaconId}/notification/${data.beaconNotificationId}`,
      {
        replyTextKey: data.replyTextKey,
        replyTextId: data.replyTextId,
      },
    );
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

// router.post(
//   '/mood-log/:moodLogId/replies',
//   beaconController.beaconRepliesWithMoodLogId,
// );

export async function getBeaconRepliesWithMoodLogIdRequest(
  moodLogId: number,
  take: number = 10,
  skip: number = 0,
): Promise<PaginatedResponse<BeaconRepliesDTOWithUser>> {
  try {
    const res = await axiosInstance.post(
      `beacon/mood-log/${moodLogId}/replies?take=${take}&skip=${skip}`,
    );
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}
