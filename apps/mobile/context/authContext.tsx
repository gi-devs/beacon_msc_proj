import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';

import {
  clearTokens,
  storeAccessToken,
  storeRefreshToken,
} from '@/api/authApi';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';
import { Toast } from 'toastify-react-native';

type AuthContextType = {
  user: UserPayload | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
  ) => Promise<UserPayload | void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const isAuthenticated = !!user;

  // Load user when provider mounts
  // TODO: no need for toast should load user silently and redirect to home if user is authenticated
  useEffect(() => {
    const initialiseAuth = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get('/auth/profile');
        setUser(res.data.user);
        Toast.info('User profile loaded successfully');
      } catch (err: any) {
        Toast.error(err.response.data.message);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initialiseAuth();

    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        await initialiseAuth();
      }
    });

    return () => subscription.remove();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await axiosInstance.post(`/auth/login`, {
        email,
        password,
      });
      setUser(res.data.user);
      await storeAccessToken(res.data.accessToken);
      await storeRefreshToken(res.data.refreshToken);
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      Toast.error(err?.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    username: string,
  ): Promise<UserPayload | void> => {
    return await axiosInstance
      .post(`/auth/register`, {
        email,
        password,
        username,
      })
      .then(async (res) => {
        console.log('Registration with:', {
          email,
          password,
          username,
        });

        if (res.status !== 201) {
          throw new Error('Registration failed');
        }
        setUser(res.data.user);
        await storeAccessToken(res.data.accessToken);
        await storeRefreshToken(res.data.refreshToken);

        return res.data.user as UserPayload;
      })
      .catch((err) => {
        console.error('Registration error:', err);
        Toast.error(err.data.message);
      });
  };

  const logout = async () => {
    setUser(null);
    await clearTokens();
    router.replace('/');
  };
  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, register, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
