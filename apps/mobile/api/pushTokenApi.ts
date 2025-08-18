import axiosInstance from '@/lib/axios';

export async function syncPushToken(pushToken: string) {
  try {
    await axiosInstance.post('/push-token/sync', {
      pushToken,
    });
  } catch (error) {
    console.error('Failed to sync push token:', error);
    throw new Error('Failed to sync push token');
  }
}
