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
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
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
  const router = useRouter();
  const isAuthenticated = !!user;

  // Load user when provider mounts
  useEffect(() => {
    const initialiseAuth = async () => {
      try {
        const res = await axiosInstance.get('/auth/profile');
        setUser(res.data.user);
        Toast.info('User profile loaded successfully');
      } catch (err: any) {
        Toast.error(err.response.data.message);
        setUser(null);
      }
    };

    initialiseAuth(); // this is OK

    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        await initialiseAuth();
      }
    });

    return () => subscription.remove();
  }, []);

  const login = async (email: string, password: string) => {
    await axiosInstance
      .post(`/auth/login`, {
        email,
        password,
      })
      .then(async (res) => {
        setUser(res.data.user);
        await storeAccessToken(res.data.accessToken);
        await storeRefreshToken(res.data.refreshToken);
      })
      .catch((err) => {
        console.error('Registration error:', err);
        Toast.error(err.data.message);
      });
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
      value={{ user, login, logout, register, isAuthenticated }}
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
