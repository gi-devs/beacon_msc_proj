import '@/lib/notifications'; // This import is to run the notification handler setup code
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import * as Notifs from 'expo-notifications';
import type { Notification } from 'expo-notifications';
import { fetchAndSavePushToken } from '@/lib/requestNotificationPermissions';
import { AppState } from 'react-native';
import { useAuth } from '@/context/authContext';

type NotificationContextType = {
  notification: Notification | null;
  hasNotificationsEnabled: boolean;
};

type NotificationProviderProps = {
  children: ReactNode;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [hasNotificationsEnabled, setHasNotificationsEnabled] = useState(false);
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();

  const notificationListener = useRef<Notifs.EventSubscription | null>(null);
  const responseListener = useRef<Notifs.EventSubscription | null>(null);

  const fetchTokenIfNeeded = async () => {
    const permissions = await Notifs.getPermissionsAsync();
    const isGranted = permissions.status === 'granted';
    setHasNotificationsEnabled(isGranted);

    if (!isAuthenticated)
      return console.warn(
        'User not authenticated, skipping notification token fetch',
      );

    await fetchAndSavePushToken(); // this will fetch and save the token if permissions are granted and token is not already saved
  };

  useEffect(() => {
    fetchTokenIfNeeded();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !authIsLoading) {
        fetchTokenIfNeeded();
      }
    });

    notificationListener.current = Notifs.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      },
    );

    responseListener.current = Notifs.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('🔔 Notification tapped, data:', data);
      },
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
      subscription.remove();
    };
  }, [isAuthenticated, authIsLoading]);

  return (
    <NotificationContext.Provider
      value={{ notification, hasNotificationsEnabled }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
};
