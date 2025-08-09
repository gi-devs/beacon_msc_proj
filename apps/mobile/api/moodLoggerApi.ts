import { CreateMoodLogData } from '@beacon/validation';
import axiosInstance from '@/lib/axios';
import { parseToSeverError } from '@/utils/parseToSeverError';

// Mood log
export async function createMoodLogRequest(data: CreateMoodLogData) {
  try {
    const res = await axiosInstance.post('/mood-log', data);
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

export async function getMoodLogsRequest() {
  try {
    const res = await axiosInstance.get('/mood-log');
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

// Journal entry
