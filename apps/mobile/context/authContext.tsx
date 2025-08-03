import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import axiosInstance from '@/lib/axios';

import {
  clearTokens,
  logoutSession,
  storeAccessToken,
  storeRefreshToken,
} from '@/api/authApi';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';
import { Toast } from 'toastify-react-native';
import { deleteSecureItem } from '@/lib/secureStore';

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
  const lastCheckRef = useRef(Date.now());
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
        console.log('Initialising authentication...');
        const res = await axiosInstance.get('/auth/profile');
        setUser(res.data);
      } catch (err: any) {
        console.log('Error during auth initialisation:', err);
        setUser(null);
      } finally {
        console.log('Authentication initialisation complete');
        setIsLoading(false);
      }
    };

    initialiseAuth();

    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        console.log('App is active, checking authentication status...');
        const now = Date.now();
        const idleTime = now - lastCheckRef.current;

        let shouldReinitialise = false;
        if (idleTime > 15 * 60 * 1000) {
          console.log(
            'More than 15 minutes since last check, reinitialising auth...',
          );
          await initialiseAuth();
          shouldReinitialise = true;
        }

        shouldReinitialise
          ? console.log('Reinitialised auth after idle time')
          : console.log('No reinitialisation needed');

        lastCheckRef.current = now;
      }
    });

    return () => subscription.remove();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Logging in with:', {
      email,
      password,
    });
    try {
      const res = await axiosInstance.post(`/auth/login`, {
        email,
        password,
      });
      setUser(res.data.user);
      await storeAccessToken(res.data.accessToken);
      await storeRefreshToken(res.data.refreshToken);

      router.push('/(home)');
      return true;
    } catch (err: any) {
      console.log('Login error:', err);
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

        router.push('/(home)');
        return res.data.user as UserPayload;
      })
      .catch((err) => {
        console.log('Registration error:', err);
        Toast.error(err.data.message);
      });
  };

  const logout = async () => {
    const isLoggedOut = await logoutSession();
    if (isLoggedOut) {
      setUser(null);
      await clearTokens();
      await deleteSecureItem('pushToken');
    } else {
      Toast.error('Failed to log out');
    }
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
