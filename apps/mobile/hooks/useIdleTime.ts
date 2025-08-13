import { useRef } from 'react';
import { AsyncItemKey, getAsyncItem, saveAsyncItem } from '@/lib/aysncStorage';

export const useIdleTime = (
  idleTimeMinutes: number,
  idleCheckKey: AsyncItemKey,
) => {
  const idleTimeMsRef = useRef(idleTimeMinutes * 60 * 1000);

  const hasBeenIdle = async () => {
    const lastStr = await getAsyncItem(idleCheckKey);
    const now = Date.now();

    let lastCheck: number;

    if (!lastStr) {
      await saveAsyncItem(idleCheckKey, now.toString());
      return false; // cannot be idle on first check
    } else {
      lastCheck = Number(lastStr);
    }

    const idleTime = now - lastCheck;
    const hasExceededThreshold = idleTime > idleTimeMsRef.current;

    console.log(
      hasExceededThreshold
        ? `Idle time for ${idleCheckKey.replace(/-/g, '')} exceeded threshold`
        : `Idle time for ${idleCheckKey.replace(/-/g, '')}: ${Math.floor(idleTime / 1000)} s, threshold: ${idleTimeMsRef.current / 1000} s`,
    );

    return hasExceededThreshold;
  };

  const runIfIdleTimeExceeded = async (
    callback: () => Promise<void> | void,
  ): Promise<void> => {
    const idleExceeded = await hasBeenIdle();
    if (idleExceeded) {
      await callback();
      await resetIdle(); // reset idle timer after callback
    }
  };

  // reset idle timer
  const resetIdle = async () => {
    const now = Date.now();
    await saveAsyncItem(idleCheckKey, now.toString());
  };

  return { hasBeenIdle, resetIdle, runIfIdleTimeExceeded };
};
