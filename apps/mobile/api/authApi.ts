import axios from 'axios';
import { getApiUrl } from '@/constants/apiUrl';
import {
  deleteSecureItem,
  getSecureItem,
  saveSecureItem,
  SecureItemKey,
} from '@/lib/secureStore';
import axiosInstance from '@/lib/axios';

export const getStoredAccessToken = async () => {
  const accessToken = await getSecureItem(SecureItemKey.AccessToken);

  if (accessToken) {
    return accessToken;
  }
  console.log('Failed to get stored access token');
};

export const getStoredRefreshToken = async () => {
  const refreshToken = await getSecureItem(SecureItemKey.RefreshToken);

  if (refreshToken) {
    return refreshToken;
  }
  console.log('Failed to get stored access token');
};

export const storeAccessToken = async (token: string | null | undefined) => {
  if (!token) {
    console.log('Invalid access token provided to storeAccessToken:', token);
    return;
  }

  if (await saveSecureItem(SecureItemKey.AccessToken, token)) {
    console.log('Access token stored successfully');
    return;
  }
  console.log('Failed to store access token');
};

export const storeRefreshToken = async (token: string | null | undefined) => {
  if (!token) {
    console.log('Invalid refresh token provided to storeRefreshToken:', token);
    return;
  }

  if (await saveSecureItem(SecureItemKey.RefreshToken, token)) {
    console.log('Refresh token stored successfully');
    return;
  }
  console.log('Failed to store refresh token');
};

export const clearTokens = async () => {
  const accessTokenIsDeleted = await deleteSecureItem(
    SecureItemKey.AccessToken,
  );
  const refreshTokenIsDeleted = await deleteSecureItem(
    SecureItemKey.RefreshToken,
  );

  if (!accessTokenIsDeleted || !refreshTokenIsDeleted) {
    console.log('Failed to clear tokens');
    !accessTokenIsDeleted && console.log('Access token deletion failed');
    !refreshTokenIsDeleted && console.log('Refresh token deletion failed');
    return false;
  }
  return true;
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = await getStoredRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios(`${getApiUrl()}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        refreshToken,
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

export const logoutSession = async () => {
  try {
    const res = await axiosInstance.delete('/auth/logout');
    if (res.status !== 200) {
      throw new Error('Failed to logout session');
    }

    return true;
  } catch (error) {
    console.error('Failed to logout session:', error);
    return false;
  }
};
