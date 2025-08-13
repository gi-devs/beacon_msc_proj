import { CreateLocationSettingData } from '@beacon/validation';
import axiosInstance from '@/lib/axios';
import { parseToSeverError } from '@/utils/parseToSeverError';

export async function createLocationSettingRequest(
  data: CreateLocationSettingData,
) {
  try {
    const res = await axiosInstance.post('/location-setting', data);
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

export async function updateLocationSettingRequest(
  data: Partial<CreateLocationSettingData>,
) {
  try {
    const res = await axiosInstance.patch(`/location-setting`, data);
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}
