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
  notificationData?: any | null;
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
  const [notificationData, setNotificationData] = useState<any | null>(null);
  const [pendingRoute, setPendingRoute] = useState<LinkProps['href'] | null>(
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

  const setLastNotification = async () => {
    const lastResponse = await Notifs.getLastNotificationResponseAsync();
    if (lastResponse) {
      const data = lastResponse.notification.request.content
        .data as NotificationData;
      setNotificationData(data);

      if (data.route) {
        setPendingRoute(data.route);
      }
    }
  };

  // ---------- auth side effects ----------
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

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  // ---------- notification (on first mount) ----------

  // redirect to last notification has a route
  useEffect(() => {
    if (isAuthenticated && pendingRoute) {
      router.push(pendingRoute);
      setPendingRoute(null);
    }
  }, [isAuthenticated, pendingRoute]);

  useEffect(() => {
    void setLastNotification(); // * Check for last notification in closed state

    // * what happens when the app is opened in foreground
    notificationListener.current = Notifs.addNotificationReceivedListener(
      (notification) => {
        console.info('Notification received:', notification);
        setNotification(notification);
      },
    );

    // * what happens when the user taps on a notification from background
    responseListener.current = Notifs.addNotificationResponseReceivedListener(
      (response) => {
        console.log('I am here in response listener');
        const data = response.notification.request.content
          .data as NotificationData;

        setNotificationData(data);
        if (data.route) {
          router.push(data.route);
        }
      },
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notification, hasNotificationsEnabled, notificationData }}
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
