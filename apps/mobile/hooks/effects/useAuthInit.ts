import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useIdleTime } from '@/hooks/useIdleTime';
import { AsyncItemKey } from '@/lib/aysncStorage';
import { useAuthStore } from '@/store/useAuthStore';

export function useAuthInit() {
  const initialiseAuth = useAuthStore((s) => s.initialiseAuth);
  const { runIfIdleTimeExceeded } = useIdleTime(15, AsyncItemKey.AuthIdleCheck);

  useEffect(() => {
    void initialiseAuth();

    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        void runIfIdleTimeExceeded(() => initialiseAuth());
      }
    });

    return () => subscription.remove();
  }, []);
}
