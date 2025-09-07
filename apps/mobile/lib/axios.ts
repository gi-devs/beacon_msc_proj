import axios from 'axios';
import { getStoredAccessToken, refreshAccessToken } from '@/api/authApi';
import { getApiUrl } from '@/constants/apiUrl';

const API_URL = getApiUrl();

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (err) {
        console.log('Token refresh failed:', err);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
