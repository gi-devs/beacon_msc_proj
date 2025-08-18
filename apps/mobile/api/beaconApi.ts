import axiosInstance from '@/lib/axios';
import { parseToSeverError } from '@/utils/parseToSeverError';
import { CreateBeaconFormData } from '@beacon/validation';
import { BeaconReplyDetailsDTO } from '@beacon/types';

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
