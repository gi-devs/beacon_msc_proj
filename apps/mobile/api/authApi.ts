import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { getApiUrl } from '@/constants/apiUrl';

export const getStoredAccessToken = async () => {
  try {
    return await SecureStore.getItemAsync('accessToken');
  } catch (error) {
    console.log('Failed to get stored token:', error);
    return null;
  }
};

export const storeAccessToken = async (token: string | null | undefined) => {
  if (!token) {
    console.log('Invalid access token provided to storeAccessToken:', token);
    return;
  }

  try {
    await SecureStore.setItemAsync('accessToken', token);
  } catch (error) {
    console.log('Failed to store token:', error);
  }
};

export const storeRefreshToken = async (token: string | null | undefined) => {
  if (!token) {
    console.log('Invalid refresh token provided to storeRefreshToken:', token);
    return;
  }

  try {
    await SecureStore.setItemAsync('refreshToken', token);
  } catch (error) {
    console.log('Failed to store refresh token:', error);
  }
};

export const clearTokens = async () => {
  try {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  } catch (error) {
    console.log('Failed to clear tokens:', error);
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
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
