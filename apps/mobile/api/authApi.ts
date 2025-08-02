import axios from 'axios';
import { getApiUrl } from '@/constants/apiUrl';
import {
  deleteSecureItem,
  getSecureItem,
  saveSecureItem,
} from '@/api/secureStoreApi';

export const getStoredAccessToken = async () => {
  const accessToken = await getSecureItem('accessToken');

  if (accessToken) {
    return accessToken;
  }
  console.log('Failed to get stored access token');
};

export const storeAccessToken = async (token: string | null | undefined) => {
  if (!token) {
    console.log('Invalid access token provided to storeAccessToken:', token);
    return;
  }

  if (await saveSecureItem('accessToken', token)) {
    console.log('Failed to store access token');
  }
};

export const storeRefreshToken = async (token: string | null | undefined) => {
  if (!token) {
    console.log('Invalid refresh token provided to storeRefreshToken:', token);
    return;
  }

  if (await saveSecureItem('refreshToken', token)) {
    console.log('Failed to store refresh token');
  }
};

export const clearTokens = async () => {
  const accessTokenIsDeleted = await deleteSecureItem('accessToken');
  const refreshTokenIsDeleted = await deleteSecureItem('refreshToken');

  if (!accessTokenIsDeleted || !refreshTokenIsDeleted) {
    console.log('Failed to clear tokens');
    !accessTokenIsDeleted && console.log('Access token deletion failed');
    !refreshTokenIsDeleted && console.log('Refresh token deletion failed');
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = await getSecureItem('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios(`${getApiUrl()}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to refresh token');
    }
    const { accessToken } = response.data;
    await storeAccessToken(accessToken);

    return accessToken;
  } catch (error) {
    console.log('Failed to refresh token:', error);
    return null;
  }
};
