import {
  CreateDailyLogData,
  CreateJournalEntryData,
  CreateMoodLogData,
} from '@beacon/validation';
import axiosInstance from '@/lib/axios';
import { parseToSeverError } from '@/utils/parseToSeverError';
import { MoodLogWithBeaconCheck, PaginatedResponse } from '@beacon/types';

// ----------------------
//        Mood log
// ----------------------
export async function createMoodLogRequest(data: CreateMoodLogData) {
  try {
    const res = await axiosInstance.post('/mood-log', data);
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

export async function getMoodLogsRequest(
  take: number,
  skip: number,
): Promise<PaginatedResponse<MoodLogWithBeaconCheck>> {
  try {
    const res = await axiosInstance.get(`/mood-log?take=${take}&skip=${skip}`);
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

// ------------------------
//      Journal entry
// ------------------------
export async function createJournalEntryRequest(data: CreateJournalEntryData) {
  try {
    const res = await axiosInstance.post('/journal-entry', data);
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}

// -------------------------
//        Daily log
// -------------------------

export async function createDailyLogRequest(data: CreateDailyLogData) {
  try {
    const res = await axiosInstance.post('/daily-log', data);
    return res.data;
  } catch (error) {
    console.log(parseToSeverError(error).message);
    throw error;
  }
}
