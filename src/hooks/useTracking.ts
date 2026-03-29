import { useState, useRef, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';

export const useTracking = (selectedPlaca: string | null) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStopModalVisible, setIsStopModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const isRequestingRef = useRef(false);

  const stopTrackingService = useCallback(() => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
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
      timestamp: new Date().toISOString()
    };

    if (__DEV__) {
      console.log('Ubicación actual (modo prueba):', payload);
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
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          setCurrentLocation(location.coords);
          logCurrentLocation(location);
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
    startTracking,
    stopTracking,
    cancelStopTracking,
    confirmStopTracking
  };
};
