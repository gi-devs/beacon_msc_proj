import axiosInstance from '@/lib/axios';
import { parseToSeverError } from '@/utils/parseToSeverError';

export async function getBeaconReplyDetails(id: string, beaconNotifId: string) {
  try {
    const res = await axiosInstance.get(`/${id}/notification/${beaconNotifId}`);
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}
