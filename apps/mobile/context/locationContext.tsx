import React, { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '@/context/authContext';
import { getLocationStatus, pushLocationIfPermitted } from '@/lib/location';
import { useIdleTime } from '@/hooks/useIdleTime';
import { AsyncItemKey } from '@/lib/aysncStorage';

type LocationContextType = {
  location: {
    latitude: number;
    longitude: number;
  } | null;
  setLocation: (
    location: { latitude: number; longitude: number } | null,
  ) => void;

  isLocationEnabled: boolean;
  setIsLocationEnabled: (enabled: boolean) => void;
};

type LocationProviderProps = {
  children: React.ReactNode;
};

const LocationContext = React.createContext<LocationContextType | undefined>(
  undefined,
);

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const { runIfIdleTimeExceeded } = useIdleTime(
    5,
    AsyncItemKey.LocationIdleCheck,
  ); // 5 minutes idle time
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const pushLocation = async () => {
    const isPermitted = await getLocationStatus();
    setIsLocationEnabled(isPermitted);
    await pushLocationIfPermitted(isPermitted);
  };

  useEffect(() => {
    // auth check and push location if idle time exceeded
    const checkAndPush = async () => {
      if (isAuthenticated && !authIsLoading) {
        try {
          await pushLocation();
        } catch (err) {
          console.error('Error pushing location:', err);
        }
      }
    };

    void checkAndPush(); // call async function immediately on mount

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void runIfIdleTimeExceeded(() => checkAndPush());
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, authIsLoading]);

  return (
    <LocationContext.Provider
      value={{ location, setLocation, isLocationEnabled, setIsLocationEnabled }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = React.useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
