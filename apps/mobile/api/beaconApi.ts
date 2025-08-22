import axiosInstance from '@/lib/axios';
import { parseToSeverError } from '@/utils/parseToSeverError';
import { CreateBeaconFormData } from '@beacon/validation';
import {
  BeaconNotificationDTO,
  BeaconRepliesDTOWithUser,
  BeaconReplyDetailsDTO,
  PaginatedResponse,
} from '@beacon/types';

export async function getBeaconReplyDetails(
  id: number,
  beaconNotifId: number,
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

export async function getUserBeaconNotificationsRequest(
  take: number = 10,
  skip: number = 0,
): Promise<PaginatedResponse<BeaconNotificationDTO>> {
  try {
    console.log(
      'Fetching user beacon notifications with take:',
      take,
      'skip:',
      skip,
    );
    const res = await axiosInstance.get(
      `beacon-notification?take=${take}&skip=${skip}`,
    );
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

export async function getSingleBeaconNotificationsRequest(
  id: number,
): Promise<BeaconNotificationDTO> {
  try {
    console.log('Fetching beacon notification with id:', id);
    const res = await axiosInstance.get(`beacon-notification/${id}`);
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    console.log(parseToSeverError(error).message);
    throw error;
  }
}
