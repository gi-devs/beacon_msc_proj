import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Notifs from 'expo-notifications';
import {
  checkLocalStorageAndUpdatePushSetting,
  fetchAndSavePushToken,
  getNotificationPermissions,
} from '@/lib/notification';
import { AppState } from 'react-native';
import { useAuth } from '@/context/authContext';
import { LinkProps, useRouter } from 'expo-router';
import { useIdleTime } from '@/hooks/useIdleTime';
import { AsyncItemKey } from '@/lib/aysncStorage';

type NotificationData = {
  route?: LinkProps['href'];
};

type NotificationContextType = {
  notification: Notifs.Notification | null;
  hasNotificationsEnabled: boolean;
};

type NotificationProviderProps = {
  children: ReactNode;
};

Notifs.setNotificationHandler({
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
  const [notification, setNotification] = useState<Notifs.Notification | null>(
    null,
  );
  const [hasNotificationsEnabled, setHasNotificationsEnabled] = useState(false);
  const { runIfIdleTimeExceeded } = useIdleTime(
    15,
    AsyncItemKey.NotificationIdleCheck,
  );
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  const notificationListener = useRef<Notifs.EventSubscription | null>(null);
  const responseListener = useRef<Notifs.EventSubscription | null>(null);

  const checkAndSetHasNotificationsEnabled = async () => {
    const granted = await getNotificationPermissions();
    setHasNotificationsEnabled(granted);
  };

  const checkPermissions = async (): Promise<{
    granted: boolean;
    wasGranted: boolean;
  }> => {
    const wasGranted = hasNotificationsEnabled;
    const granted = await getNotificationPermissions();
    setHasNotificationsEnabled(granted);
    return { granted, wasGranted };
  };

  useEffect(() => {
    if (isAuthenticated) {
      void fetchAndSavePushToken();
      void checkLocalStorageAndUpdatePushSetting();
      void checkAndSetHasNotificationsEnabled();
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        if (isAuthenticated) {
          void (async () => {
            const { granted, wasGranted } = await checkPermissions();

            if (granted && !wasGranted) {
              void fetchAndSavePushToken();
            }
          })();

          void checkLocalStorageAndUpdatePushSetting();
          void checkAndSetHasNotificationsEnabled();
          void runIfIdleTimeExceeded(() => void fetchAndSavePushToken());
        }
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
  }, [isAuthenticated]);

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
