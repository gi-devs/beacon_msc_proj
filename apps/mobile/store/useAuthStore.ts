import { create } from 'zustand';
import axiosInstance from '@/lib/axios';
import {
  clearTokens,
  getStoredRefreshToken,
  logoutSession,
  storeAccessToken,
  storeRefreshToken,
} from '@/api/authApi';
import { deleteSecureItem, SecureItemKey } from '@/lib/secureStore';
import { Toast } from 'toastify-react-native';
import { useRouter } from 'expo-router';
import { UserPayload } from '@beacon/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notification from 'expo-notifications';

type AuthState = {
  user: UserPayload | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // ----- Actions -----
  setUser: (user: UserPayload | null) => void;
  initialiseAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    username: string,
  ) => Promise<UserPayload | void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => {
  const router = useRouter();

  return {
    user: null,
    isLoading: true,
    isAuthenticated: false,

    setUser: (user) => {
      set({ user, isAuthenticated: !!user });
    },

    initialiseAuth: async () => {
      try {
        set({ isLoading: true });
        console.log('Initialising authentication...');
        const res = await axiosInstance.get('/auth/profile');
        set({ user: res.data, isAuthenticated: true });
      } catch (err: any) {
        const status = err?.response?.status;
        const message =
          err?.response?.data?.message ||
          'Issue with finding your profile, please log in again.';
        const refreshToken = await getStoredRefreshToken();

        if (status === 401 && refreshToken) {
          await clearTokens();
          await deleteSecureItem(SecureItemKey.PushToken);
          Toast.warn(message);
        }

        console.log('Error during authentication initialisation:', err);
        set({ user: null, isAuthenticated: false });
      } finally {
        console.log('Authentication initialisation complete');
        set({ isLoading: false });
      }
    },

    login: async (email, password) => {
      try {
        const res = await axiosInstance.post(`/auth/login`, {
          email,
          password,
        });
        set({ user: res.data.user, isAuthenticated: true });
        await storeAccessToken(res.data.accessToken);
        await storeRefreshToken(res.data.refreshToken);

        router.push('/(home)');
        return true;
      } catch (err: any) {
        console.log('Login error:', err);
        Toast.error(err?.response?.data?.message || 'Login failed');
        return false;
      }
    },

    register: async (email, password, username) => {
      try {
        const res = await axiosInstance.post(`/auth/register`, {
          email,
          password,
          username,
        });

        if (res.status !== 201) {
          throw new Error('Registration failed');
        }

        set({ user: res.data.user, isAuthenticated: true });
        await storeAccessToken(res.data.accessToken);
        await storeRefreshToken(res.data.refreshToken);

        router.push('/(home)');
        return res.data.user as UserPayload;
      } catch (err: any) {
        console.log('Registration error:', err);
        Toast.error(err?.response?.data?.message || 'Registration failed');
      }
    },

    logout: async () => {
      const isLoggedOut = await logoutSession();
      const allAsyncKeys = await AsyncStorage.getAllKeys();
      if (isLoggedOut) {
        set({ user: null, isAuthenticated: false });
        // remove all keys except 'onboarding-complete'
        allAsyncKeys.forEach((key: string) => {
          if (!key.includes('beacon-onboarding-complete')) {
            AsyncStorage.removeItem(key);
          }
        });

        const secureKeys = Object.values(SecureItemKey) as SecureItemKey[];
        await Promise.all(secureKeys.map((key) => deleteSecureItem(key)));

        await Notification.cancelAllScheduledNotificationsAsync();
      } else {
        Toast.error('Failed to log out');
      }
    },
  };
});
