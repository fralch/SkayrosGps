import { useState, useRef, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_ACCEPTED_ACCURACY_METERS = 35;
const MAX_ACCEPTED_SPEED_MPS = 60;
const BASE_URL = 'https://sketch3dlab.com';
const LOCATION_TASK_NAME = 'skayros-gps-background-location-task';

const toRadians = (value: number) => (value * Math.PI) / 180;

const isValidCoordinate = (coords: Location.LocationObjectCoords) => {
  if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
    return false;
  }
  if (coords.latitude === 0 && coords.longitude === 0) {
    return false;
  }
  if (Math.abs(coords.latitude) > 90 || Math.abs(coords.longitude) > 180) {
    return false;
  }
  return true;
};

const getDistanceMeters = (
  from: Location.LocationObjectCoords,
  to: Location.LocationObjectCoords
) => {
  const earthRadiusMeters = 6371000;
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(fromLat) * Math.cos(toLat) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
};

const isAcceptedLocation = (
  location: Location.LocationObject,
  previousLocation: Location.LocationObjectCoords | null,
  previousTimestamp: number | null
) => {
  if (!isValidCoordinate(location.coords)) {
    return false;
  }

  const accuracy = location.coords.accuracy ?? Number.POSITIVE_INFINITY;
  if (accuracy > MAX_ACCEPTED_ACCURACY_METERS) {
    return false;
  }

  if (previousTimestamp !== null && location.timestamp <= previousTimestamp) {
    return false;
  }

  if (previousLocation && previousTimestamp !== null) {
    const elapsedSeconds = (location.timestamp - previousTimestamp) / 1000;
    if (elapsedSeconds > 0) {
      const movedMeters = getDistanceMeters(previousLocation, location.coords);
      const speedMps = movedMeters / elapsedSeconds;
      if (speedMps > MAX_ACCEPTED_SPEED_MPS) {
        return false;
      }
    }
  }

  return true;
};

const sendLocationToApi = async (placa: string, location: Location.LocationObject) => {
  const payload = {
    placa,
    latitud: location.coords.latitude,
    longitud: location.coords.longitude,
    timestamp: new Date(location.timestamp).toISOString()
  };

  const response = await fetch(`${BASE_URL}/api/camiones/geolocalizaciones`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
};

let activePlaca: string | null = null;
let lastBackgroundLocation: Location.LocationObjectCoords | null = null;
let lastBackgroundTimestamp: number | null = null;

if (!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error || !data) {
      return;
    }

    // Si la RAM se limpió, activePlaca será null aquí. 
    // Lo recuperamos del almacenamiento.
    if (!activePlaca) {
      activePlaca = await AsyncStorage.getItem('activePlaca');
    }

    if (!activePlaca) {
      return; // Aún nulo significa que el rastreo no está activo.
    }

    const { locations } = data as { locations?: Location.LocationObject[] };
    if (!locations?.length) {
      return;
    }

    for (const location of locations) {
      if (!isAcceptedLocation(location, lastBackgroundLocation, lastBackgroundTimestamp)) {
        continue;
      }

      lastBackgroundLocation = location.coords;
      lastBackgroundTimestamp = location.timestamp;
      try {
        await sendLocationToApi(activePlaca, location);
      } catch {
        // Keep task alive when network fails.
      }
    }
  });
}

export const useTracking = (selectedPlaca: string | null, onRestorePlaca?: (placa: string) => void) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStopModalVisible, setIsStopModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);

  const addLog = useCallback((msg: string) => {
    // console.log(`[useTracking] ${msg}`);
  }, []);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const isRequestingRef = useRef(false);
  const lastAcceptedLocationRef = useRef<Location.LocationObjectCoords | null>(null);
  const lastAcceptedTimestampRef = useRef<number | null>(null);

  const stopTrackingService = useCallback(async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    const hasStartedBackgroundTask = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (hasStartedBackgroundTask) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }

    activePlaca = null;
    await AsyncStorage.removeItem('activePlaca');
    
    lastBackgroundLocation = null;
    lastBackgroundTimestamp = null;
    lastAcceptedLocationRef.current = null;
    lastAcceptedTimestampRef.current = null;
    setIsTracking(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const restoreTrackingState = async () => {
      try {
        const savedPlaca = await AsyncStorage.getItem('activePlaca');
        const hasStartedBackgroundTask = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

        if (!isMounted) return;

        if (savedPlaca && hasStartedBackgroundTask) {
          activePlaca = savedPlaca;
          if (onRestorePlaca) {
            onRestorePlaca(savedPlaca);
          }
          setIsTracking(true);

          if (!locationSubscription.current) {
            locationSubscription.current = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 0,
              },
              (location) => {
                if (!isAcceptedLocation(location, lastAcceptedLocationRef.current, lastAcceptedTimestampRef.current)) {
                  return;
                }
                lastAcceptedLocationRef.current = location.coords;
                lastAcceptedTimestampRef.current = location.timestamp;
                setCurrentLocation(location.coords);
              }
            );
          }
        } else {
          // If state is inconsistent, clean it up
          if (hasStartedBackgroundTask) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          }
          if (savedPlaca) {
            await AsyncStorage.removeItem('activePlaca');
          }
        }
      } catch (error: any) {
        console.warn('Failed to restore tracking state', error);
        const errorMessage = error?.message || String(error);
        Alert.alert('Error Restaurando GPS', `Detalle:\n${errorMessage}`);
      }
    };

    void restoreTrackingState();

    return () => {
      isMounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, []);

  const startTracking = async () => {
    addLog(`startTracking() called. placa=${selectedPlaca}, isTracking=${isTracking}, isRequesting=${isRequestingRef.current}`);

    if (!selectedPlaca) {
      addLog('BLOCKED: selectedPlaca is null/empty');
      Alert.alert('Error', 'Debe seleccionar o ingresar una placa valida para iniciar.');
      return;
    }

    if (isTracking) {
      addLog('BLOCKED: isTracking is already true');
      return;
    }

    if (isRequestingRef.current) {
      addLog('BLOCKED: isRequestingRef is true (duplicate tap?)');
      return;
    }
    isRequestingRef.current = true;

    try {
      addLog('Checking GPS services...');
      const isLocationServiceEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationServiceEnabled) {
        isRequestingRef.current = false;
        addLog('BLOCKED: GPS services disabled');
        Alert.alert('GPS desactivado', 'Activa la geolocalizacion del dispositivo para iniciar.');
        return;
      }
      addLog('GPS services OK');

      addLog('Requesting foreground permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      addLog(`Foreground permission: ${status}`);
      if (status !== 'granted') {
        isRequestingRef.current = false;
        Alert.alert('Permiso denegado', 'Se requieren permisos de ubicacion para esta funcion.');
        return;
      }

      addLog('Requesting background permission...');
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      addLog(`Background permission: ${backgroundStatus}`);
      if (backgroundStatus !== 'granted') {
        isRequestingRef.current = false;
        Alert.alert('Permiso denegado', 'Debes permitir ubicacion en segundo plano para continuar.');
        return;
      }
    } catch (permError: any) {
      isRequestingRef.current = false;
      const msg = permError?.message || String(permError);
      addLog(`ERROR in permissions phase: ${msg}`);
      Alert.alert('Error de permisos', msg);
      return;
    }

    setIsLoading(true);

    try {
      activePlaca = selectedPlaca;
      await AsyncStorage.setItem('activePlaca', selectedPlaca);
      
      lastBackgroundLocation = null;
      lastBackgroundTimestamp = null;

      const hasStartedBackgroundTask = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (!hasStartedBackgroundTask) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 0,
          pausesUpdatesAutomatically: false,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Seguimiento GPS activo',
            notificationBody: 'Enviando ubicacion en segundo plano',
          },
        });
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 0,
        },
        (location) => {
          if (!isAcceptedLocation(location, lastAcceptedLocationRef.current, lastAcceptedTimestampRef.current)) {
            return;
          }

          lastAcceptedLocationRef.current = location.coords;
          lastAcceptedTimestampRef.current = location.timestamp;
          setCurrentLocation(location.coords);
        }
      );

      setIsTracking(true);
      addLog('Tracking started successfully!');
    } catch (e: any) {
      const errorMessage = e?.message || String(e);
      addLog(`ERROR starting tracking: ${errorMessage}`);
      Alert.alert('Error al iniciar', `Detalle del error:\n${errorMessage}`);
      void stopTrackingService();
    } finally {
      setIsLoading(false);
      isRequestingRef.current = false;
    }
  };

  const stopTracking = () => {
    setIsStopModalVisible(true);
  };

  const cancelStopTracking = () => {
    setIsStopModalVisible(false);
  };

  const confirmStopTracking = () => {
    void stopTrackingService();
    setIsStopModalVisible(false);
  };

  return {
    isTracking,
    isLoading,
    isStopModalVisible,
    currentLocation,
    startTracking,
    stopTracking,
    cancelStopTracking,
    confirmStopTracking
  };
};
