import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Notifs from 'expo-notifications';
import { Notification, setNotificationHandler } from 'expo-notifications';
import { fetchAndSavePushToken } from '@/lib/notification';
import { AppState } from 'react-native';
import { useAuth } from '@/context/authContext';
import { LinkProps, useRouter } from 'expo-router';
import { useIdleTime } from '@/hooks/useIdleTime';
import { AsyncItemKey } from '@/lib/aysncStorage';

type NotificationData = {
  route?: LinkProps['href'];
};

type NotificationContextType = {
  notification: Notification | null;
  hasNotificationsEnabled: boolean;
};

type NotificationProviderProps = {
  children: ReactNode;
};

setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: false,
  }),
});

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [hasNotificationsEnabled, setHasNotificationsEnabled] = useState(false);
  const { runIfIdleTimeExceeded } = useIdleTime(
    15,
    AsyncItemKey.NotificationIdleCheck,
  );
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  const notificationListener = useRef<Notifs.EventSubscription | null>(null);
  const responseListener = useRef<Notifs.EventSubscription | null>(null);

  const fetchTokenIfNeeded = async () => {
    const permissions = await Notifs.getPermissionsAsync();
    const isGranted = permissions.status === 'granted';
    setHasNotificationsEnabled(isGranted);

    await fetchAndSavePushToken(); // this will fetch and save the token if permissions are granted and token is not already saved
  };

  useEffect(() => {
    // auth check and fetch token if needed
    const checkAndFetchToken = async () => {
      if (isAuthenticated && !authIsLoading) {
        await fetchTokenIfNeeded();
      }
    };

    void checkAndFetchToken();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void runIfIdleTimeExceeded(() => checkAndFetchToken());
      }
    });

    // * what happens when the app is opened in foreground
    notificationListener.current = Notifs.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      },
    );

    // * what happens when the user taps on a notification
    responseListener.current = Notifs.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content
          .data as NotificationData;

        if (data.route) {
          router.push(data.route);
        }
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
