import { useState, useRef, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';

const MAX_ACCEPTED_ACCURACY_METERS = 35;
const MAX_ACCEPTED_SPEED_MPS = 60;
const MAX_LOCATION_LOGS = 60;
const BASE_URL = 'https://sketch3dlab.com';

export interface TrackingLocationLog {
  id: string;
  placa: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: string;
}

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

export const useTracking = (selectedPlaca: string | null) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStopModalVisible, setIsStopModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [locationLogs, setLocationLogs] = useState<TrackingLocationLog[]>([]);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const isRequestingRef = useRef(false);
  const lastAcceptedLocationRef = useRef<Location.LocationObjectCoords | null>(null);
  const lastAcceptedTimestampRef = useRef<number | null>(null);

  const stopTrackingService = useCallback(() => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    lastAcceptedLocationRef.current = null;
    lastAcceptedTimestampRef.current = null;
    setIsTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      stopTrackingService();
    };
  }, [stopTrackingService]);

  const logCurrentLocation = useCallback(async (location: Location.LocationObject) => {
    const payload = {
      placa: selectedPlaca,
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

    if (__DEV__) {
      console.log('Ubicación enviada:', payload);
    }
  }, [selectedPlaca]);

  const startTracking = async () => {
    if (!selectedPlaca) {
      Alert.alert('Error', 'Debe seleccionar o ingresar una placa válida para iniciar.');
      return;
    }

    if (isTracking || locationSubscription.current) {
      return;
    }

    if (isRequestingRef.current) return;
    isRequestingRef.current = true;
    setLocationLogs([]);

    const isLocationServiceEnabled = await Location.hasServicesEnabledAsync();
    if (!isLocationServiceEnabled) {
      isRequestingRef.current = false;
      Alert.alert('GPS desactivado', 'Activa la geolocalización del dispositivo para iniciar.');
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      isRequestingRef.current = false;
      Alert.alert('Permiso Denegado', 'Se requieren permisos de ubicación para esta función.');
      return;
    }

    setIsLoading(true);

    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 0,
        },
        (location) => {
          if (!isValidCoordinate(location.coords)) {
            return;
          }

          const accuracy = location.coords.accuracy ?? Number.POSITIVE_INFINITY;
          if (accuracy > MAX_ACCEPTED_ACCURACY_METERS) {
            return;
          }

          const timestamp = location.timestamp;
          const lastTimestamp = lastAcceptedTimestampRef.current;
          const lastLocation = lastAcceptedLocationRef.current;

          if (lastTimestamp !== null && timestamp <= lastTimestamp) {
            return;
          }

          if (lastLocation && lastTimestamp !== null) {
            const elapsedSeconds = (timestamp - lastTimestamp) / 1000;

            if (elapsedSeconds > 0) {
              const movedMeters = getDistanceMeters(lastLocation, location.coords);
              const speedMps = movedMeters / elapsedSeconds;

              if (speedMps > MAX_ACCEPTED_SPEED_MPS) {
                return;
              }
            }
          }

          lastAcceptedLocationRef.current = location.coords;
          lastAcceptedTimestampRef.current = timestamp;
          setCurrentLocation(location.coords);

          const newLog: TrackingLocationLog = {
            id: `${timestamp}-${location.coords.latitude}-${location.coords.longitude}`,
            placa: selectedPlaca ?? '',
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy ?? null,
            timestamp: new Date(timestamp).toISOString(),
          };

          setLocationLogs((prevLogs) => [newLog, ...prevLogs].slice(0, MAX_LOCATION_LOGS));
          void logCurrentLocation(location).catch(() => {
            if (__DEV__) {
              console.log('No se pudo enviar ubicación');
            }
          });
        }
      );

      setIsTracking(true);

    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar el servicio de ubicación.');
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
    stopTrackingService();
    setIsStopModalVisible(false);
  };

  return {
    isTracking,
    isLoading,
    isStopModalVisible,
    currentLocation,
    locationLogs,
    startTracking,
    stopTracking,
    cancelStopTracking,
    confirmStopTracking
  };
};
