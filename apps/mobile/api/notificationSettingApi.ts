import { CreateNotificationSettingData } from '@beacon/validation';
import axiosInstance from '@/lib/axios';
import { parseToSeverError } from '@/utils/parseToSeverError';

export async function createNotificationSettingRequest(
  data: CreateNotificationSettingData,
) {
  try {
    const res = await axiosInstance.post('/notification-setting', data);
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

export async function updateNotificationSettingRequest(
  data: Partial<CreateNotificationSettingData>,
) {
  try {
    const res = await axiosInstance.patch(`/notification-setting`, data);
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}
