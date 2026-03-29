import { useState, useEffect, useRef, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  /** Whether the device currently has internet connectivity */
  isConnected: boolean;
  /** Whether this is the first check (still loading) */
  isLoading: boolean;
  /** True when connection was just recovered (for showing a brief "back online" message) */
  justReconnected: boolean;
  /** Connection type: wifi, cellular, etc. */
  connectionType: string | null;
}

/**
 * Hook that monitors internet connectivity and provides reactive status.
 * 
 * - Shows a warning banner while offline.
 * - Shows a brief "back online" toast when reconnected.
 * - Debounces rapid changes to avoid flickering.
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  const wasDisconnected = useRef(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStateChange = useCallback((state: NetInfoState) => {
    // Clear any pending debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce to avoid flickering on quick state changes
    debounceTimer.current = setTimeout(() => {
      const connected = !!(state.isConnected && state.isInternetReachable !== false);
      
      setConnectionType(state.type ?? null);
      setIsLoading(false);

      if (!connected) {
        // Going offline
        wasDisconnected.current = true;
        setIsConnected(false);
        setJustReconnected(false);

        // Clear any pending reconnect toast
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      } else {
        // Coming online
        setIsConnected(true);

        if (wasDisconnected.current) {
          // Show "back online" briefly
          setJustReconnected(true);
          wasDisconnected.current = false;

          reconnectTimer.current = setTimeout(() => {
            setJustReconnected(false);
            reconnectTimer.current = null;
          }, 3000);
        }
      }
    }, 300);
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleStateChange);

    // Initial check
    NetInfo.fetch().then(handleStateChange);

    return () => {
      unsubscribe();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [handleStateChange]);

  return { isConnected, isLoading, justReconnected, connectionType };
};
