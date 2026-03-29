import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';

const POLL_INTERVAL_MS = 2500;
const DEBOUNCE_MS = 300;
const JUST_ENABLED_MS = 3000;

export interface LocationServiceStatus {
  isLocationEnabled: boolean;
  isLoading: boolean;
  justEnabled: boolean;
}

export const useLocationServiceStatus = (): LocationServiceStatus => {
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [justEnabled, setJustEnabled] = useState(false);

  const wasDisabledRef = useRef(false);
  const enabledTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnabledChange = useCallback((enabled: boolean) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setIsLoading(false);

      if (!enabled) {
        wasDisabledRef.current = true;
        setIsLocationEnabled(false);
        setJustEnabled(false);

        if (enabledTimer.current) {
          clearTimeout(enabledTimer.current);
          enabledTimer.current = null;
        }
        return;
      }

      setIsLocationEnabled(true);

      if (wasDisabledRef.current) {
        setJustEnabled(true);
        wasDisabledRef.current = false;
        enabledTimer.current = setTimeout(() => {
          setJustEnabled(false);
          enabledTimer.current = null;
        }, JUST_ENABLED_MS);
      }
    }, DEBOUNCE_MS);
  }, []);

  const checkLocationServices = useCallback(async () => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      handleEnabledChange(enabled);
    } catch {
      handleEnabledChange(false);
    }
  }, [handleEnabledChange]);

  useEffect(() => {
    checkLocationServices();

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkLocationServices();
      }
    });

    const pollTimer = setInterval(checkLocationServices, POLL_INTERVAL_MS);

    return () => {
      appStateSubscription.remove();
      clearInterval(pollTimer);
      if (enabledTimer.current) clearTimeout(enabledTimer.current);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [checkLocationServices]);

  return { isLocationEnabled, isLoading, justEnabled };
};
